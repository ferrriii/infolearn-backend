import mongoose from 'mongoose'

const schema = mongoose.Schema({
  text: String,
  book: mongoose.Schema.Types.ObjectId,
  author: mongoose.Schema.Types.ObjectId,
  likes: [mongoose.Schema.Types.ObjectId],
  views: { type: Number, default: 0 },
  time: { type: Number, default: Date.now }
}, {
  timestamps: true
})

schema.index({ book: 1 })
schema.index({ time: 1 })

export default mongoose.model('Text', schema)
