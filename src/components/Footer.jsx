import { motion } from 'framer-motion'

const Footer = () => {
  return (
    <footer className="bg-text text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h3 className="text-2xl font-bold mb-4 font-heading">SipUp</h3>
            <p className="text-white/80">Fresh Fruits, Fresh Vibes</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-white/80 mb-2">📱 +91 8866006024 </p>
            <p className="text-white/80 mb-2">📱 +91 6353865836 </p>
            <p className="text-white/80">📍 Changa, Gujarat</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex justify-center md:justify-start gap-4">
              <a href="#" className="text-2xl hover:scale-110 transition-transform">📷</a>
              <a href="#" className="text-2xl hover:scale-110 transition-transform">💬</a>
            </div>
          </div>
        </motion.div>
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/60">
          <p>&copy; 2026 SipUp. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
