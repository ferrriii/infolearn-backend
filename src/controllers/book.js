import User from '../models/user.js'
import Book from '../models/book.js'
import Response from '../modules/response.js'
import Mongoose from 'mongoose'
const ObjectId = Mongoose.Types.ObjectId

async function books (req, res) {
  const userId = req.authToken.sub
  const user = await User.findById(userId)
  const userBooks = await Book.aggregate([
    {
      $match: {
        author: new ObjectId(userId)
      }
    },
    {
      $project: {
        _id: 0,
        id: '$_id',
        title: 1,
        description: 1,
        lastText: 1
      }
    }
  ])
  const userBooksWithSubscription = userBooks.map(book => {
    if (user.subscription.includes(book.id)) {
      book.subscribed = true
    } else {
      book.subscribed = false
    }
    return book
  })
  Response(res).success(userBooksWithSubscription)

/*
const userBooks = await Book.aggregate([
  {
 $match: {
   author: new ObjectId(userId)
 }
  },
  {
 // merge all subcribed books into each book
 $lookup:
  {
    from: 'users',
    pipeline: [
   { $project: { _id: 0, subscription: 1 } }
    ],
    as: 'holidays'
  }
  },
  { $unwind: '$holidays' }, // holidays will be an array as result of lookup, let's unwind it
  { $addFields: { holidays: '$holidays.subscription' } }, // subscriptions are nested, let's extract them
  { $unwind: '$holidays' },
  {
 $group: {
   _id: '$_id',
   text: { $first: '$title' },
   description: { $first: '$description' },
   lastText: { $first: '$lastText' },
   author: { $first: '$author' },
   subscribed: { $max: { $eq: ['$holidays', '$_id'] } }
 }
  }
])
*/
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
  const query = req.body.q

  const books = await Book.aggregate([
    {
      $match: {
        $text: { $search: query }
      }
    },
    { $sort: { score: { $meta: 'textScore' } } },
    { $limit: 10 },
    {
      // merge all subcribed books into each book
      $lookup:
  {
    from: 'users',
    pipeline: [
      { $project: { _id: 0, subscription: 1 } }
    ],
    as: 'subscribedBooks'
  }
    },
    { $unwind: { path: '$subscribedBooks', preserveNullAndEmptyArrays: true } }, // subscribedBooks will be an array as result of lookup, let's unwind it
    {
      $addFields: { subscribedBooks: '$subscribedBooks.subscription', score: { $meta: 'textScore' } }
    }, // subscriptions are nested, let's extract them
    { $unwind: { path: '$subscribedBooks', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        title: { $first: '$title' },
        description: { $first: '$description' },
        lastText: { $first: '$lastText' },
        author: { $first: '$author' },
        score: { $first: '$score' },
        subscribed: { $max: { $eq: ['$subscribedBooks', '$_id'] } }
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
        score: 1,
        subscribed: 1
      }
    },
    { $sort: { score: -1 } }
  ])

  Response(res).success(books)
}

export default {
  books,
  createBook,
  searchBooks
}
