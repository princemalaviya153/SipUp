import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Edit3, XCircle, ArrowLeft, Package, Clock, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Trash2, Plus, Minus } from 'lucide-react'
import { getOrdersByPhone, editOrder, cancelOrder } from '../utils/orders'
import { api } from '../utils/api'

const statusColors = {
  'New': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Package },
  'Preparing': { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  'Ready': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  'Edited': { bg: 'bg-purple-100', text: 'text-purple-700', icon: Edit3 },
  'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  'Completed': { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
}

const MyOrders = () => {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [editingOrder, setEditingOrder] = useState(null)
  const [editItems, setEditItems] = useState([])
  const [cancellingOrder, setCancellingOrder] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [menuItems, setMenuItems] = useState([])
  const [menuLoading, setMenuLoading] = useState(false)
  const [menuSearch, setMenuSearch] = useState('')
  const navigate = useNavigate()

  // Auto-fill phone from localStorage
  useEffect(() => {
    const savedPhone = localStorage.getItem('sipup_customer_phone')
    if (savedPhone) {
      setPhone(savedPhone.replace('+91', ''))
    }
  }, [])

  // Load menu items when edit modal opens
  useEffect(() => {
    if (editingOrder) {
      loadMenuItems()
    }
  }, [editingOrder])

  const loadMenuItems = async () => {
    setMenuLoading(true)
    try {
      const [juices, plates] = await Promise.all([
        api.getJuicesAndShakes(true),
        api.getFruitPlates(true)
      ])
      setMenuItems([...juices, ...plates])
    } catch (error) {
      console.error('Error loading menu:', error)
    } finally {
      setMenuLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!phone || phone.length !== 10) {
      alert('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    setSearched(true)
    try {
      const result = await getOrdersByPhone(`+91${phone}`)
      // Filter out completed orders
      const filteredOrders = result.filter(o => o.status !== 'Completed')
      setOrders(filteredOrders)
    } catch (error) {
      console.error('Error searching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = (order) => {
    setEditingOrder(order)
    setEditItems(order.items.map(item => ({ ...item })))
    setMenuSearch('')
  }

  const handleEditQuantity = (index, newQty) => {
    if (newQty <= 0) return
    const updated = [...editItems]
    updated[index] = { ...updated[index], quantity: newQty }
    setEditItems(updated)
  }

  const handleRemoveEditItem = (index) => {
    if (editItems.length <= 1) {
      alert('Order must have at least one item. Use Cancel instead.')
      return
    }
    setEditItems(editItems.filter((_, i) => i !== index))
  }

  const handleAddMenuItemToOrder = (menuItem) => {
    // Check if item already exists in the order
    const existingIndex = editItems.findIndex(item =>
      item.name === menuItem.name || (item.id === menuItem.id && typeof menuItem.id === 'number')
    )

    if (existingIndex >= 0) {
      // Increase quantity
      const updated = [...editItems]
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + 1
      }
      setEditItems(updated)
    } else {
      // Add new item
      setEditItems([...editItems, {
        id: menuItem.id,
        name: menuItem.name,
        basePrice: menuItem.basePrice,
        price: menuItem.basePrice,
        quantity: 1,
        selectedFruits: [],
        specialInstructions: ''
      }])
    }
  }

  const handleEditSave = async () => {
    setSubmitting(true)
    try {
      const newTotal = editItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      await editOrder(editingOrder._id, { items: editItems, total: newTotal })
      setEditingOrder(null)
      const result = await getOrdersByPhone(`+91${phone}`)
      setOrders(result.filter(o => o.status !== 'Completed'))
      alert('Order updated successfully!')
    } catch (error) {
      alert('Failed to update order. ' + (error.message || ''))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelOrder = async () => {
    setSubmitting(true)
    try {
      await cancelOrder(cancellingOrder._id, cancelReason)
      setCancellingOrder(null)
      setCancelReason('')
      const result = await getOrdersByPhone(`+91${phone}`)
      setOrders(result.filter(o => o.status !== 'Completed'))
      alert('Order cancelled successfully!')
    } catch (error) {
      alert('Failed to cancel order. ' + (error.message || ''))
    } finally {
      setSubmitting(false)
    }
  }

  const canEditOrCancel = (status) => {
    return ['New', 'Preparing', 'Edited'].includes(status)
  }

  const getEditTotal = () => {
    return editItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(menuSearch.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text" />
          </button>
          <h1 className="text-2xl font-bold font-heading text-text">My Orders</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Phone Search */}
        <motion.form
          onSubmit={handleSearch}
          className="bg-white rounded-custom p-6 shadow-soft mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-lg font-semibold text-text mb-4">Track Your Orders</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-text font-semibold whitespace-nowrap">+91</span>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 p-3 border-2 border-gray-200 rounded-custom focus:border-primary focus:outline-none"
                maxLength="10"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-custom font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </motion.form>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-text/60">Loading your orders...</p>
          </div>
        ) : searched && orders.length === 0 ? (
          <motion.div
            className="bg-white rounded-custom p-12 shadow-soft text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-text/30" />
            <h3 className="text-xl font-semibold text-text mb-2">No Active Orders Found</h3>
            <p className="text-text/60">No active orders found for this phone number.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-primary text-white rounded-custom font-semibold hover:bg-primary/90 transition-colors"
            >
              Order Now
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {orders.map((order, index) => {
                const statusStyle = statusColors[order.status] || statusColors['New']
                const StatusIcon = statusStyle.icon
                const isExpanded = expandedOrder === order._id

                return (
                  <motion.div
                    key={order._id}
                    className="bg-white rounded-custom shadow-soft overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {/* Order Header */}
                    <div
                      className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${statusStyle.bg} flex items-center justify-center`}>
                            <StatusIcon className={`w-5 h-5 ${statusStyle.text}`} />
                          </div>
                          <div>
                            <h3 className="font-bold text-text">{order.orderId}</h3>
                            <p className="text-sm text-text/60">
                              {new Date(order.timestamp).toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}>
                            {order.status}
                          </span>
                          <span className="font-bold text-primary text-lg">₹{order.total}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-text/40" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-text/40" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t">
                            <div className="py-4 space-y-2">
                              <h4 className="text-sm font-semibold text-text/60 uppercase tracking-wider">Items</h4>
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-text">
                                  <div>
                                    <span className="font-medium">{item.quantity}x </span>
                                    <span>{item.customName || item.name}</span>
                                    {item.selectedFruits && item.selectedFruits.length > 0 && (
                                      <span className="text-sm text-text/50 ml-2">
                                        ({item.selectedFruits.join(', ')})
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-semibold">₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>

                            <div className="py-2 border-t text-sm text-text/60">
                              Payment: <span className="font-semibold text-text capitalize">{order.paymentMode}</span>
                            </div>

                            {order.editHistory && order.editHistory.length > 0 && (
                              <div className="py-3 border-t">
                                <h4 className="text-sm font-semibold text-purple-600 mb-2 flex items-center gap-1">
                                  <Edit3 className="w-4 h-4" /> Edit History
                                </h4>
                                {order.editHistory.map((edit, idx) => (
                                  <div key={idx} className="bg-purple-50 rounded-lg p-3 mb-2 text-sm">
                                    <p className="text-purple-600 font-medium mb-1">
                                      Edited on {new Date(edit.editedAt).toLocaleString('en-IN')}
                                    </p>
                                    <p className="text-text/60">
                                      Previous total: <span className="font-semibold">₹{edit.previousTotal}</span>
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {order.status === 'Cancelled' && order.cancelReason && (
                              <div className="py-3 border-t">
                                <p className="text-sm text-red-600">
                                  <strong>Cancel Reason:</strong> {order.cancelReason}
                                </p>
                                {order.cancelledAt && (
                                  <p className="text-xs text-text/50 mt-1">
                                    Cancelled on {new Date(order.cancelledAt).toLocaleString('en-IN')}
                                  </p>
                                )}
                              </div>
                            )}

                            {canEditOrCancel(order.status) && (
                              <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEditStart(order) }}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-purple-100 text-purple-700 rounded-custom font-semibold hover:bg-purple-200 transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" /> Edit Order
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setCancellingOrder(order) }}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 bg-red-100 text-red-700 rounded-custom font-semibold hover:bg-red-200 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" /> Cancel Order
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Order Modal — Full Menu Browser */}
      <AnimatePresence>
        {editingOrder && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingOrder(null)}
            />
            <motion.div
              className="fixed inset-x-2 top-[5%] bottom-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white rounded-custom shadow-2xl z-50 flex flex-col"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {/* Modal Header */}
              <div className="p-5 border-b flex justify-between items-center flex-shrink-0">
                <h2 className="text-xl font-bold font-heading text-text">Edit Order {editingOrder.orderId}</h2>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XCircle className="w-5 h-5 text-text/60" />
                </button>
              </div>

              {/* Modal Body — Scrollable */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Current Order Items */}
                <div>
                  <h3 className="text-sm font-bold text-text/60 uppercase tracking-wider mb-3">Your Order Items</h3>
                  {editItems.length === 0 ? (
                    <p className="text-text/50 text-center py-4">No items in order. Add items from menu below.</p>
                  ) : (
                    <div className="space-y-2">
                      {editItems.map((item, index) => (
                        <div key={index} className="bg-gray-50 rounded-custom p-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-text text-sm truncate">{item.customName || item.name}</h4>
                            <p className="text-xs text-text/60">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleEditQuantity(index, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleEditQuantity(index, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-bold text-primary text-sm w-16 text-right">₹{item.price * item.quantity}</span>
                          <button
                            onClick={() => handleRemoveEditItem(index)}
                            className="text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Items from Menu */}
                <div>
                  <h3 className="text-sm font-bold text-text/60 uppercase tracking-wider mb-3">Add Items from Menu</h3>
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full p-2.5 border-2 border-gray-200 rounded-custom focus:border-primary focus:outline-none mb-3 text-sm"
                  />
                  {menuLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                      {filteredMenuItems.map((item) => {
                        const alreadyInOrder = editItems.some(ei =>
                          ei.name === item.name || (ei.id === item.id && typeof item.id === 'number')
                        )
                        return (
                          <button
                            key={item.id || item._id}
                            onClick={() => handleAddMenuItemToOrder(item)}
                            className={`text-left p-3 rounded-custom border-2 transition-all text-sm ${
                              alreadyInOrder
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-text truncate pr-2">{item.name}</span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="font-bold text-primary">₹{item.basePrice}</span>
                                <Plus className={`w-4 h-4 ${alreadyInOrder ? 'text-primary' : 'text-text/40'}`} />
                              </div>
                            </div>
                            {alreadyInOrder && (
                              <span className="text-xs text-primary font-medium">In order — tap to add more</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t flex-shrink-0">
                <div className="flex justify-between items-center text-lg font-bold text-text mb-4 p-3 bg-gray-50 rounded-custom">
                  <span>New Total:</span>
                  <span className="text-primary">₹{getEditTotal()}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setEditingOrder(null)}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-custom font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={submitting || editItems.length === 0}
                    className="flex-1 py-3 bg-primary text-white rounded-custom font-semibold hover:bg-primary/90 transition-colors shadow-soft disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {cancellingOrder && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingOrder(null)}
            />
            <motion.div
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md bg-white rounded-custom shadow-2xl z-50"
              initial={{ opacity: 0, scale: 0.9, y: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-50%' }}
            >
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold font-heading text-text">Cancel Order?</h2>
                  <p className="text-text/60 mt-2">
                    Are you sure you want to cancel order <strong>{cancellingOrder.orderId}</strong>?
                  </p>
                </div>

                <textarea
                  placeholder="Reason for cancellation (optional)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-custom focus:border-red-400 focus:outline-none resize-none mb-6"
                  rows="3"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => { setCancellingOrder(null); setCancelReason('') }}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-custom font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleCancelOrder}
                    disabled={submitting}
                    className="flex-1 py-3 bg-red-500 text-white rounded-custom font-semibold hover:bg-red-600 transition-colors shadow-soft disabled:opacity-50"
                  >
                    {submitting ? 'Cancelling...' : 'Yes, Cancel'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MyOrders
