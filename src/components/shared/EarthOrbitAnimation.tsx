import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const subjects = ['📐', '⚛️', '🧬', '🧪', '📜', '📖', '🌍', '💻', '🎨', '📈']

export const EarthOrbitAnimation = () => {
  const stageRef = useRef<HTMLDivElement>(null)
  const iconsRef = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    if (!stageRef.current) return

    const radiusX = 200
    const radiusY = 80

    iconsRef.current.forEach((el, i) => {
      if (!el) return

      const pathData = { progress: 0 }
      const startOffset = i / subjects.length

      // Main orbit animation
      gsap.to(pathData, {
        progress: 1,
        duration: 15,
        repeat: -1,
        ease: 'none',
        delay: -startOffset * 15,
        onUpdate: () => {
          const angle = pathData.progress * Math.PI * 2

          const x = Math.cos(angle) * radiusX
          const y = Math.sin(angle) * radiusY

          // Z-Depth Logic
          const z = Math.sin(angle) // -1 (BACK) to 1 (FRONT)
          const isBehind = z < 0

          // Dynamic scaling and blurring for 3D feel
          const scale = 0.5 + ((z + 1) / 2) * 0.8
          const opacity = 0.1 + ((z + 1) / 2) * 0.9
          const blur = isBehind ? Math.abs(z) * 4 : 0

          gsap.set(el, {
            x: x,
            y: y,
            scale: scale,
            opacity: opacity,
            filter: `blur(${blur}px) drop-shadow(0 0 12px #38bdf8)`,
            zIndex: isBehind ? 10 : 100,
          })
        },
      })

      // Gentle individual float
      gsap.to(el, {
        y: '-=15',
        duration: 2 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    })

    // Add slow tilt to the whole system
    gsap.set(stageRef.current, { rotationZ: -10 })

    return () => {
      // Cleanup animations
      iconsRef.current.forEach((el) => {
        if (el) gsap.killTweensOf(el)
      })
    }
  }, [])

  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
      {/* Cinematic Earth Sphere */}
      <div
        className="w-40 h-40 rounded-full relative z-50"
        style={{
          background: `url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Africa_and_Europe_from_a_Distance.jpg/640px-Africa_and_Europe_from_a_Distance.jpg')`,
          backgroundSize: 'cover',
          boxShadow: 'inset -20px -20px 50px rgba(0,0,0,0.8), 0 0 60px rgba(56, 189, 248, 0.4)',
          animation: 'rotateEarth 30s linear infinite',
        }}
      >
        {/* Atmospheric Glow */}
        <div
          className="absolute rounded-full pointer-events-none z-[51]"
          style={{
            inset: '-5px',
            background: 'transparent',
            border: '2px solid rgba(56, 189, 248, 0.2)',
            boxShadow: 'inset 0 0 20px rgba(56, 189, 248, 0.5)',
          }}
        />
      </div>

      {/* Orbit Stage */}
      <div
        ref={stageRef}
        className="absolute inset-0 flex items-center justify-center"
      >
        {subjects.map((icon, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) iconsRef.current[i] = el
            }}
            className="absolute text-4xl select-none"
            style={{
              color: '#38bdf8',
              filter: 'drop-shadow(0 0 15px rgba(56, 189, 248, 0.8))',
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes rotateEarth {
          from { background-position: 0 0; }
          to { background-position: 640px 0; }
        }
      `}</style>
    </div>
  )
}
