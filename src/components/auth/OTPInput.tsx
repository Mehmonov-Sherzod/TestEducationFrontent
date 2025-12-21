import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@utils/cn'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  error?: boolean
  disabled?: boolean
}

export const OTPInput = ({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
  disabled = false,
}: OTPInputProps) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)

  const digits = value.split('').concat(Array(length - value.length).fill(''))

  const handleChange = (index: number, digit: string) => {
    if (disabled) return

    // Only allow numbers
    if (digit && !/^\d$/.test(digit)) return

    const newValue = digits.map((d, i) => (i === index ? digit : d)).join('')
    onChange(newValue.slice(0, length))

    // Move to next input if digit was entered
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }

    // Call onComplete if all digits are filled
    if (newValue.length === length && onComplete) {
      onComplete(newValue)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current input is empty, move to previous input
        inputsRef.current[index - 1]?.focus()
      } else {
        // Clear current input
        handleChange(index, '')
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '')

    if (pasteData) {
      const newValue = pasteData.slice(0, length)
      onChange(newValue)

      // Focus the next empty input or the last input
      const nextIndex = Math.min(newValue.length, length - 1)
      inputsRef.current[nextIndex]?.focus()

      // Call onComplete if all digits are filled
      if (newValue.length === length && onComplete) {
        onComplete(newValue)
      }
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, index) => (
        <motion.input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => setFocusedIndex(index)}
          onBlur={() => setFocusedIndex(null)}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-2xl font-bold',
            'bg-dark-800 border-2 rounded-lg',
            'transition-all duration-300',
            'focus:outline-none',
            focusedIndex === index
              ? 'border-white shadow-lg shadow-white/30'
              : error
              ? 'border-gray-100'
              : 'border-dark-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          animate={
            error
              ? {
                  x: [0, -5, 5, -5, 5, 0],
                }
              : {}
          }
          transition={{ duration: 0.4 }}
        />
      ))}
    </div>
  )
}
