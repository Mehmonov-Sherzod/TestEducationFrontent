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
          ? 'bg-gray-800 border border-gray-700 shadow-black/20'
          : '',
        hoverable && (isDark
          ? 'hover:shadow-xl hover:shadow-red-500/20'
          : 'hover:shadow-xl hover:shadow-red-500/10'),
        className
      )}
      style={!isDark ? {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(224,244,248,0.95) 20%, rgba(224,244,248,0.95) 80%, rgba(255,255,255,0.4) 100%)',
        boxShadow: 'inset 0 0 60px rgba(255,255,255,0.7), 0 4px 30px rgba(0,0,0,0.05)',
      } : {}}
    >
      {children}
    </motion.div>
  )
}
