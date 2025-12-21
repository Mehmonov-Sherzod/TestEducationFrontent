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
                    ? 'text-red-500'
                    : error
                    ? 'text-red-400'
                    : isDark
                    ? 'text-gray-500'
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
                'w-full h-14 px-4 rounded-xl',
                'border transition-all duration-200',
                'text-base',
                'focus:outline-none',
                // Theme styles
                isDark
                  ? 'bg-gray-800 text-white placeholder:text-gray-500'
                  : 'bg-gray-50 text-black placeholder:text-gray-400',
                // Border states
                isFocused
                  ? isDark
                    ? 'border-red-500 bg-gray-700'
                    : 'border-red-500 bg-white'
                  : error
                  ? 'border-red-500/50'
                  : isDark
                  ? 'border-gray-700 hover:border-gray-600'
                  : 'border-gray-200 hover:border-gray-300',
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
                  isDark
                    ? 'text-gray-500 hover:text-red-400'
                    : 'text-gray-400 hover:text-red-500'
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
              'text-sm mt-2 ml-1',
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
