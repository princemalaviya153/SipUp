import express from 'express'
import Order from '../models/Order.js'
import Settings from '../models/Settings.js'
import { rateLimiter } from '../utils/ratelimit.js'

const router = express.Router()

// Get order counter
let orderCounter = null

// Generate order ID
const getNextOrderId = async () => {
  if (orderCounter === null) {
    try {
      const latestOrder = await Order.findOne().sort({ orderId: -1 })
      if (latestOrder) {
        const match = latestOrder.orderId.match(/SIPUP-(\d+)/)
        if (match) {
          orderCounter = parseInt(match[1])
        } else {
          orderCounter = 0
        }
      } else {
        orderCounter = 0
      }
    } catch (err) {
      console.error('Error initializing order counter:', err)
      orderCounter = 0
    }
  }
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

// Telegram Notification
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

const sendTelegramNotification = async (order) => {
  try {
    const itemsList = order.items
      .map(item => `  • ${item.quantity}x ${item.customName || item.name}`)
      .join('\n')

    const message = [
      '🧃 *New Order Received!*',
      '',
      `📦 *Order ID:* ${order.orderId}`,
      `👤 *Customer:* ${order.customerName}`,
      `📱 *Phone:* ${order.phone}`,
      `🏠 *Address:* ${order.address || 'Not provided'}`,
      '',
      '🛒 *Items:*',
      itemsList,
      '',
      `💰 *Total:* ₹${order.total}`,
      `🕐 *Time:* ${new Date(order.timestamp).toLocaleString('en-IN')}`,
    ].join('\n')

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    })
  } catch (err) {
    console.error('Telegram notification failed:', err.message)
  }
}

// Create a new order
router.post('/', async (req, res) => {
  try {
    // Apply IP-based rate limiting if ratelimiter is configured
    if (rateLimiter) {
      // Get real IP from standard deployment headers or fallback to local
      const ip = req.headers["x-real-ip"] || req.headers["x-forwarded-for"]?.split(",")[0].trim() || "127.0.0.1"
      
      const { success, reset } = await rateLimiter.limit(ip)
      
      if (!success) {
        const retryAfterSeconds = Math.ceil((reset - Date.now()) / 1000)
        const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60)
        return res.status(429).json({
          error: `You have placed the maximum of 3 orders allowed per hour from your location. Please try again in ${retryAfterMinutes} minute(s).`,
          retryAfter: retryAfterSeconds
        })
      }
    }

    // Check if ordering is enabled
    let settings = await Settings.findOne({ id: 'global_settings' })
    if (settings && !settings.isOrderingEnabled) {
      return res.status(403).json({ error: 'Order service is temporarily disabled' })
    }

    const { customerName, phone, address, items, total, paymentMode } = req.body

    const orderId = await getNextOrderId()
    const order = new Order({
      orderId,
      customerName,
      phone,
      address,
      items,
      total,
      paymentMode,
      status: 'New'
    })

    const savedOrder = await order.save()

    // Send Telegram notification (non-blocking)
    sendTelegramNotification(savedOrder)

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

// Delete single order
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    res.json({ message: 'Order successfully deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
