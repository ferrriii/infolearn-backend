import mongoose from 'mongoose'

const schema = mongoose.Schema({
  textId: [mongoose.Schema.Types.ObjectId],
  views: { type: Number, default: 0 },
  lastView: { type: Number, default: Date.now }
}, {
  timestamps: true
})

export default mongoose.model('View', schema)
