import express from 'express'
import Order from '../models/Order.js'

const router = express.Router()

// Get order counter
let orderCounter = 0

// Initialize order counter from latest order
Order.findOne().sort({ orderId: -1 }).exec()
  .then((latestOrder) => {
    if (latestOrder) {
      const match = latestOrder.orderId.match(/SIPUP-(\d+)/)
      if (match) {
        orderCounter = parseInt(match[1])
      }
    }
  })
  .catch((err) => console.error('Error initializing order counter:', err))

// Generate order ID
const generateOrderId = () => {
  orderCounter++
  return `SIPUP-${String(orderCounter).padStart(3, '0')}`
}

// Reset all orders and revenue
router.delete('/reset', async (req, res) => {
  try {
    await Order.deleteMany({})
    orderCounter = 0
    res.json({ message: 'All orders and revenue data have been reset successfully.' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create a new order
router.post('/', async (req, res) => {
  try {
    const { customerName, phone, address, items, total, paymentMode } = req.body

    const order = new Order({
      orderId: generateOrderId(),
      customerName,
      phone,
      address,
      items,
      total,
      paymentMode,
      status: 'New'
    })

    const savedOrder = await order.save()
    res.status(201).json(savedOrder)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get active orders (not completed, not edited, not cancelled)
router.get('/active', async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $in: ['New', 'Preparing', 'Ready'] }
    }).sort({ timestamp: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get completed orders
router.get('/completed', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'Completed' }).sort({ timestamp: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get edited orders
router.get('/edited', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'Edited' }).sort({ timestamp: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get cancelled orders
router.get('/cancelled', async (req, res) => {
  try {
    const orders = await Order.find({ status: 'Cancelled' }).sort({ timestamp: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get orders by phone number
router.get('/phone/:phone', async (req, res) => {
  try {
    const phone = req.params.phone
    const orders = await Order.find({
      phone: { $regex: phone.replace('+', '\\+'), $options: 'i' }
    }).sort({ timestamp: -1 })
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get today's sales
router.get('/sales/today', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const orders = await Order.find({
      status: 'Completed',
      timestamp: { $gte: today, $lt: tomorrow }
    })

    const total = orders.reduce((sum, order) => sum + order.total, 0)
    res.json({ total, count: orders.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get week's sales
router.get('/sales/week', async (req, res) => {
  try {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const orders = await Order.find({
      status: 'Completed',
      timestamp: { $gte: weekAgo }
    })

    const total = orders.reduce((sum, order) => sum + order.total, 0)
    res.json({ total, count: orders.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update order status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Reset all orders and revenue
router.delete('/reset', async (req, res) => {
  try {
    await Order.deleteMany({})
    orderCounter = 0
    res.json({ message: 'All orders have been successfully resetted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Edit order
router.put('/:id/edit', async (req, res) => {
  try {
    const { items, total } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Don't allow editing completed or cancelled orders
    if (order.status === 'Completed' || order.status === 'Cancelled') {
      return res.status(400).json({ error: 'Cannot edit a completed or cancelled order' })
    }

    // Save current state to edit history
    order.editHistory.push({
      editedAt: new Date(),
      previousItems: order.items,
      previousTotal: order.total
    })

    // Update order
    order.items = items
    order.total = total
    order.status = 'Edited'

    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Cancel order
router.patch('/:id/cancel', async (req, res) => {
  try {
    const { reason } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    if (order.status === 'Completed') {
      return res.status(400).json({ error: 'Cannot cancel a completed order' })
    }

    order.status = 'Cancelled'
    order.cancelReason = reason || 'No reason provided'
    order.cancelledAt = new Date()

    const updatedOrder = await order.save()
    res.json(updatedOrder)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
