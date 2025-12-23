import { useTheme } from '@contexts/ThemeContext'
import { useEffect, useRef } from 'react'

export const AnimatedBackground = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setSize()
    window.addEventListener('resize', setSize)

    // Mouse position
    const mouse = { x: -1000, y: -1000 }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Create 10 dots at random positions
    const dots = [
      { baseX: canvas.width * 0.15, baseY: canvas.height * 0.2 },
      { baseX: canvas.width * 0.85, baseY: canvas.height * 0.15 },
      { baseX: canvas.width * 0.25, baseY: canvas.height * 0.7 },
      { baseX: canvas.width * 0.75, baseY: canvas.height * 0.8 },
      { baseX: canvas.width * 0.5, baseY: canvas.height * 0.35 },
      { baseX: canvas.width * 0.1, baseY: canvas.height * 0.5 },
      { baseX: canvas.width * 0.9, baseY: canvas.height * 0.45 },
      { baseX: canvas.width * 0.35, baseY: canvas.height * 0.85 },
      { baseX: canvas.width * 0.65, baseY: canvas.height * 0.25 },
      { baseX: canvas.width * 0.45, baseY: canvas.height * 0.6 },
    ].map(dot => ({
      ...dot,
      x: dot.baseX,
      y: dot.baseY,
      size: 3,
    }))

    // Animation
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      dots.forEach((dot) => {
        // Calculate distance from mouse
        const dx = mouse.x - dot.baseX
        const dy = mouse.y - dot.baseY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 150

        if (distance < maxDistance) {
          // Move dot away from cursor
          const force = (maxDistance - distance) / maxDistance
          const angle = Math.atan2(dy, dx)
          const moveX = Math.cos(angle) * force * 25
          const moveY = Math.sin(angle) * force * 25

          dot.x += (dot.baseX - moveX - dot.x) * 0.15
          dot.y += (dot.baseY - moveY - dot.y) * 0.15
        } else {
          // Return to base position
          dot.x += (dot.baseX - dot.x) * 0.08
          dot.y += (dot.baseY - dot.y) * 0.08
        }

        // Draw dot
        ctx.beginPath()
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2)
        ctx.fillStyle = isDark
          ? 'rgba(59, 130, 246, 0.5)'
          : 'rgba(59, 130, 246, 0.35)'
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', setSize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [isDark])

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
      {/* Interactive dots canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      />
    </div>
  )
}
