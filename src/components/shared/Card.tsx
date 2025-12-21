import { motion } from 'framer-motion'
import { cn } from '@utils/cn'
import { useTheme } from '@contexts/ThemeContext'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}

export const Card = ({ children, className, hoverable = false }: CardProps) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable ? { scale: 1.02 } : {}}
      className={cn(
        'rounded-2xl p-8 border shadow-lg transition-all duration-300',
        isDark
          ? 'bg-gray-800 border-gray-700 shadow-black/20'
          : 'bg-white border-gray-200 shadow-gray-200/50',
        hoverable && (isDark
          ? 'hover:shadow-xl hover:shadow-red-500/20'
          : 'hover:shadow-xl hover:shadow-red-500/10'),
        className
      )}
    >
      {children}
    </motion.div>
  )
}
