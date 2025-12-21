import { motion } from 'framer-motion'
import { FiBarChart2 } from 'react-icons/fi'
import { useTheme } from '@contexts/ThemeContext'

export const ResultsPage = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <FiBarChart2 className={`w-24 h-24 mx-auto mb-6 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
      </motion.div>
      <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Results & Analytics</h1>
      <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Beautiful charts and performance tracking coming soon!
      </p>
    </motion.div>
  )
}

