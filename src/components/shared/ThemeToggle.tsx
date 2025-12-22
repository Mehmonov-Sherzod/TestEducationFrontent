import { motion } from 'framer-motion'
import { FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '@contexts/ThemeContext'

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export const ThemeToggle = ({ size = 'md', showLabel = false }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const sizes = {
    sm: { button: 'w-12 h-6', circle: 'w-4 h-4', icon: 12, translate: 'translate-x-6' },
    md: { button: 'w-14 h-7', circle: 'w-5 h-5', icon: 14, translate: 'translate-x-7' },
    lg: { button: 'w-16 h-8', circle: 'w-6 h-6', icon: 16, translate: 'translate-x-8' },
  }

  const currentSize = sizes[size]

  return (
    <div className="flex items-center gap-3">
      {showLabel && (
        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
      <motion.button
        onClick={toggleTheme}
        className={`relative ${currentSize.button} rounded-full p-1 transition-colors duration-300 ${
          isDark
            ? 'bg-slate-700 hover:bg-slate-600'
            : 'bg-gray-200 hover:bg-gray-300'
        }`}
        whileTap={{ scale: 0.95 }}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {/* Background Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          <FiMoon
            size={currentSize.icon - 2}
            className={`transition-opacity duration-300 ${
              isDark ? 'text-yellow-300 opacity-100' : 'text-gray-400 opacity-40'
            }`}
          />
          <FiSun
            size={currentSize.icon - 2}
            className={`transition-opacity duration-300 ${
              isDark ? 'text-gray-500 opacity-40' : 'text-yellow-500 opacity-100'
            }`}
          />
        </div>

        {/* Toggle Circle */}
        <motion.div
          className={`relative ${currentSize.circle} rounded-full shadow-md flex items-center justify-center ${
            isDark
              ? 'bg-slate-900'
              : 'bg-white'
          }`}
          animate={{
            x: isDark ? 0 : parseInt(currentSize.translate.replace('translate-x-', '')) * 4,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        >
          <motion.div
            initial={false}
            animate={{ rotate: isDark ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isDark ? (
              <FiMoon size={currentSize.icon - 4} className="text-yellow-300" />
            ) : (
              <FiSun size={currentSize.icon - 4} className="text-yellow-500" />
            )}
          </motion.div>
        </motion.div>
      </motion.button>
    </div>
  )
}

// Alternative: Icon-only toggle button
export const ThemeToggleIcon = () => {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-yellow-300'
          : 'bg-gray-100 hover:bg-gray-200 text-yellow-500'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-4 h-4 sm:w-[18px] sm:h-[18px] flex items-center justify-center"
      >
        {isDark ? <FiMoon className="w-full h-full" /> : <FiSun className="w-full h-full" />}
      </motion.div>

      {/* Glow effect */}
      <motion.div
        className={`absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 ${
          isDark ? 'bg-yellow-400/20' : 'bg-yellow-500/20'
        }`}
        whileHover={{ opacity: 1 }}
      />
    </motion.button>
  )
}
