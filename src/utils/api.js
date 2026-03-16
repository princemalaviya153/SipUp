const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Helper function to handle API errors
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }))
    throw new Error(error.error || 'API request failed')
  }
  return response.json()
}

export const api = {
  // Orders
  createOrder: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
    return handleResponse(response)
  },

  getOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`)
    return handleResponse(response)
  },

  getActiveOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/active`)
    return handleResponse(response)
  },

  getCompletedOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/completed`)
    return handleResponse(response)
  },

  getEditedOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/edited`)
    return handleResponse(response)
  },

  getCancelledOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/cancelled`)
    return handleResponse(response)
  },

  getOrdersByPhone: async (phone) => {
    const response = await fetch(`${API_BASE_URL}/orders/phone/${encodeURIComponent(phone)}`)
    return handleResponse(response)
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    return handleResponse(response)
  },

  editOrder: async (orderId, data) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  cancelOrder: async (orderId, reason) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })
    return handleResponse(response)
  },

  getTodaySales: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/sales/today`)
    return handleResponse(response)
  },

  getWeekSales: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/sales/week`)
    return handleResponse(response)
  },

  resetAllData: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/reset`, {
      method: 'DELETE',
    })
    return handleResponse(response)
  },

  // Menu
  getMenuItems: async () => {
    const response = await fetch(`${API_BASE_URL}/menu`)
    return handleResponse(response)
  },

  getJuicesAndShakes: async (availableOnly = false) => {
    const url = availableOnly
      ? `${API_BASE_URL}/menu/juices-shakes?available=true`
      : `${API_BASE_URL}/menu/juices-shakes`
    const response = await fetch(url)
    return handleResponse(response)
  },

  getFruitPlates: async (availableOnly = false) => {
    const url = availableOnly
      ? `${API_BASE_URL}/menu/plates?available=true`
      : `${API_BASE_URL}/menu/plates`
    const response = await fetch(url)
    return handleResponse(response)
  },

  addMenuItem: async (data) => {
    const response = await fetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  updateMenuItem: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  deleteMenuItem: async (id) => {
    const response = await fetch(`${API_BASE_URL}/menu/${id}`, {
      method: 'DELETE',
    })
    return handleResponse(response)
  },

  toggleMenuAvailability: async (id) => {
    const response = await fetch(`${API_BASE_URL}/menu/${id}/availability`, {
      method: 'PATCH',
    })
    return handleResponse(response)
  },

  seedMenu: async () => {
    const response = await fetch(`${API_BASE_URL}/menu/seed`, {
      method: 'POST',
    })
    return handleResponse(response)
  },

  resetAllData: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/reset`, {
      method: 'DELETE',
    })
    return handleResponse(response)
  },
}
