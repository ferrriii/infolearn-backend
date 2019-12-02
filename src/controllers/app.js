import User from '../models/user.js'
import Response from '../modules/response.js'
import Mongoose from 'mongoose'
const ObjectId = Mongoose.Types.ObjectId

export default {
  async subscribe (req, res) {
    const userId = req.authToken.sub
    const bookId = req.body.book
    const filter = { _id: userId }
    const update = {
      $addToSet: { subscription: new ObjectId(bookId) }
    }
    await User.findOneAndUpdate(filter, update)
    Response(res).success()
  },

  async unsubscribe (req, res) {
    const userId = req.authToken.sub
    const bookId = req.body.book
    const filter = { _id: userId }
    const update = {
      $pull: { subscription: new ObjectId(bookId) }
    }
    await User.findOneAndUpdate(filter, update)
    Response(res).success()
  }
}
