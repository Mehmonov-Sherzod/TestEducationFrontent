import { useTheme } from '@contexts/ThemeContext'

export const AnimatedBackground = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? '#0a0a0a'
            : '#f9fafb',
        }}
      />
    </div>
  )
}
