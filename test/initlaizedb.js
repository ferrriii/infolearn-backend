import 'dotenv/config'
import mongoose from 'mongoose'
import db from '../src/db.js'

async function initialize () {
  return db.connect(process.env.MONGO_TEST_DB_URL)
}

async function clear () {
  return mongoose.connection.db.dropDatabase()
}

export default {
  initialize,
  clear
}
