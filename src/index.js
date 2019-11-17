import 'dotenv/config'
import api from './api.js'
import db from './db.js'

db.connect(process.env.MONGO_DB_URL).then(() => {
  console.log('Successfully connected to the database')
}).catch(err => {
  console.log('Could not connect to the database. Exiting now...', err)
  process.exit()
})

api.listen(process.env.PORT, () =>
  console.log(`app listening on port ${process.env.PORT}!`)
)
