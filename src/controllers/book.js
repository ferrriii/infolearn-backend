import Book from '../models/book.js'
import Response from '../modules/response.js'
import Mongoose from 'mongoose'
const ObjectId = Mongoose.Types.ObjectId

function bookPipeline (currentUserId, extendedFields = []) {
  const extendedGroups = {}
  const extendedProject = {}
  extendedFields.forEach(f => {
    extendedGroups[f] = { $first: `$${f}` }
    extendedProject[f] = 1
  })
  return [
    {
      // merge all subcribed books into each book
      $lookup:
      {
        from: 'users',
        pipeline: [
          {
            $project: {
              _id: 0,
              subscription: { $cond: { if: { $eq: ['$_id', currentUserId] }, then: '$subscription', else: [] } }
            }
          }
        ],
        as: 'subscribedBooks'
      }
    },
    { $unwind: { path: '$subscribedBooks', preserveNullAndEmptyArrays: true } }, // subscribedBooks will be an array as result of lookup, let's unwind it
    {
      $addFields: { subscribedBooks: '$subscribedBooks.subscription' }
    },
    // subscriptions are nested, let's extract them
    { $unwind: { path: '$subscribedBooks', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        title: { $first: '$title' },
        description: { $first: '$description' },
        lastText: { $first: '$lastText' },
        author: { $first: '$author' },
        subscribed: { $max: { $eq: ['$subscribedBooks', '$_id'] } },
        ...extendedGroups
      }
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        title: 1,
        description: 1,
        lastText: 1,
        author: 1,
        subscribed: 1,
        ...extendedProject
      }
    }
  ]
}

async function books (req, res) {
  const userId = new ObjectId(req.authToken.sub)
  const userBooks = await Book.aggregate([
    {
      $match: {
        author: userId
      }
    },
    ...bookPipeline(userId)
  ])

  Response(res).success(userBooks)
}

async function createBook (req, res) {
  const title = req.body.title
  const description = req.body.description
  const userId = req.authToken.sub

  const bookObj = new Book({
    title,
    description,
    author: new ObjectId(userId)
  })

  // Save in the database
  const book = await bookObj.save()

  const newBook = {
    id: book._id,
    title: book.title,
    description: book.description,
    lastText: null,
    subscribed: false
  }

  Response(res).success(newBook)
}

async function searchBooks (req, res) {
  const userId = new ObjectId(req.authToken.sub)
  const query = req.body.q

  const books = await Book.aggregate([
    {
      $match: {
        $text: { $search: query }
      }
    },
    { $sort: { score: { $meta: 'textScore' } } },
    { $limit: 30 },
    {
      $addFields: { score: { $meta: 'textScore' } }
    }, // subscriptions are nested, let's extract them
    ...bookPipeline(userId, ['score']),
    { $sort: { score: -1 } }
  ])

  Response(res).success(books)
}

async function topBooks (req, res) {
  const userId = new ObjectId(req.authToken.sub)

  const books = await Book.aggregate([

    { $sort: { updatedAt: 1 } },
    { $limit: 30 },
    ...bookPipeline(userId)
  ])

  Response(res).success(books)
}

export default {
  books,
  createBook,
  searchBooks,
  topBooks
}
