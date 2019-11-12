import mongoose from 'mongoose'

const schema = mongoose.Schema({
  title: String,
  description: { type: String, default: null },
  author: mongoose.Schema.Types.ObjectId,
  lastText: { type: String, default: null }
}, {
  timestamps: true
})

schema.index({ title: 'text', description: 'text' })

export default mongoose.model('Book', schema)
