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
            ? 'linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)'
            : 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 25%, #f1f5f9 50%, #dbeafe 75%, #ede9fe 100%)',
        }}
      />

      {/* Color blobs for light mode */}
      {!isDark && (
        <>
          <div
            className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ background: 'rgba(59, 130, 246, 0.15)' }}
          />
          <div
            className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ background: 'rgba(139, 92, 246, 0.12)' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl"
            style={{ background: 'rgba(99, 102, 241, 0.08)' }}
          />
        </>
      )}

      {/* Subtle Grid Pattern */}
      <div
        className="absolute inset-0"
        style={{
          opacity: isDark ? 0.3 : 0.4,
          backgroundImage: isDark
            ? `linear-gradient(rgba(34, 211, 238, 0.05) 1px, transparent 1px),
               linear-gradient(90deg, rgba(34, 211, 238, 0.05) 1px, transparent 1px)`
            : `linear-gradient(rgba(59, 130, 246, 0.04) 1px, transparent 1px),
               linear-gradient(90deg, rgba(59, 130, 246, 0.04) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Soft Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? 'radial-gradient(circle at center, transparent 0%, rgba(17, 24, 39, 0.5) 100%)'
            : 'radial-gradient(circle at center, transparent 0%, rgba(241, 245, 249, 0.6) 100%)',
        }}
      />
    </div>
  )
}
