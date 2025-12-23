import { forwardRef, useState, InputHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@utils/cn'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useTheme } from '@contexts/ThemeContext'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type = 'text', className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    return (
      <div className="w-full">
        <motion.div
          className="relative"
          animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            {/* Icon */}
            {icon && (
              <div
                className={cn(
                  'absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200',
                  isFocused
                    ? 'text-blue-500'
                    : error
                    ? 'text-red-400'
                    : 'text-gray-400'
                )}
              >
                {icon}
              </div>
            )}

            {/* Input */}
            <input
              ref={ref}
              type={inputType}
              placeholder={label}
              className={cn(
                'w-full h-12 sm:h-14 px-4 rounded-xl',
                'border transition-all duration-200',
                'text-sm sm:text-base',
                'focus:outline-none',
                // Theme styles - always white background
                '!bg-white text-gray-900 placeholder:text-gray-400',
                // Border states
                isFocused
                  ? 'border-blue-500 shadow-sm shadow-blue-500/20'
                  : error
                  ? 'border-red-500/50'
                  : isDark
                  ? 'border-gray-200 hover:border-gray-300'
                  : 'border-gray-300 hover:border-gray-400',
                // Padding for icon
                icon ? 'pl-12' : 'pl-4',
                isPassword ? 'pr-12' : 'pr-4',
                className
              )}
              onFocus={() => setIsFocused(true)}
              onBlur={(e) => {
                setIsFocused(false)
                props.onBlur?.(e)
              }}
              {...props}
            />

            {/* Password Toggle */}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  'absolute right-4 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 p-1 rounded-lg',
                  'text-gray-400 hover:text-blue-500'
                )}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            )}
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'text-xs sm:text-sm mt-1.5 sm:mt-2 ml-1',
              isDark ? 'text-red-400' : 'text-red-500'
            )}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
