import mongoose from 'mongoose'

const schema = mongoose.Schema({
  textId: [mongoose.Schema.Types.ObjectId],
  views: { type: Number, default: 0 },
  lastView: { type: Number, default: Date.now }
}, {
  timestamps: true
})

schema.index({ lastView: 1 })
schema.index({ textId: 1 })

export default mongoose.model('View', schema)
