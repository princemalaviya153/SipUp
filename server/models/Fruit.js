import mongoose from 'mongoose'

const fruitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

export default mongoose.model('Fruit', fruitSchema)
