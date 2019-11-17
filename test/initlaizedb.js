import 'dotenv/config'
import mongoose from 'mongoose'
import db from '../src/db.js'

async function initialize () {
  await db.connect(process.env.MONGO_TEST_DB_URL)
  return clear()
}

async function clear () {
  return mongoose.connection.db.dropDatabase()
}

export default {
  initialize,
  clear
}
