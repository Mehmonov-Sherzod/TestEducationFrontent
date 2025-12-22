import { forwardRef, ReactNode, ButtonHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@utils/cn'
import { LoadingSpinner } from './LoadingSpinner'
import { useTheme } from '@contexts/ThemeContext'

// Only omit the specific conflicting animation-related props
interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  isLoading?: boolean
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      isLoading = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Theme-aware button variants with cyan/blue accents
    const variants = {
      primary: isDark
        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30'
        : 'bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30',
      secondary: isDark
        ? 'bg-gray-700 hover:bg-gray-600 text-white font-semibold'
        : 'bg-gray-100 hover:bg-gray-200 text-black font-semibold',
      outline: isDark
        ? 'border-2 border-gray-600 text-white hover:bg-gray-800'
        : 'border-2 border-gray-300 text-black hover:bg-gray-100',
      ghost: isDark
        ? 'text-white hover:bg-gray-800'
        : 'text-black hover:bg-gray-100',
    }

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !isLoading ? { scale: 1.01, y: -1 } : {}}
        whileTap={!disabled && !isLoading ? { scale: 0.99 } : {}}
        className={cn(
          'relative px-5 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base',
          'transition-all duration-200',
          isDark
            ? 'focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:ring-offset-2 focus:ring-offset-gray-900'
            : 'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-2 focus:ring-offset-white',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            <span>Loading...</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
