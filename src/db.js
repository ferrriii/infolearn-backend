import mongoose from 'mongoose'

function connectToDb (url) {
  mongoose.Promise = global.Promise
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, // DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()`
    useCreateIndex: true
  })
}

export default {
  connect: connectToDb
}
