import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const navigate = useNavigate()

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Animated Fruit Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-6xl md:text-8xl opacity-20"
            initial={{ 
              x: Math.random() * dimensions.width,
              y: Math.random() * dimensions.height,
              rotate: 0
            }}
            animate={{
              y: [null, Math.random() * dimensions.height],
              rotate: [0, 360],
              x: [null, Math.random() * dimensions.width]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          >
            {['🍉', '🍊', '🍍', '🍓'][i % 4]}
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-4 font-heading"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            SipUp
          </span>
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-text/80 mb-8 font-body"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Fresh Fruits, Fresh Vibes
        </motion.p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <motion.button
            onClick={scrollToMenu}
            className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-custom text-lg font-semibold shadow-soft hover:scale-105 active:scale-95 transition-transform duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Order Now
          </motion.button>
          <motion.button
            onClick={() => navigate('/my-orders')}
            className="w-full sm:w-auto border-2 border-primary text-primary px-8 py-4 rounded-custom text-lg font-semibold hover:bg-primary hover:text-white active:scale-95 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Track My Order
          </motion.button>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-primary" />
      </motion.div>
    </section>
  )
}

export default Hero
