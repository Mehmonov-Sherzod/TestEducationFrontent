import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedBackground } from '@components/shared/AnimatedBackground'
import { Card } from '@components/shared/Card'
import { LoginForm } from '@components/auth/LoginForm'
import { RegisterForm } from '@components/auth/RegisterForm'
import { ForgotPasswordFlow } from '@components/auth/ForgotPasswordFlow'
import { FormType } from '@appTypes/auth.types'
import { ThemeToggleIcon } from '@components/shared/ThemeToggle'
import { useTheme } from '@contexts/ThemeContext'
import { FiX } from 'react-icons/fi'

export const AuthPage = () => {
  const [formType, setFormType] = useState<FormType>('login')
  const [showLoginForm, setShowLoginForm] = useState(false)
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
        return 'Xush kelibsiz'
      case 'register':
        return 'Akkaunt yaratish'
      case 'forgot-password':
        return 'Parolni tiklash'
      default:
        return 'Xush kelibsiz'
    }
  }

  const getSubtitle = () => {
    switch (formType) {
      case 'login':
        return 'Akkauntingizga kirish uchun hisob ma\'lumotlarini kiriting'
      case 'register':
        return 'Ta\'lim platformasiga qo\'shiling'
      case 'forgot-password':
        return 'Hisobingizni tiklashga yordam beramiz'
      default:
        return ''
    }
  }

  return (
    <div className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Top Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        {/* Login Button */}
        {!showLoginForm && (
          <motion.button
            onClick={() => setShowLoginForm(true)}
            className={`px-4 sm:px-6 py-2 rounded-xl font-medium transition-all text-sm sm:text-base ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } shadow-lg shadow-blue-500/30`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Kirish
          </motion.button>
        )}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <ThemeToggleIcon />
        </motion.div>
      </div>

      {/* Animated Background */}
      <AnimatedBackground />

      {/* Left Side Text - Hidden on mobile when form is shown */}
      <motion.div
        className={`absolute left-4 sm:left-8 lg:left-16 right-4 sm:right-auto top-20 sm:top-24 sm:max-w-xl lg:max-w-2xl z-10 ${
          showLoginForm ? 'hidden lg:block' : 'block'
        }`}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h1 className={`text-2xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-6 lg:mb-8 leading-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Muvaffaqiyat yo'lida har kuni o'sish
        </h1>
        <p className={`text-sm sm:text-lg lg:text-xl xl:text-2xl leading-relaxed mb-4 sm:mb-8 lg:mb-10 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Kitoblardan tanlangan savollar, professional tayyorlangan testlar, tezkor natijalar. Bilimingizni sinab, kelajagingizni quring!
        </p>

        {/* 3 Stacked Images */}
        <motion.div
          className="mt-6 sm:mt-8 lg:mt-12 flex justify-center sm:justify-start -space-x-8 sm:-space-x-8 lg:-space-x-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <motion.img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=90"
            alt="Online test"
            className="w-32 sm:w-40 lg:w-64 h-44 sm:h-52 lg:h-80 object-cover rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white -rotate-6"
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            style={{ zIndex: 1 }}
          />
          <motion.img
            src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=90"
            alt="Books"
            className="w-32 sm:w-40 lg:w-64 h-44 sm:h-52 lg:h-80 object-cover rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white rotate-3"
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            style={{ zIndex: 2 }}
          />
          <motion.img
            src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&q=90"
            alt="Student taking online test"
            className="w-32 sm:w-40 lg:w-64 h-44 sm:h-52 lg:h-80 object-cover rounded-xl sm:rounded-2xl shadow-2xl border-2 sm:border-4 border-white -rotate-3"
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            style={{ zIndex: 3 }}
          />
        </motion.div>
      </motion.div>

      {/* 3D Rotating Subjects */}
      {!showLoginForm && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-24 sm:bottom-auto sm:left-auto sm:translate-x-0 sm:right-4 lg:right-12 xl:right-20 sm:top-1/2 sm:-translate-y-1/2 z-10"
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative overflow-hidden w-[300px] sm:w-[500px] lg:w-[650px] xl:w-[750px] h-12 sm:h-20 lg:h-20 xl:h-24"
            style={{
              transformStyle: 'preserve-3d',
              transform: 'rotateX(8deg)'
            }}
          >
            <div
              className="flex items-center gap-6 sm:gap-12 lg:gap-16 xl:gap-20 absolute left-0"
              style={{
                animation: 'smoothScroll 20s linear infinite'
              }}
            >
              {[
                'Matematika',
                'Fizika',
                'Kimyo',
                'Biologiya',
                'Tarix',
                'Ingliz tili',
                'Ona tili',
                'Geografiya',
                'Matematika',
                'Fizika',
                'Kimyo',
                'Biologiya',
                'Tarix',
                'Ingliz tili',
              ].map((subject, index) => (
                <div
                  key={index}
                  className={`font-bold text-lg sm:text-2xl lg:text-4xl xl:text-5xl whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  {subject}
                </div>
              ))}
            </div>
          </div>
          <style>{`
            @keyframes smoothScroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
          `}</style>
        </div>
      )}

      {/* Main Content - Login Form */}
      <AnimatePresence>
        {showLoginForm && (
          <motion.div
            className="fixed inset-0 lg:absolute lg:inset-auto lg:right-20 xl:right-40 lg:top-20 z-10 w-full lg:max-w-2xl flex items-center justify-center lg:block p-4 lg:p-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            {/* Mobile Background Overlay */}
            <div className={`absolute inset-0 lg:hidden ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm`} />

            {/* Form Content Container */}
            <div className="relative w-full max-w-md lg:max-w-2xl max-h-[90vh] lg:max-h-none overflow-y-auto">
        {/* Logo with Frame */}
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Logo with Cap */}
          <motion.div
            className="relative inline-flex items-center justify-center w-14 sm:w-16 h-14 sm:h-16 rounded-2xl mb-4 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            {/* Graduation Cap - hidden on mobile */}
            <svg
              className="absolute -top-7 left-1/2 -translate-x-1/2 w-16 h-14 hidden sm:block"
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
            <span className="text-xl sm:text-2xl font-bold text-white">P</span>
          </motion.div>

          <h1 className={`text-2xl sm:text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
            ProExam
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Online Test Platform
          </p>
        </motion.div>

        {/* Form Card */}
        <Card className="overflow-hidden relative">
          {/* Close Button */}
          <button
            onClick={() => setShowLoginForm(false)}
            className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDark
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiX className="w-5 h-5" />
          </button>
          {/* Dynamic Header */}
          <motion.div
            className="text-center mb-4"
            key={formType}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className={`text-xl sm:text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-black'}`}>
              {getTitle()}
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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
          className={`text-center text-xs mt-4 sm:mt-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          &copy; 2025 ProExam. Barcha huquqlar himoyalangan.
        </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
