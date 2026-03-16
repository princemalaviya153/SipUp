import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  basePrice: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['juice', 'shake', 'plate'],
    required: true
  },
  baseFruit: {
    type: String,
    default: null
  },
  allowCustomization: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isBestseller: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

export default mongoose.model('MenuItem', menuItemSchema)
