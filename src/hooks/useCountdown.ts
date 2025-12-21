import { useState, useEffect, useCallback } from 'react'

interface UseCountdownProps {
  initialSeconds: number
  onComplete?: () => void
}

interface UseCountdownReturn {
  seconds: number
  isRunning: boolean
  start: () => void
  reset: () => void
  stop: () => void
}

/**
 * Countdown timer hook for OTP expiry
 */
export const useCountdown = ({
  initialSeconds,
  onComplete,
}: UseCountdownProps): UseCountdownReturn => {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    if (!isRunning) return

    if (seconds === 0) {
      setIsRunning(false)
      onComplete?.()
      return
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, isRunning, onComplete])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const reset = useCallback(() => {
    setSeconds(initialSeconds)
    setIsRunning(false)
  }, [initialSeconds])

  const stop = useCallback(() => {
    setIsRunning(false)
  }, [])

  return {
    seconds,
    isRunning,
    start,
    reset,
    stop,
  }
}
