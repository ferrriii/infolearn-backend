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
    return Response(res).error(403, 'Forbidden!')
  }
  book.lastText = text
  book.save()
  saveText(text, userId, bookId)
  Response(res).success()
}

async function textsToLearn (userObj, timeOffsets = {}) {
  const textPromises = []
  userObj.subscription.forEach(bookIdString => {
    const bookId = new ObjectId(bookIdString)
    let lastRead = userObj.lastRead[bookIdString] || 0
    const bookTimeOffset = timeOffsets[bookIdString] || 0
    if (bookTimeOffset > lastRead) {
      lastRead = bookTimeOffset
    }
    textPromises.push(textToLearnInBook(userObj, bookId, lastRead))
  })

  const texts = await Promise.all(textPromises)
  return texts.flat()
}

function textToLearnInBook (userObj, bookId, timeOffset) {
  const filter = {
    book: bookId,
    time: {
      $gt: timeOffset
    }
  }

  return Text.aggregate([
    { $match: filter },
    { $sort: { time: 1 } },
    { $limit: 5 },
    ...textPreparationPipeline(userObj),
    { $sort: { time: 1 } }
  ])
}

function textsToReview (userObj, count = 10) {
  return View.aggregate([
    { $match: { userId: userObj._id } },
    {
      $lookup: {
        from: 'texts',
        localField: 'textId',
        foreignField: '_id',
        as: 'text'
      }
    },
    { $unwind: '$text' },
    { $sort: { views: 1 } },
    { $limit: count + 5 }, // indicate tolerance with +
    { $sample: { size: count } },
    { $replaceRoot: { newRoot: '$text' } },
    ...textPreparationPipeline(userObj)
  ])
}

async function nextTexts (req, res) {
  const userId = req.authToken.sub
  const user = await User.findById(userId)
  // preset with an empty object in case time is not provided
  const offsets = { ...req.body.time }

  const newTexts = await textsToLearn(user, offsets)
  let cnt = Number.parseInt((newTexts.length || 40) * 0.4)
  cnt = Math.max(1, cnt)
  const oldTexts = await textsToReview(user, cnt)
  newTexts.splice(1, 0, ...oldTexts)
  Response(res).success(newTexts)
}

async function readText (req, res) {
  const userId = req.authToken.sub
  const text = req.body.text
  const textBookId = text.book.id
  const user = await User.findById(userId)
  const userLastRead = user.lastRead[textBookId] || 0
  if (text.time > userLastRead) {
    user.lastRead[textBookId] = text.time
    user.markModified('lastRead')
    user.save()
  }

  await View.updateOne(
    {
      textId: new ObjectId(text.id),
      userId: user._id
    },
    {
      $inc: { views: 1 },
      $set: { lastView: TimeStamp() }
    },
    { upsert: true }
  )

  Response(res).success()
}

async function likeText (req, res) {
  const userId = req.authToken.sub
  const textId = req.params.id

  await Text.findOneAndUpdate(
    { _id: textId },
    { $addToSet: { likes: new ObjectId(userId) } }
  )
  Response(res).success()
}

async function removeLikeText (req, res) {
  const userId = req.authToken.sub
  const textId = req.params.id

  await Text.findOneAndUpdate(
    { _id: textId },
    { $pull: { likes: new ObjectId(userId) } }
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
  readText,
  likeText,
  removeLikeText
}
