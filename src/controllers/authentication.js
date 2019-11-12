import User from '../models/user.js'
import Book from '../models/book.js'
import Response from '../modules/response.js'
import jwt from 'jsonwebtoken'
import Mongoose from 'mongoose'

export default {
  checkAuth (req, res, next) {
    try {
      const auth = req.headers.authorization
      const token = auth.substr(auth.indexOf(' ') + 1)
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      req.authToken = decoded
    } catch (e) {
      return Response(res).error(401, 'Authentication required')
    }
    next()
  },
  async register (req, res) {
    const deviceId = req.body.deviceId
    if (!deviceId || deviceId <= 0) {
      return Response(res).error(400, 'invalid device id')
    }

    try {
      // query to find deviceId
      const user = await findUserByDevice(deviceId)
      if (user && user._id) {
        // if found and there's no pass return jwtToken
        const token = userToken(user)
        return Response(res).success({ token })
      }
      // if found and there's pass return failed
      // if not found register and return jwt

      const savedUser = await saveUser({ deviceId })
      saveBook('notes', savedUser._id)
      const token = userToken(savedUser)
      Response(res).success({ token })
    } catch (e) {
      console.error(e)
      Response(res).exception(e)
    }
  }
}

function findUserByDevice (deviceId) {
  return User.findOne({ deviceId })
}

function saveUser ({ deviceId }) {
  const user = new User({
    deviceId
  })

  // Save in the database
  return user.save()
}

function saveBook (book, userId) {
  const ObjectId = Mongoose.Types.ObjectId
  const bookObj = new Book({
    title: book,
    description: 'your note book',
    author: new ObjectId(userId)
  })

  // Save in the database
  return bookObj.save()
}

function userToken (user) {
  const jwtToken = { sub: user._id }
  return jwt.sign(jwtToken, process.env.JWT_SECRET)
}
