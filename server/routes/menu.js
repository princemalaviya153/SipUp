import express from 'express'
import MenuItem from '../models/MenuItem.js'

const router = express.Router()

// Seed menu items (run once to populate database)
const menuItems = [
  { id: 1, name: 'Watermelon Juice', basePrice: 80, category: 'juice', baseFruit: 'Watermelon' },
  { id: 2, name: 'Watermelon Mojito (w/ Sprite)', basePrice: 100, category: 'juice', baseFruit: 'Watermelon' },
  { id: 3, name: 'Orange Juice', basePrice: 70, category: 'juice', baseFruit: 'Orange' },
  { id: 4, name: 'Orange + Grapes', basePrice: 90, category: 'juice', baseFruit: 'Orange' },
  { id: 5, name: 'Orange + Kiwi', basePrice: 90, category: 'juice', baseFruit: 'Orange' },
  { id: 6, name: 'Chikoo Shake', basePrice: 85, category: 'shake', baseFruit: 'Chikoo' },
  { id: 7, name: 'Chikoo Shake + Vanilla Ice Cream', basePrice: 110, category: 'shake', baseFruit: 'Chikoo' },
  { id: 8, name: 'Pineapple Juice', basePrice: 75, category: 'juice', baseFruit: 'Pineapple' },
  { id: 9, name: 'Pineapple + Grapes', basePrice: 95, category: 'juice', baseFruit: 'Pineapple' },
  { id: 10, name: 'Pineapple + Kiwi', basePrice: 95, category: 'juice', baseFruit: 'Pineapple' },
  { id: 11, name: 'Strawberry Juice', basePrice: 90, category: 'juice', baseFruit: 'Strawberry' },
  { id: 12, name: 'Strawberry + Kiwi/Grapes/Blueberry', basePrice: 110, category: 'juice', baseFruit: 'Strawberry' },
  { id: 13, name: 'Guava Juice', basePrice: 70, category: 'juice', baseFruit: 'Guava' },
  { id: 14, name: 'Guava Mojito (w/ Sprite)', basePrice: 95, category: 'juice', baseFruit: 'Guava' },
  { id: 15, name: 'Guava + Grapes', basePrice: 90, category: 'juice', baseFruit: 'Guava' },
  { id: 16, name: 'Guava + Pineapple', basePrice: 95, category: 'juice', baseFruit: 'Guava' },
  { id: 17, name: 'Guava + Kiwi', basePrice: 95, category: 'juice', baseFruit: 'Guava' },
  { id: 18, name: 'Kiwi Juice', basePrice: 100, category: 'juice', baseFruit: 'Kiwi' },
  { id: 19, name: 'Kiwi with Blueberry', basePrice: 140, category: 'juice', baseFruit: 'Kiwi' },
  { id: 20, name: 'Kiwi with Strawberry', basePrice: 120, category: 'juice', baseFruit: 'Kiwi' },
  { id: 21, name: 'Kiwi Strawberry Blueberry', basePrice: 130, category: 'juice', baseFruit: 'Kiwi' },
  { id: 22, name: 'Tender Coconut Shake (w/ Milk)', basePrice: 85, category: 'shake', baseFruit: 'Tender Coconut' },
  { id: 23, name: 'Tender Coconut Shake (w/ Milk + Vanilla Ice Cream)', basePrice: 110, category: 'shake', baseFruit: 'Tender Coconut' },
  { id: 24, name: 'Mix Fruit Juice', basePrice: 70, category: 'juice', allowCustomization: true },
  { id: 25, name: 'Small Fruit Plate', basePrice: 60, category: 'plate' },
  { id: 26, name: 'Premium Fruit Plate', basePrice: 100, category: 'plate' },
]

// Seed menu items
router.post('/seed', async (req, res) => {
  try {
    await MenuItem.deleteMany({})
    const items = await MenuItem.insertMany(menuItems)
    res.json({ message: 'Menu items seeded successfully', count: items.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all menu items (optionally filter by availability)
router.get('/', async (req, res) => {
  try {
    const filter = {}
    if (req.query.available === 'true') {
      filter.isAvailable = { $ne: false }
    }
    const items = await MenuItem.find(filter).sort({ id: 1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get juices and shakes (only available for customer view)
router.get('/juices-shakes', async (req, res) => {
  try {
    const filter = { category: { $in: ['juice', 'shake'] } }
    if (req.query.available === 'true') {
      filter.isAvailable = { $ne: false }
    }
    const items = await MenuItem.find(filter).sort({ id: 1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get fruit plates (only available for customer view)
router.get('/plates', async (req, res) => {
  try {
    const filter = { category: 'plate' }
    if (req.query.available === 'true') {
      filter.isAvailable = { $ne: false }
    }
    const items = await MenuItem.find(filter).sort({ id: 1 })
    res.json(items)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add new menu item
router.post('/', async (req, res) => {
  try {
    const { name, basePrice, category, baseFruit, allowCustomization } = req.body
    
    // Auto-generate next ID
    const lastItem = await MenuItem.findOne().sort({ id: -1 })
    const nextId = lastItem ? lastItem.id + 1 : 1

    const item = new MenuItem({
      id: nextId,
      name,
      basePrice,
      category,
      baseFruit: baseFruit || null,
      allowCustomization: allowCustomization || false,
      isAvailable: true
    })

    const savedItem = await item.save()
    res.status(201).json(savedItem)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update menu item
router.put('/:id', async (req, res) => {
  try {
    const { name, basePrice, category, baseFruit, allowCustomization } = req.body
    const item = await MenuItem.findOneAndUpdate(
      { id: parseInt(req.params.id) },
      { name, basePrice, category, baseFruit, allowCustomization },
      { new: true }
    )

    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' })
    }

    res.json(item)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Toggle availability
router.patch('/:id/availability', async (req, res) => {
  try {
    const item = await MenuItem.findOne({ id: parseInt(req.params.id) })
    
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' })
    }

    item.isAvailable = !item.isAvailable
    const updatedItem = await item.save()
    res.json(updatedItem)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Toggle bestseller
router.patch('/:id/bestseller', async (req, res) => {
  try {
    const item = await MenuItem.findOne({ id: parseInt(req.params.id) })
    
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' })
    }

    item.isBestseller = !item.isBestseller
    const updatedItem = await item.save()
    res.json(updatedItem)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete menu item
router.delete('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({ id: parseInt(req.params.id) })
    
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' })
    }

    res.json({ message: 'Menu item deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
