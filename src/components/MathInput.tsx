import { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { MathRenderer } from './MathRenderer'

interface MathInputProps {
  value: string
  onChange: (value: string) => void
  onFocus?: () => void
  onCursorChange?: (start: number, end: number) => void
  placeholder?: string
  className?: string
  isDark?: boolean
  multiline?: boolean
  rows?: number
}

export interface MathInputRef {
  focus: () => void
  insertAtCursor: (text: string) => void
}

/**
 * Math input component that shows rendered LaTeX when not focused,
 * and raw LaTeX code when focused for editing
 */
export const MathInput = forwardRef<MathInputRef, MathInputProps>(({
  value,
  onChange,
  onFocus,
  onCursorChange,
  placeholder = '',
  className = '',
  isDark = true,
  multiline = false,
  rows = 3,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false)
  const [lastCursor, setLastCursor] = useState({ start: 0, end: 0 })
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      setIsFocused(true)
      setTimeout(() => inputRef.current?.focus(), 0)
    },
    insertAtCursor: (text: string) => {
      const { start, end } = lastCursor
      const newValue = value.substring(0, start) + text + value.substring(end)
      onChange(newValue)
      const newPos = start + text.length
      setLastCursor({ start: newPos, end: newPos })
      // Focus and set cursor
      setIsFocused(true)
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
          inputRef.current.setSelectionRange(newPos, newPos)
        }
      }, 10)
    }
  }))

  const handleFocus = () => {
    setIsFocused(true)
    onFocus?.()
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange(e.target.value)
    saveCursor(e.target)
  }

  const saveCursor = (target: HTMLTextAreaElement | HTMLInputElement) => {
    const start = target.selectionStart || 0
    const end = target.selectionEnd || 0
    setLastCursor({ start, end })
    onCursorChange?.(start, end)
  }

  const handleCursorChange = (e: React.SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    saveCursor(e.target as HTMLTextAreaElement | HTMLInputElement)
  }

  // Check if value contains math (has $ symbols)
  const hasMath = value.includes('$')

  // Base styles
  const baseStyles = `w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base transition-all ${
    isDark
      ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'
  } ${className}`

  // Show preview when not focused and has content with math
  if (!isFocused && value && hasMath) {
    return (
      <div
        onClick={() => {
          setIsFocused(true)
          setLastCursor({ start: value.length, end: value.length })
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.focus()
              inputRef.current.setSelectionRange(value.length, value.length)
            }
          }, 0)
        }}
        className={`${baseStyles} cursor-text min-h-[42px] flex items-center`}
      >
        <MathRenderer text={value} className="w-full" />
      </div>
    )
  }

  // Show input with live preview when has math
  if (multiline) {
    return (
      <div className="space-y-2">
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSelect={handleCursorChange}
          onClick={handleCursorChange}
          onKeyUp={handleCursorChange}
          placeholder={placeholder}
          rows={rows}
          className={baseStyles}
        />
        {/* Live preview */}
        {value && hasMath && (
          <div className={`px-3 py-2 rounded-lg text-sm ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-200'
          }`}>
            <span className={`text-xs block mb-1 ${isDark ? 'text-gray-500' : 'text-blue-500'}`}>Ko'rinishi:</span>
            <MathRenderer text={value} className={isDark ? 'text-white' : 'text-gray-900'} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSelect={handleCursorChange}
        onClick={handleCursorChange}
        onKeyUp={handleCursorChange}
        placeholder={placeholder}
        className={baseStyles}
      />
      {/* Live preview */}
      {value && hasMath && (
        <div className={`px-3 py-2 rounded-lg text-sm ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <span className={`text-xs block mb-1 ${isDark ? 'text-gray-500' : 'text-blue-500'}`}>Ko'rinishi:</span>
          <MathRenderer text={value} className={isDark ? 'text-white' : 'text-gray-900'} />
        </div>
      )}
    </div>
  )
})

MathInput.displayName = 'MathInput'

export default MathInput
