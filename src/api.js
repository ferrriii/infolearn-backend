import cors from 'cors'
import express from 'express'
import bodyParser from 'body-parser'
import auth from './controllers/authentication.js'
import routes from './controllers/app.js'
import textController from './controllers/text.js'
import bookController from './controllers/book.js'

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/register', auth.register)
app.post('/publish', auth.checkAuth, textController.publish)
app.post('/subscribe', auth.checkAuth, routes.subscribe)
app.post('/unsubscribe', auth.checkAuth, routes.unsubscribe)
app.get('/my/books', auth.checkAuth, bookController.books)
app.post('/text/next', auth.checkAuth, textController.nextTexts)
app.post('/books', auth.checkAuth, bookController.createBook)
app.post('/search/books', auth.checkAuth, bookController.searchBooks)
app.post('/read', auth.checkAuth, textController.readText)

export default app
