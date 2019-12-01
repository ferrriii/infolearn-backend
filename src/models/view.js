import mongoose from 'mongoose'

const schema = mongoose.Schema({
  userId: [mongoose.Schema.Types.ObjectId],
  textId: [mongoose.Schema.Types.ObjectId],
  views: { type: Number, default: 0 },
  lastView: { type: Number, default: Date.now }
}, {
  timestamps: true
})

schema.index({ userId: 1 })
schema.index({ views: 1 })
schema.index({ textId: 1 })

export default mongoose.model('View', schema)
