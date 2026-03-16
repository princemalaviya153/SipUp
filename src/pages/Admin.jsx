import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import {
  getOrders, updateOrderStatus, getTodaySales, getWeekSales,
  getEditedOrders, getCancelledOrders, resetAllData, cancelOrder, deleteOrder
} from '../utils/orders'
import { api } from '../utils/api'
import {
  LayoutDashboard, ClipboardList, Edit3, XCircle, UtensilsCrossed,
  History, LogOut, ChevronRight, Plus, Trash2, ToggleLeft, ToggleRight,
  Search, Package, Eye, EyeOff, Menu as MenuIcon, AlertTriangle, Download, Star
} from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'active', label: 'Active Orders', icon: ClipboardList },
  { id: 'edited', label: 'Edited Orders', icon: Edit3 },
  { id: 'cancelled', label: 'Cancelled Orders', icon: XCircle },
  { id: 'menu', label: 'Menu Management', icon: UtensilsCrossed },
  { id: 'history', label: 'Order History', icon: History },
]

// Order Table Component
const OrderTable = ({ orders: tableOrders, showStatus = true, showActions = false, showEditHistory = false, showCancelReason = false, showDelete = false, onStatusChange, onDeleteOrder }) => (
  <div className="overflow-x-auto">
    {tableOrders.length === 0 ? (
      <p className="text-text/60 text-center py-8">No orders found</p>
    ) : (
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left p-3 text-text font-semibold text-sm">Order ID</th>
            <th className="text-left p-3 text-text font-semibold text-sm">Customer</th>
            <th className="text-left p-3 text-text font-semibold text-sm">Phone</th>
            <th className="text-left p-3 text-text font-semibold text-sm">Address</th>
            <th className="text-left p-3 text-text font-semibold text-sm">Items</th>
            <th className="text-left p-3 text-text font-semibold text-sm">Total</th>
            <th className="text-left p-3 text-text font-semibold text-sm">Time</th>
            {showStatus && <th className="text-left p-3 text-text font-semibold text-sm">Status</th>}
            {showActions && <th className="text-left p-3 text-text font-semibold text-sm">Actions</th>}
            {showDelete && !showActions && <th className="text-left p-3 text-text font-semibold text-sm">Delete</th>}
            {showEditHistory && <th className="text-left p-3 text-text font-semibold text-sm">Edit Info</th>}
            {showCancelReason && <th className="text-left p-3 text-text font-semibold text-sm">Cancel Info</th>}
          </tr>
        </thead>
        <tbody>
          {tableOrders.map((order) => (
            <tr key={order._id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="p-3 font-semibold text-text text-sm">{order.orderId || order._id}</td>
              <td className="p-3 text-text text-sm">{order.customerName}</td>
              <td className="p-3 text-text text-sm">{order.phone}</td>
              <td className="p-3 text-text text-sm max-w-[150px] truncate">{order.address || '-'}</td>
              <td className="p-3 text-text">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    {item.quantity}x {item.customName || item.name}
                  </div>
                ))}
              </td>
              <td className="p-3 font-semibold text-primary text-sm">₹{order.total}</td>
              <td className="p-3 text-text text-sm whitespace-nowrap">
                {new Date(order.timestamp).toLocaleString('en-IN', {
                  day: '2-digit', month: 'short',
                  hour: '2-digit', minute: '2-digit'
                })}
              </td>
              {showStatus && (
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${order.status === 'New' ? 'bg-blue-100 text-blue-700' :
                    order.status === 'Preparing' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'Ready' ? 'bg-green-100 text-green-700' :
                        order.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                          order.status === 'Edited' ? 'bg-purple-100 text-purple-700' :
                            'bg-red-100 text-red-700'
                    }`}>
                    {order.status}
                  </span>
                </td>
              )}
              {showActions && (
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => onStatusChange && onStatusChange(order._id, e.target.value)}
                      className="p-2 border-2 border-gray-200 rounded-custom focus:border-primary focus:outline-none text-text text-sm"
                    >
                      <option value="New">New</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled" className="text-red-600 font-semibold">Cancel Order</option>
                    </select>
                    {showDelete && (
                      <button
                        onClick={() => onDeleteOrder && onDeleteOrder(order._id)}
                        className="p-2 bg-red-100 text-red-700 rounded-custom hover:bg-red-200 transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
              {showDelete && !showActions && (
                <td className="p-3">
                  <button
                    onClick={() => onDeleteOrder && onDeleteOrder(order._id)}
                    className="p-2 bg-red-100 text-red-700 rounded-custom hover:bg-red-200 transition-colors"
                    title="Delete Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              )}
              {showEditHistory && (
                <td className="p-3 text-sm">
                  {order.editHistory && order.editHistory.length > 0 ? (
                    <div className="space-y-1">
                      {order.editHistory.map((edit, idx) => (
                        <div key={idx} className="bg-purple-50 p-2 rounded text-xs">
                          <p className="text-purple-700 font-medium">
                            {new Date(edit.editedAt).toLocaleString('en-IN')}
                          </p>
                          <p className="text-text/60">Prev: ₹{edit.previousTotal}</p>
                        </div>
                      ))}
                    </div>
                  ) : '-'}
                </td>
              )}
              {showCancelReason && (
                <td className="p-3 text-sm">
                  <p className="text-red-600">{order.cancelReason || '-'}</p>
                  {order.cancelledAt && (
                    <p className="text-xs text-text/50 mt-1">
                      {new Date(order.cancelledAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
)

// Menu Item Form
const MenuItemForm = ({ item, onSubmit, onCancel, title, setItemState }) => (
  <motion.form
    onSubmit={onSubmit}
    className="bg-gray-50 rounded-custom p-6 mb-6"
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
  >
    <h3 className="text-lg font-bold mb-4 text-text">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="Item Name"
        value={item.name}
        onChange={(e) => setItemState({ ...item, name: e.target.value })}
        className="p-3 border-2 border-gray-200 rounded-custom focus:border-primary focus:outline-none"
        required
      />
      <input
        type="number"
        placeholder="Price (₹)"
        value={item.basePrice}
        onChange={(e) => setItemState({ ...item, basePrice: e.target.value })}
        className="p-3 border-2 border-gray-200 rounded-custom focus:border-primary focus:outline-none"
        required
        min="1"
      />
      <select
        value={item.category}
        onChange={(e) => setItemState({ ...item, category: e.target.value })}
        className="p-3 border-2 border-gray-200 rounded-custom focus:border-primary focus:outline-none"
      >
        <option value="juice">Juice</option>
        <option value="shake">Shake</option>
        <option value="plate">Plate</option>
      </select>
      <input
        type="text"
        placeholder="Base Fruit (optional)"
        value={item.baseFruit || ''}
        onChange={(e) => setItemState({ ...item, baseFruit: e.target.value })}
        className="p-3 border-2 border-gray-200 rounded-custom focus:border-primary focus:outline-none"
      />
    </div>
    <div className="flex items-center gap-2 mt-4">
      <input
        type="checkbox"
        id="allowCustomization"
        checked={item.allowCustomization || false}
        onChange={(e) => setItemState({ ...item, allowCustomization: e.target.checked })}
        className="w-4 h-4"
      />
      <label htmlFor="allowCustomization" className="text-text text-sm">Allow Customization</label>
    </div>
    <div className="flex gap-3 mt-4">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 border-2 border-gray-300 rounded-custom font-semibold hover:bg-gray-50 transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-6 py-2 bg-primary text-white rounded-custom font-semibold hover:bg-primary/90 transition-colors"
      >
        {title.includes('Edit') ? 'Update Item' : 'Add Item'}
      </button>
    </div>
  </motion.form>
)

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [orders, setOrders] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [editedOrders, setEditedOrders] = useState([])
  const [cancelledOrders, setCancelledOrders] = useState([])
  const [todaySales, setTodaySales] = useState(0)
  const [weekSales, setWeekSales] = useState(0)
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  // Menu management state
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newItem, setNewItem] = useState({ name: '', basePrice: '', category: 'juice', baseFruit: '', allowCustomization: false })

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
      const interval = setInterval(loadData, 5000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadData = async () => {
    try {
      setLoading(true)
      const [allOrders, today, week, edited, cancelled, menu] = await Promise.all([
        getOrders(),
        getTodaySales(),
        getWeekSales(),
        getEditedOrders(),
        getCancelledOrders(),
        api.getMenuItems()
      ])
      setOrders(allOrders)
      setActiveOrders(allOrders.filter(order =>
        ['New', 'Preparing', 'Ready'].includes(order.status)
      ))
      setCompletedOrders(allOrders.filter(order => order.status === 'Completed'))
      setEditedOrders(edited)
      setCancelledOrders(cancelled)
      setTodaySales(today)
      setWeekSales(week)
      setMenuItems(menu)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (username === 'sipupadmin' && password === 'sipup-admin@3510') {
      setIsAuthenticated(true)
    } else {
      alert('Invalid credentials')
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (newStatus === 'Cancelled') {
        const reason = window.prompt("Please provide a reason for cancelling this order:")
        if (reason !== null) {
          await cancelOrder(orderId, reason || 'Cancelled by Admin')
          await loadData()
        }
        return
      } else {
        await updateOrderStatus(orderId, newStatus)
        await loadData()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Failed to update order status')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you strictly sure you want to permanently delete this order? This action cannot be undone and will affect revenue metrics.')) {
      try {
        await deleteOrder(orderId)
        await loadData()
      } catch (error) {
        alert('Failed to delete order')
      }
    }
  }

  const handleResetData = async () => {
    if (window.confirm('⚠️ WARNING: This will permanently delete ALL orders and reset all revenue to zero. This action cannot be undone!\n\nAre you absolutely sure you want to proceed?')) {
      try {
        setLoading(true)
        await resetAllData()
        await loadData()
        alert('All order and revenue data has been successfully reset.')
      } catch (error) {
        console.error('Error resetting data:', error)
        alert('Failed to reset data.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleExportPDF = () => {
    if (orders.length === 0) {
      alert('No orders available to export.')
      return
    }

    const doc = new jsPDF()

    // Add Header
    doc.setFontSize(20)
    doc.setTextColor(238, 90, 36) // primary color
    doc.text('SipUp - Comprehensive Order History', 14, 22)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Exported on: ${new Date().toLocaleString()}`, 14, 30)

    const tableColumn = ["Order ID", "Customer", "Phone", "Total", "Status", "Date"]
    const tableRows = []

    orders.forEach(order => {
      const orderDate = new Date(order.timestamp).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })

      const orderData = [
        order.orderId || order._id.substring(0, 8),
        order.customerName,
        order.phone,
        `Rs: ${order.total}`,
        order.status,
        orderDate
      ]
      tableRows.push(orderData)
    })

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [238, 90, 36] }, // Primary color
      alternateRowStyles: { fillColor: [250, 250, 250] }
    })

    const currentDate = new Date().toISOString().split('T')[0]
    doc.save(`SipUp-Order-History-${currentDate}.pdf`)
  }

  // Menu Management Handlers
  const handleAddMenuItem = async (e) => {
    e.preventDefault()
    try {
      await api.addMenuItem({
        ...newItem,
        basePrice: Number(newItem.basePrice)
      })
      setNewItem({ name: '', basePrice: '', category: 'juice', baseFruit: '', allowCustomization: false })
      setShowAddItem(false)
      await loadData()
    } catch (error) {
      alert('Failed to add item: ' + error.message)
    }
  }

  const handleUpdateMenuItem = async (e) => {
    e.preventDefault()
    try {
      await api.updateMenuItem(editingItem.id, {
        name: editingItem.name,
        basePrice: Number(editingItem.basePrice),
        category: editingItem.category,
        baseFruit: editingItem.baseFruit,
        allowCustomization: editingItem.allowCustomization
      })
      setEditingItem(null)
      await loadData()
    } catch (error) {
      alert('Failed to update item: ' + error.message)
    }
  }

  const handleDeleteMenuItem = async (id) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return
    try {
      await api.deleteMenuItem(id)
      await loadData()
    } catch (error) {
      alert('Failed to delete item: ' + error.message)
    }
  }

  const handleToggleAvailability = async (id) => {
    try {
      await api.toggleMenuAvailability(id)
      await loadData()
    } catch (error) {
      alert('Failed to toggle availability: ' + error.message)
    }
  }

  const handleToggleBestseller = async (id) => {
    try {
      await api.toggleMenuBestseller(id)
      await loadData()
    } catch (error) {
      alert('Failed to toggle bestseller: ' + error.message)
    }
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          className="bg-white rounded-custom p-8 shadow-soft w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-6 text-center font-heading text-text">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-custom focus:border-primary focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-custom focus:border-primary focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-custom font-semibold hover:bg-primary/90 transition-colors shadow-soft"
            >
              Login
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-text/60 hover:text-text transition-colors"
          >
            ← Back to Home
          </button>
        </motion.div>
      </div>
    )
  }



  const currentTab = TABS.find(t => t.id === activeTab)

  // Calculate Total Revenue and Most Ordered Item from completed orders
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)

  const itemCounts = {}
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      const name = item.customName || item.name
      itemCounts[name] = (itemCounts[name] || 0) + item.quantity
    })
  })

  let mostOrdered = { name: '-', count: 0 }
  for (const [name, count] of Object.entries(itemCounts)) {
    if (count > mostOrdered.count) {
      mostOrdered = { name, count }
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`bg-white shadow-lg flex flex-col transition-all duration-300 fixed h-full z-30 top-0 left-0
          ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-64 md:w-16'}`}
        initial={false}
      >
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold font-heading text-text">SipUp Admin</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className={`w-5 h-5 text-text transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const badgeCount = tab.id === 'edited' ? editedOrders.length :
              tab.id === 'cancelled' ? cancelledOrders.length :
                tab.id === 'active' ? activeOrders.length : 0

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-custom transition-all text-left ${isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-text/70 hover:bg-gray-100 hover:text-text'
                  }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="font-medium text-sm flex-1">{tab.label}</span>
                )}
                {sidebarOpen && badgeCount > 0 && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                    }`}>
                    {badgeCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-2 border-t space-y-1">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-custom text-text/70 hover:bg-gray-100 hover:text-text transition-all text-left"
          >
            <Eye className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">View Site</span>}
          </button>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-custom text-red-500 hover:bg-red-50 transition-all text-left"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <div className="p-6 md:p-8 max-w-7xl mx-auto pt-16 md:pt-8 min-h-screen">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 bg-white rounded-custom shadow-sm text-text"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold font-heading text-text">{currentTab?.label}</h1>
              <p className="text-text/60 mt-1 text-sm">
                {activeTab === 'dashboard' && 'Overview of your sales and orders'}
                {activeTab === 'active' && 'Orders currently being processed'}
                {activeTab === 'edited' && 'Orders modified by customers'}
                {activeTab === 'cancelled' && 'Orders cancelled by customers'}
                {activeTab === 'menu' && 'Manage your menu items and availability'}
                {activeTab === 'history' && 'Complete history of all orders'}
              </p>
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Sales Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  className="bg-white rounded-custom p-6 shadow-soft"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="text-sm font-semibold text-text/60 mb-1">Total Revenue</h3>
                  <p className="text-3xl font-bold text-primary">₹{totalRevenue}</p>
                </motion.div>
                <motion.div
                  className="bg-white rounded-custom p-6 shadow-soft"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="text-sm font-semibold text-text/60 mb-1">Today's Sales</h3>
                  <p className="text-3xl font-bold text-primary">₹{todaySales}</p>
                </motion.div>
                <motion.div
                  className="bg-white rounded-custom p-6 shadow-soft"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-sm font-semibold text-text/60 mb-1">Week's Sales</h3>
                  <p className="text-3xl font-bold text-primary">₹{weekSales}</p>
                </motion.div>
                <motion.div
                  className="bg-white rounded-custom p-6 shadow-soft"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-sm font-semibold text-text/60 mb-1">Most Ordered</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold text-text truncate max-w-[150px]" title={mostOrdered.name}>{mostOrdered.name}</p>
                    {mostOrdered.count > 0 && <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">{mostOrdered.count}x</span>}
                  </div>
                </motion.div>
                <motion.div
                  className="bg-white rounded-custom p-6 shadow-soft"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-semibold text-text/60 mb-1">Active Orders</h3>
                  <p className="text-3xl font-bold text-blue-600">{activeOrders.length}</p>
                </motion.div>
                <motion.div
                  className="bg-white rounded-custom p-6 shadow-soft"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-sm font-semibold text-text/60 mb-1">Total Orders</h3>
                  <p className="text-3xl font-bold text-text">{orders.length}</p>
                </motion.div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-custom p-6 shadow-soft">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text">Completed</h4>
                      <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-custom p-6 shadow-soft">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Edit3 className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text">Edited</h4>
                      <p className="text-2xl font-bold text-purple-600">{editedOrders.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-custom p-6 shadow-soft">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-text">Cancelled</h4>
                      <p className="text-2xl font-bold text-red-600">{cancelledOrders.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <motion.div
                className="mt-8 bg-red-50/50 border border-red-100 rounded-custom p-6 shadow-soft"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h3>
                <p className="text-sm text-red-800/70 mb-4">
                  These actions are permanent and cannot be undone. Completely wipe out all historical and active orders and reset order numbers back to 0.
                </p>
                <button
                  onClick={handleResetData}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-custom hover:bg-red-700 transition-colors shadow-sm"
                >
                  Reset All Orders & Revenue Data
                </button>
              </motion.div>
            </div>
          )}

          {/* Active Orders Tab */}
          {activeTab === 'active' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-custom p-6 shadow-soft"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ClipboardList className="text-primary" /> Active Orders
                </h2>
                <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                  {activeOrders.length} Orders
                </span>
              </div>
              <OrderTable
                orders={activeOrders}
                showActions={true}
                showStatus={true}
                showDelete={true}
                onStatusChange={handleStatusChange}
                onDeleteOrder={handleDeleteOrder}
              />
            </motion.div>
          )}

          {/* Edited Orders Tab */}
          {activeTab === 'edited' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-custom p-6 shadow-soft"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-purple-600">
                  <Edit3 className="text-purple-600" /> Edited Orders
                </h2>
                <span className="bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full text-sm">
                  {editedOrders.length} Orders
                </span>
              </div>
              <OrderTable
                orders={editedOrders}
                showEditHistory={true}
                showActions={true}
                showDelete={true}
                onStatusChange={handleStatusChange}
                onDeleteOrder={handleDeleteOrder}
              />
            </motion.div>
          )}

          {/* Cancelled Orders Tab */}
          {activeTab === 'cancelled' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-custom p-6 shadow-soft"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 text-red-600">
                  <XCircle className="text-red-600" /> Cancelled Orders
                </h2>
                <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                  {cancelledOrders.length} Orders
                </span>
              </div>
              <OrderTable
                orders={cancelledOrders}
                showCancelReason={true}
                showDelete={true}
                onDeleteOrder={handleDeleteOrder}
              />
            </motion.div>
          )}

          {/* Menu Management Tab */}
          {activeTab === 'menu' && (
            <motion.div
              className="bg-white rounded-custom p-6 shadow-soft"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Add New Item Button */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-text/60">{menuItems.length} items total</p>
                <button
                  onClick={() => setShowAddItem(!showAddItem)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-custom font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add New Item
                </button>
              </div>

              {/* Add Item Form */}
              <AnimatePresence>
                {showAddItem && (
                  <MenuItemForm
                    item={newItem}
                    onSubmit={handleAddMenuItem}
                    onCancel={() => setShowAddItem(false)}
                    title="Add New Menu Item"
                    setItemState={setNewItem}
                  />
                )}
              </AnimatePresence>

              {/* Edit Item Form */}
              <AnimatePresence>
                {editingItem && (
                  <MenuItemForm
                    item={editingItem}
                    onSubmit={handleUpdateMenuItem}
                    onCancel={() => setEditingItem(null)}
                    title={`Edit: ${editingItem.name}`}
                    setItemState={setEditingItem}
                  />
                )}
              </AnimatePresence>

              {/* Menu Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-3 text-text font-semibold text-sm">ID</th>
                      <th className="text-left p-3 text-text font-semibold text-sm">Name</th>
                      <th className="text-left p-3 text-text font-semibold text-sm">Price</th>
                      <th className="text-left p-3 text-text font-semibold text-sm">Category</th>
                      <th className="text-left p-3 text-text font-semibold text-sm">Bestseller</th>
                      <th className="text-left p-3 text-text font-semibold text-sm">Available</th>
                      <th className="text-left p-3 text-text font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuItems.map((item) => (
                      <tr key={item.id} className={`border-b hover:bg-gray-50 transition-colors ${!item.isAvailable ? 'opacity-50' : ''}`}>
                        <td className="p-3 text-text text-sm font-mono">{item.id}</td>
                        <td className="p-3 text-text text-sm font-medium">{item.name}</td>
                        <td className="p-3 text-primary font-semibold text-sm">₹{item.basePrice}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.category === 'juice' ? 'bg-orange-100 text-orange-700' :
                            item.category === 'shake' ? 'bg-pink-100 text-pink-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleBestseller(item.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-custom text-sm font-medium transition-colors ${
                              item.isBestseller
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-amber-50'
                            }`}
                            title={item.isBestseller ? 'Remove Bestseller' : 'Mark as Bestseller'}
                          >
                            <Star className={`w-4 h-4 ${item.isBestseller ? 'fill-amber-500 text-amber-500' : ''}`} />
                            {item.isBestseller ? 'Bestseller' : 'Mark'}
                          </button>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleAvailability(item.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-custom text-sm font-medium transition-colors ${item.isAvailable !== false
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                          >
                            {item.isAvailable !== false ? (
                              <><ToggleRight className="w-4 h-4" /> Available</>
                            ) : (
                              <><ToggleLeft className="w-4 h-4" /> Unavailable</>
                            )}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingItem({ ...item })}
                              className="p-2 bg-blue-100 text-blue-700 rounded-custom hover:bg-blue-200 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMenuItem(item.id)}
                              className="p-2 bg-red-100 text-red-700 rounded-custom hover:bg-red-200 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Order History Tab */}
          {activeTab === 'history' && (
            <motion.div
              className="bg-white rounded-custom p-6 shadow-soft"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-heading text-text">All Orders</h2>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-text text-white rounded-custom font-semibold hover:bg-text/90 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" /> Export PDF
                </button>
              </div>
              <OrderTable orders={orders} showStatus={true} showDelete={true} onDeleteOrder={handleDeleteOrder} />
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Admin
