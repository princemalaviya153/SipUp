import express from 'express'
import Fruit from '../models/Fruit.js'

const router = express.Router()

// Seed fruits (without Tender Coconut as requested)
const seedFruits = [
  { name: 'Watermelon', isPremium: false },
  { name: 'Orange', isPremium: false },
  { name: 'Grapes', isPremium: false },
  { name: 'Kiwi', isPremium: true },
  { name: 'Chikoo', isPremium: false },
  { name: 'Pineapple', isPremium: false },
  { name: 'Strawberry', isPremium: true },
  { name: 'Guava', isPremium: false },
  { name: 'Blueberry', isPremium: true }
]

router.post('/seed', async (req, res) => {
  try {
    const count = await Fruit.countDocuments()
    if (count === 0) {
      const items = await Fruit.insertMany(seedFruits)
      res.json({ message: 'Fruits seeded successfully', count: items.length })
    } else {
      res.json({ message: 'Fruits already seeded', count })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all fruits
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.available === 'true') {
      filter.isAvailable = { $ne: false }
    }
    const items = await Fruit.find(filter).sort({ name: 1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Toggle availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const item = await Fruit.findById(req.params.id)
    
    if (!item) {
      return res.status(404).json({ error: 'Fruit not found' })
    }

    item.isAvailable = !item.isAvailable
    const updatedItem = await item.save()
    res.json(updatedItem)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Add new fruit
router.post('/', async (req, res) => {
  try {
    const { name, isPremium } = req.body
    
    // Check if fruit already exists
    const existingFruit = await Fruit.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
    if (existingFruit) {
      return res.status(400).json({ error: 'Fruit with this name already exists' })
    }

    const item = new Fruit({
      name,
      isPremium: isPremium || false,
      isAvailable: true
    })

    const savedItem = await item.save()
    res.status(201).json(savedItem)
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Fruit with this name already exists' })
    } else {
      res.status(400).json({ error: error.message })
    }
  }
})

export default router
