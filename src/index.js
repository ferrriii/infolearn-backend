import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import auth from './controllers/authentication.js'
import routes from './controllers/app.js'
import textController from './controllers/text.js'
import bookController from './controllers/book.js'

mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGO_DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false, // DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()`
  useCreateIndex: true
}).then(() => {
  console.log('Successfully connected to the database')
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err)
  process.exit()
})

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/register', auth.register)
app.post('/publish', auth.checkAuth, textController.publish)
app.post('/subscribe', auth.checkAuth, routes.subcribe)
app.get('/my/books', auth.checkAuth, bookController.books)
app.get('/text/next', auth.checkAuth, textController.nextTexts)
app.post('/books', auth.checkAuth, bookController.createBook)
app.post('/search/books', auth.checkAuth, bookController.searchBooks)
app.post('/read', auth.checkAuth, textController.readText)

app.listen(process.env.PORT, () =>
  console.log(`app listening on port ${process.env.PORT}!`)
)
