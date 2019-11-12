import User from '../models/user.js'
import Response from '../modules/response.js'
import Mongoose from 'mongoose'
const ObjectId = Mongoose.Types.ObjectId

export default {
  async subcribe (req, res) {
    const userId = req.authToken.sub
    const bookId = req.body.book
    const filter = { _id: userId }
    const update = { $addToSet: { subscription: new ObjectId(bookId) } }
    console.log(update)
    const u = await User.findOneAndUpdate(filter, update)
    console.log(u)
    Response(res).success()
  }
}
