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
        'rounded-2xl sm:rounded-3xl px-5 sm:px-8 lg:px-14 py-6 sm:py-8 transition-all duration-300 relative',
        isDark
          ? 'bg-[#111111] border border-gray-800 shadow-black/20'
          : 'bg-white border border-gray-100 shadow-xl shadow-gray-200/50',
        hoverable && (isDark
          ? 'hover:shadow-xl hover:shadow-blue-500/20'
          : 'hover:shadow-2xl hover:shadow-blue-500/10'),
        className
      )}
    >
      {children}
    </motion.div>
  )
}
