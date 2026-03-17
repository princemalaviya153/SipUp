import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import orderRoutes from './routes/orders.js'
import menuRoutes from './routes/menu.js'
import fruitRoutes from './routes/fruits.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dev:dev@sipup.vyu5hra.mongodb.net/sipup?retryWrites=true&w=majority'

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  })

// Routes
app.use('/api/orders', orderRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/fruits', fruitRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SipUp API is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the other process or change the port.`)
    console.error(`   To find and kill the process: Get-NetTCPConnection -LocalPort ${PORT} | Select-Object OwningProcess`)
  } else {
    console.error('❌ Server error:', err)
  }
  process.exit(1)
})
