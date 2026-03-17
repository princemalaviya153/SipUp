import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { availableFruits, getFruitColor, premiumFruits } from '../utils/menuData'
import { api } from '../utils/api'

const CustomizationModal = ({ item, onClose, onAddToCart }) => {
  // For items without baseFruit (like Mix Fruit Juice or Customization Platters), start with empty selection
  const [selectedFruits, setSelectedFruits] = useState(item.baseFruit ? [item.baseFruit] : [])
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [dbFruits, setDbFruits] = useState([])

  useEffect(() => {
    const fetchFruits = async () => {
      try {
        const data = await api.getFruits(true)
        if (data && data.length > 0) {
          setDbFruits(data)
        }
      } catch (error) {
        console.error('Error fetching fruits for customization:', error)
      }
    }
    fetchFruits()
  }, [])

  const currentAvailableFruits = dbFruits.length > 0 ? dbFruits.map(f => f.name) : availableFruits
  const currentPremiumFruits = dbFruits.length > 0 ? dbFruits.filter(f => f.isPremium).map(f => f.name) : premiumFruits

  const calculatePrice = () => {
    if (item.name === 'Mix Fruit Juice') {
      const hasPremium = selectedFruits.some(fruit => currentPremiumFruits.includes(fruit))
      return hasPremium ? 130 : 70
    }
    return item.basePrice
  }

  const toggleFruit = (fruit) => {
    const isPremium = currentPremiumFruits.includes(fruit)
    const currentHasPremium = selectedFruits.some(f => currentPremiumFruits.includes(f))
    const currentHasRegular = selectedFruits.some(f => !currentPremiumFruits.includes(f))

    if (selectedFruits.includes(fruit)) {
      setSelectedFruits(selectedFruits.filter(f => f !== fruit))
    } else {
      // Adding fruit
      if (selectedFruits.length === 0) {
        // First selection, allow any
        setSelectedFruits([...selectedFruits, fruit])
      } else if (isPremium && currentHasPremium) {
        // Adding premium to premium selection
        setSelectedFruits([...selectedFruits, fruit])
      } else if (!isPremium && currentHasRegular) {
        // Adding regular to regular selection
        setSelectedFruits([...selectedFruits, fruit])
      } else {
        // Trying to mix categories
        alert('You can only select fruits from the same category: either all regular or all premium.')
        return
      }
    }
  }

  const handleAddToCart = () => {
    // Special validation for Mix Fruit Juice
    if (item.name === 'Mix Fruit Juice') {
      if (selectedFruits.length === 0) {
        alert('Please select fruits for Mix Fruit Juice')
        return
      }
      const hasPremium = selectedFruits.some(fruit => currentPremiumFruits.includes(fruit))
      if (hasPremium) {
        if (selectedFruits.length !== 3) {
          alert('Please select exactly 3 premium fruits')
          return
        }
      } else {
        if (selectedFruits.length !== 4) {
          alert('Please select exactly 4 regular fruits')
          return
        }
      }
    } else {
      // Ensure at least one fruit is selected for other items
      if (selectedFruits.length === 0) {
        alert('Please select at least one fruit')
        return
      }
    }

    onAddToCart(item, {
      selectedFruits,
      quantity,
      specialInstructions,
      customName: selectedFruits.length > 0
        ? `${item.name} (${selectedFruits.join(' + ')})`
        : item.name,
      price: calculatePrice()
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-t-3xl md:rounded-custom w-full md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
            <h3 className="text-2xl font-bold font-heading text-text">Customize Your Order</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-text">Select Fruits</h4>
              {item.name === 'Mix Fruit Juice' && (
                <p className="text-sm text-gray-600 mb-4">
                  Select either 4 regular fruits (₹70) or 3 premium fruits (₹130). Cannot mix categories.
                </p>
              )}

              {/* Regular Fruits Section */}
              <div className="mb-6">
                <h5 className="text-md font-medium text-text mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Regular Fruits
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentAvailableFruits.filter(fruit => !currentPremiumFruits.includes(fruit)).map((fruit) => (
                    <button
                      key={fruit}
                      onClick={() => toggleFruit(fruit)}
                      className={`p-4 rounded-custom border-2 transition-all ${selectedFruits.includes(fruit)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-primary/50'
                        }`}
                      style={{
                        borderColor: selectedFruits.includes(fruit) ? getFruitColor(fruit) : undefined
                      }}
                    >
                      <div className="text-2xl mb-2">
                        {fruit === 'Watermelon' && '🍉'}
                        {fruit === 'Orange' && '🍊'}
                        {fruit === 'Grapes' && '🍇'}
                        {fruit === 'Kiwi' && '🥝'}
                        {fruit === 'Chikoo' && '🥭'}
                        {fruit === 'Pineapple' && '🍍'}
                        {fruit === 'Strawberry' && '🍓'}
                        {fruit === 'Guava' && '🍈'}
                        {fruit === 'Tender Coconut' && '🥥'}
                        {fruit === 'Blueberry' && '🫐'}
                      </div>
                      <div className="text-sm font-medium text-text">{fruit}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shadow Separator */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 shadow-sm"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">Premium Selection</span>
                </div>
              </div>

              {/* Premium Fruits Section */}
              <div>
                <h5 className="text-md font-medium text-text mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Premium Fruits
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {currentAvailableFruits.filter(fruit => currentPremiumFruits.includes(fruit)).map((fruit) => (
                    <button
                      key={fruit}
                      onClick={() => toggleFruit(fruit)}
                      className={`p-4 rounded-custom border-2 transition-all ${selectedFruits.includes(fruit)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 hover:border-primary/50'
                        }`}
                      style={{
                        borderColor: selectedFruits.includes(fruit) ? getFruitColor(fruit) : undefined
                      }}
                    >
                      <div className="text-2xl mb-2">
                        {fruit === 'Watermelon' && '🍉'}
                        {fruit === 'Orange' && '🍊'}
                        {fruit === 'Grapes' && '🍇'}
                        {fruit === 'Kiwi' && '🥝'}
                        {fruit === 'Chikoo' && '🥭'}
                        {fruit === 'Pineapple' && '🍍'}
                        {fruit === 'Strawberry' && '🍓'}
                        {fruit === 'Guava' && '🍈'}
                        {fruit === 'Tender Coconut' && '🥥'}
                        {fruit === 'Blueberry' && '🫐'}
                      </div>
                      <div className="text-sm font-medium text-text">{fruit}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-text">Quantity</h4>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-lg"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-text w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-text">Special Instructions</h4>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Any special requests?"
                className="w-full p-4 border-2 border-gray-200 rounded-custom focus:border-primary focus:outline-none resize-none"
                rows="3"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 border-2 border-gray-300 rounded-custom font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToCart}
                disabled={selectedFruits.length === 0}
                className={`flex-1 py-3 rounded-custom font-semibold transition-colors shadow-soft ${selectedFruits.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
                  }`}
              >
                Add to Cart - ₹{calculatePrice() * quantity}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CustomizationModal
