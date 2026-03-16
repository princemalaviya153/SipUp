import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFruitColor } from '../utils/menuData'
import { useCart } from '../context/CartContext'
import { api } from '../utils/api'
import CustomizationModal from './CustomizationModal'

const Menu = () => {
  const [activeTab, setActiveTab] = useState('juices')
  const [selectedItem, setSelectedItem] = useState(null)
  const [juicesAndShakes, setJuicesAndShakes] = useState([])
  const [fruitPlates, setFruitPlates] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true)
        const [juices, plates] = await Promise.all([
          api.getJuicesAndShakes(),
          api.getFruitPlates()
        ])
        setJuicesAndShakes(juices)
        setFruitPlates(plates)
      } catch (error) {
        console.error('Error loading menu:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMenu()
  }, [])

  const handleAddToCart = (item, customization) => {
    addToCart({
      ...item,
      ...customization,
      price: customization?.price || item.basePrice,
      quantity: customization?.quantity || 1
    })
    setSelectedItem(null)
  }

  const handleItemClick = (item) => {
    // Only show customization modal for items that allow customization
    if (item.allowCustomization) {
      setSelectedItem(item)
    } else {
      // Directly add to cart for regular items
      handleAddToCart(item, { quantity: 1 })
    }
  }

  return (
    <section id="menu-section" className="py-16 px-4 md:px-8 bg-background">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 font-heading text-text">
          Our Menu
        </h2>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          {['juices', 'plates'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-custom font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-soft scale-105'
                  : 'bg-white text-text hover:bg-gray-100'
              }`}
            >
              {tab === 'juices' ? 'Juices & Shakes' : 'Fruit Plates'}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-text/60">Loading menu...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
            {(activeTab === 'juices' ? juicesAndShakes : fruitPlates).map((item) => (
              <motion.div
                key={item.id}
                className={`relative bg-white rounded-custom p-6 shadow-soft transition-all duration-300 ${
                  item.isAvailable === false 
                    ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' 
                    : 'hover:shadow-lg cursor-pointer'
                }`}
                whileHover={item.isAvailable !== false ? { scale: 1.05, y: -5 } : {}}
                whileTap={item.isAvailable !== false ? { scale: 0.95 } : {}}
                onClick={() => {
                  if (item.isAvailable !== false) handleItemClick(item)
                }}
              >
                {item.isBestseller && (
                  <div className="absolute top-0 left-0 right-0 flex justify-center">
                    <span className="bg-amber-400 text-white text-xs font-bold px-3 py-0.5 rounded-b-lg shadow flex items-center gap-1">
                      ⭐ Bestseller
                    </span>
                  </div>
                )}
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${getFruitColor(item.baseFruit || 'Orange')}20` }}
                >
                  {item.name === 'Mix Fruit Juice' && '🥤'}
                  {(item.name === 'Small Customization Platter' || item.name === 'Premium Customization Platter') && '🍽️'}
                  {item.baseFruit === 'Watermelon' && '🍉'}
                  {item.baseFruit === 'Orange' && '🍊'}
                  {item.baseFruit === 'Pineapple' && '🍍'}
                  {item.baseFruit === 'Strawberry' && '🍓'}
                  {item.baseFruit === 'Chikoo' && '🥭'}
                  {item.baseFruit === 'Guava' && '🍈'}
                  {item.baseFruit === 'Kiwi' && '🥝'}
                  {item.baseFruit === 'Tender Coconut' && '🥥'}
                  {!item.baseFruit && !item.name.includes('Customization') && item.name !== 'Mix Fruit Juice' && '🍎'}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-center text-text font-heading text-balance">
                  {item.name}
                </h3>
                <p className="text-2xl font-bold text-primary text-center">
                  ₹{item.basePrice}
                </p>
                
                {item.isAvailable === false ? (
                  <button
                    disabled
                    className="w-full mt-4 bg-gray-200 text-gray-500 py-2 rounded-custom font-semibold cursor-not-allowed border-2 border-gray-300"
                  >
                    Unavailable
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleItemClick(item)
                    }}
                    className="w-full mt-4 bg-primary text-white py-2 rounded-custom font-semibold hover:bg-primary/90 transition-colors"
                  >
                    {item.allowCustomization ? 'Customize & Add' : 'Add to Cart'}
                  </button>
                )}
              </motion.div>
            ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>

      {selectedItem && (
        <CustomizationModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </section>
  )
}

export default Menu
