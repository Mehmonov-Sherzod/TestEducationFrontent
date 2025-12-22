import { useTheme } from '@contexts/ThemeContext'

export const AnimatedBackground = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const gridSize = 60

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Light blue/cyan background */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? '#111827'
            : '#e0f4f8',
        }}
      />

      {/* Grid lines - fade towards edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(34, 211, 238, 0.15) 1px, transparent 1px),
               linear-gradient(90deg, rgba(34, 211, 238, 0.15) 1px, transparent 1px)`
            : `linear-gradient(rgba(100, 160, 180, 0.25) 1px, transparent 1px),
               linear-gradient(90deg, rgba(100, 160, 180, 0.25) 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 100%)',
        }}
      />

    </div>
  )
}
