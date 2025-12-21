import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@components/shared/AnimatedBackground'
import { Card } from '@components/shared/Card'
import { LoginForm } from '@components/auth/LoginForm'
import { RegisterForm } from '@components/auth/RegisterForm'
import { ForgotPasswordFlow } from '@components/auth/ForgotPasswordFlow'
import { FormType } from '@appTypes/auth.types'
import { ThemeToggleIcon } from '@components/shared/ThemeToggle'
import { useTheme } from '@contexts/ThemeContext'
import { FiCheck, FiX } from 'react-icons/fi'

// Live Quiz Demo Component
const LiveQuizDemo = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const questions = [
    {
      question: "2 + 2 = ?",
      answers: ["3", "4", "5", "6"],
      correct: 1
    },
    {
      question: "H₂O nima?",
      answers: ["Tuz", "Suv", "Havo", "Olov"],
      correct: 1
    },
    {
      question: "Eng katta sayyora?",
      answers: ["Yer", "Mars", "Yupiter", "Saturn"],
      correct: 2
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      if (!showResult) {
        const randomAnswer = Math.floor(Math.random() * 4)
        setSelectedAnswer(randomAnswer)
        setShowResult(true)

        setTimeout(() => {
          setShowResult(false)
          setSelectedAnswer(null)
          setCurrentQuestion((prev) => (prev + 1) % questions.length)
        }, 1500)
      }
    }, 2500)

    return () => clearInterval(timer)
  }, [showResult])

  const q = questions[currentQuestion]

  return (
    <motion.div
      className={`w-full max-w-sm rounded-3xl p-6 ${
        isDark
          ? 'bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700'
          : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200'
      } backdrop-blur-xl shadow-2xl`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
          isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
        }`}>
          Live Demo
        </span>
      </div>

      {/* Progress */}
      <div className="flex gap-1 mb-4">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i === currentQuestion
                ? 'bg-blue-500'
                : i < currentQuestion
                ? isDark ? 'bg-green-500' : 'bg-green-400'
                : isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {q.question}
          </h3>

          {/* Answers */}
          <div className="space-y-2">
            {q.answers.map((answer, i) => {
              const isSelected = selectedAnswer === i
              const isCorrect = i === q.correct
              const showCorrect = showResult && isCorrect
              const showWrong = showResult && isSelected && !isCorrect

              return (
                <motion.div
                  key={i}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-between ${
                    showCorrect
                      ? 'border-green-500 bg-green-500/20'
                      : showWrong
                      ? 'border-red-500 bg-red-500/20'
                      : isSelected
                      ? isDark
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-blue-500 bg-blue-50'
                      : isDark
                      ? 'border-gray-700 bg-gray-800/50'
                      : 'border-gray-200 bg-white'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      showCorrect
                        ? 'bg-green-500 text-white'
                        : showWrong
                        ? 'bg-red-500 text-white'
                        : isSelected
                        ? 'bg-blue-500 text-white'
                        : isDark
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
                      {answer}
                    </span>
                  </div>
                  {showCorrect && <FiCheck className="w-5 h-5 text-green-500" />}
                  {showWrong && <FiX className="w-5 h-5 text-red-500" />}
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Score indicator */}
      <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between text-sm">
          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Savol {currentQuestion + 1}/{questions.length}
          </span>
          <span className={`font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
            Ball: 85%
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export const AuthPage = () => {
  const [formType, setFormType] = useState<FormType>('login')
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const handleForgotPassword = () => {
    setFormType('forgot-password')
  }

  const handleBackToLogin = () => {
    setFormType('login')
  }

  const handleRegisterSuccess = () => {
    setFormType('login')
  }

  const handleSwitchToRegister = () => {
    setFormType('register')
  }

  const formVariants = {
    initial: { opacity: 0, x: 20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.3,
      },
    },
  }

  const getTitle = () => {
    switch (formType) {
      case 'login':
        return 'Welcome Back'
      case 'register':
        return 'Create Account'
      case 'forgot-password':
        return 'Reset Password'
      default:
        return 'Welcome'
    }
  }

  const getSubtitle = () => {
    switch (formType) {
      case 'login':
        return 'Sign in to continue learning'
      case 'register':
        return 'Join our education platform'
      case 'forgot-password':
        return 'We\'ll help you recover access'
      default:
        return ''
    }
  }

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Theme Toggle */}
      <motion.div
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <ThemeToggleIcon />
      </motion.div>

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-12">

        {/* Left Side - Quiz Demo (Hidden on mobile) */}
        <motion.div
          className="hidden lg:block"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Test yechish shu qadar oson!
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Real vaqtda natijalarni ko'ring
            </p>
          </div>
          <LiveQuizDemo />
        </motion.div>

        {/* Right Side - Auth Form */}
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Logo with Frame */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Logo with Cap */}
            <motion.div
              className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {/* Graduation Cap */}
              <svg
                className="absolute -top-7 left-1/2 -translate-x-1/2 w-16 h-14"
                viewBox="0 0 100 90"
                fill="none"
              >
                {/* Cap board - diamond shape (top) */}
                <polygon
                  points="50,0 100,20 50,40 0,20"
                  fill="#1a1a1a"
                />
                {/* Cap board underside shadow */}
                <polygon
                  points="50,40 100,20 100,24 50,44"
                  fill="#0a0a0a"
                />
                <polygon
                  points="50,40 0,20 0,24 50,44"
                  fill="#2a2a2a"
                />

                {/* Cap base (the part on head) */}
                <path
                  d="M25,32 Q25,55 50,60 Q75,55 75,32"
                  fill="#1a1a1a"
                />
                {/* Gold band */}
                <path
                  d="M25,45 Q25,52 50,56 Q75,52 75,45"
                  fill="none"
                  stroke="#d4a017"
                  strokeWidth="3"
                />

                {/* Button on top */}
                <circle cx="50" cy="20" r="4" fill="#d4a017" />

                {/* Tassel string */}
                <path
                  d="M50,24 Q30,35 20,55"
                  stroke="#d4a017"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Tassel body */}
                <ellipse cx="18" cy="58" rx="5" ry="3" fill="#d4a017" />
                <path
                  d="M13,58 L13,85 Q18,88 23,85 L23,58"
                  fill="#d4a017"
                />
                {/* Tassel strands */}
                <path d="M14,85 L14,90" stroke="#c49000" strokeWidth="1.5" />
                <path d="M16,85 L16,90" stroke="#c49000" strokeWidth="1.5" />
                <path d="M18,85 L18,90" stroke="#c49000" strokeWidth="1.5" />
                <path d="M20,85 L20,90" stroke="#c49000" strokeWidth="1.5" />
                <path d="M22,85 L22,90" stroke="#c49000" strokeWidth="1.5" />
              </svg>
              <span className="text-2xl font-bold text-white">P</span>
            </motion.div>

            <h1 className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
              ProExam
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Online Test Platform
            </p>
          </motion.div>

          {/* Form Card */}
          <Card className="overflow-hidden">
            {/* Dynamic Header */}
            <motion.div
              className="text-center mb-6"
              key={formType}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
                {getTitle()}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {getSubtitle()}
              </p>
            </motion.div>

            {/* Forms with Smooth Animation */}
            <AnimatePresence mode="wait" initial={false}>
              {formType === 'login' && (
                <motion.div
                  key="login"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <LoginForm
                    onForgotPassword={handleForgotPassword}
                    onSwitchToRegister={handleSwitchToRegister}
                  />
                </motion.div>
              )}

              {formType === 'register' && (
                <motion.div
                  key="register"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <RegisterForm
                    onSuccess={handleRegisterSuccess}
                    onSwitchToLogin={handleBackToLogin}
                  />
                </motion.div>
              )}

              {formType === 'forgot-password' && (
                <motion.div
                  key="forgot-password"
                  variants={formVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <ForgotPasswordFlow onBack={handleBackToLogin} />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Footer */}
          <motion.p
            className={`text-center text-xs mt-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            &copy; 2025 ProExam. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
