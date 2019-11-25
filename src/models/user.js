import mongoose from 'mongoose'

const schema = mongoose.Schema({
  deviceId: Number,
  uid: { type: String, default: null },
  email: { type: String, default: null },
  name: { type: String, default: null },
  password: { type: String, default: null },
  subscription: [mongoose.Schema.Types.ObjectId],
  lastRead: { type: Object, default: {} }
}, {
  timestamps: true
})

schema.virtual('timestampMs').get(function () {
  return this.timestamp.getTime()
})

export default mongoose.model('User', schema)
