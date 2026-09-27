import { motion } from 'framer-motion'

export default function Logo() {
  return (
    <motion.div 
      className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        fill="none" 
        stroke="url(#gradient)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        
        {/* Main F shape */}
        <path d="M 30 20 L 30 80 M 30 20 L 70 20 M 30 50 L 65 50" />
        
        {/* Currency curves - top right spiral */}
        <path d="M 75 25 Q 85 35, 75 45" />
        
        {/* Currency curves - bottom right spiral */}
        <path d="M 75 55 Q 85 65, 75 75" />
      </svg>
    </motion.div>
  )
}
