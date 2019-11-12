import User from '../models/user.js'
import Text from '../models/text.js'
import View from '../models/view.js'
import Book from '../models/book.js'
import Response from '../modules/response.js'
import TimeStamp from '../modules/iuid.js'
import Mongoose from 'mongoose'
const ObjectId = Mongoose.Types.ObjectId

function textPreparationPipeline (userObj) {
  return [
    {
      $lookup: {
        localField: 'author',
        from: 'users',
        foreignField: '_id',
        as: 'author'
      }
    },
    {
      $lookup: {
        localField: 'book',
        from: 'books',
        foreignField: '_id',
        as: 'book'
      }
    },
    { $unwind: '$author' },
    { $unwind: '$book' },
    // unwined likes and group to find if user has liked the text
    { $unwind: { path: '$likes', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        text: { $first: '$text' },
        book: { $first: '$book' },
        author: { $first: '$author' },
        time: { $first: '$time' },
        createdAt: { $first: '$createdAt' },
        likes: { $push: { $cond: [{ $eq: ['$likes', 0] }, '$noval', '$likes'] } },
        liked: { $max: { $eq: ['$likes', userObj._id] } }
      }
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        text: 1,
        numberOfLikes: { $cond: { if: { $isArray: '$likes' }, then: { $size: '$likes' }, else: 'NA' } },
        createdAt: 1,
        time: 1,
        likes: 1,
        liked: 1,
        'author.id': '$author._id',
        'author.name': 1,
        'author.deviceId': { $toLong: '$author.deviceId' },
        'book.id': '$book._id',
        'book.title': 1,
        'book.description': 1
      }
    }
  ]
}

async function publish (req, res) {
  const text = req.body.text
  const userId = req.authToken.sub
  const bookId = req.body.book
  const book = await Book.findById(bookId)
  // TODO: error handling
  if (book.author.toString() !== userId) {
    console.log(book.author, userId, typeof book.author, book.author.toString())
    return Response(res).error(403, 'Forbidden!')
  }
  book.lastText = text
  book.save()
  saveText(text, userId, bookId)
  Response(res).success()
}

function textsToLearn (userObj, timeOffset) {
  const userSubscriptions = userObj.subscription.map(s => new ObjectId(s))
  const filter = {
    book: { $in: userSubscriptions },
    time: {
      $gt: timeOffset
    }
  }

  return Text.aggregate([
    { $match: filter },
    { $sort: { time: 1 } },
    { $limit: 12 },
    ...textPreparationPipeline(userObj),
    { $sort: { time: 1 } }
  ])
}

function textsToReview (userObj) {
  return View.aggregate([
    {
      $lookup: {
        from: 'texts',
        localField: 'textId',
        foreignField: '_id',
        as: 'text'
      }
    },
    { $unwind: '$text' },
    { $sort: { lastView: 1 } },
    { $limit: 20 },
    { $sample: { size: 15 } },
    { $replaceRoot: { newRoot: '$text' } },
    ...textPreparationPipeline(userObj)
  ])
}

async function nextTexts (req, res) {
  const userId = req.authToken.sub
  const user = await User.findById(userId)
  const time = Number.parseInt(req.query.time)
  let timeOffset = user.lastRead
  if (time) {
    timeOffset = time
  }
  console.log(time, timeOffset)

  const newTexts = await textsToLearn(user, timeOffset)
  const oldTexts = await textsToReview(user)
  newTexts.splice(1, 0, ...oldTexts)
  Response(res).success(newTexts)
}

async function readText (req, res) {
  const userId = req.authToken.sub
  const text = req.body.text
  const user = await User.findById(userId)
  if (text.time > user.lastRead) {
    user.lastRead = text.time
    user.save()
  }

  await View.updateOne(
    { textId: new ObjectId(text.id) },
    {
      $inc: { views: 1 },
      $set: { lastView: TimeStamp() }
    },
    { upsert: true }
  )

  Response(res).success()
}

function saveText (text, author, book) {
  const txtObj = new Text({
    text,
    author,
    book,
    time: TimeStamp()
  })

  // Save in the database
  return txtObj.save()
}

export default {
  publish,
  nextTexts,
  readText
}
