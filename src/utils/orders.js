import { api } from './api'

export const saveOrder = async (order) => {
  try {
    const savedOrder = await api.createOrder(order)
    return savedOrder.orderId
  } catch (error) {
    console.error('Error saving order:', error)
    throw error
  }
}

export const getOrders = async () => {
  try {
    return await api.getOrders()
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export const getOrdersByPhone = async (phone) => {
  try {
    return await api.getOrdersByPhone(phone)
  } catch (error) {
    console.error('Error fetching orders by phone:', error)
    return []
  }
}

export const editOrder = async (orderId, data) => {
  try {
    return await api.editOrder(orderId, data)
  } catch (error) {
    console.error('Error editing order:', error)
    throw error
  }
}

export const cancelOrder = async (orderId, reason) => {
  try {
    return await api.cancelOrder(orderId, reason)
  } catch (error) {
    console.error('Error cancelling order:', error)
    throw error
  }
}

export const getEditedOrders = async () => {
  try {
    return await api.getEditedOrders()
  } catch (error) {
    console.error('Error fetching edited orders:', error)
    return []
  }
}

export const getCancelledOrders = async () => {
  try {
    return await api.getCancelledOrders()
  } catch (error) {
    console.error('Error fetching cancelled orders:', error)
    return []
  }
}

export const updateOrderStatus = async (orderId, status) => {
  try {
    return await api.updateOrderStatus(orderId, status)
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

export const getTodaySales = async () => {
  try {
    const sales = await api.getTodaySales()
    return sales.total || 0
  } catch (error) {
    console.error('Error fetching today sales:', error)
    return 0
  }
}

export const getWeekSales = async () => {
  try {
    const sales = await api.getWeekSales()
    return sales.total || 0
  } catch (error) {
    console.error('Error fetching week sales:', error)
    return 0
  }
}

export const resetAllData = async () => {
  try {
    return await api.resetAllData()
  } catch (error) {
    console.error('Error resetting all data:', error)
    throw error
  }
}
