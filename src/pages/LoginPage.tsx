import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Card } from '@components/shared/Card'
import { LoginForm } from '@components/auth/LoginForm'
import { RegisterForm } from '@components/auth/RegisterForm'
import { ForgotPasswordFlow } from '@components/auth/ForgotPasswordFlow'
import { FormType } from '@appTypes/auth.types'
import { ThemeToggleIcon } from '@components/shared/ThemeToggle'
import { useTheme } from '@contexts/ThemeContext'
import { FiArrowLeft, FiBookOpen, FiTarget, FiTrendingUp, FiCheckCircle } from 'react-icons/fi'

export const LoginPage = () => {
  const [formType, setFormType] = useState<FormType>('login')
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()

  const handleForgotPassword = () => setFormType('forgot-password')
  const handleBackToLogin = () => setFormType('login')
  const handleRegisterSuccess = () => setFormType('login')
  const handleSwitchToRegister = () => setFormType('register')

  const formVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  }

  const getTitle = () => {
    switch (formType) {
      case 'login': return 'Hisobga kirish'
      case 'register': return 'Ro\'yxatdan o\'tish'
      case 'forgot-password': return 'Parolni tiklash'
      default: return 'Hisobga kirish'
    }
  }

  const getSubtitle = () => {
    switch (formType) {
      case 'login': return 'O\'z hisobingizga kiring va ta\'limni davom ettiring'
      case 'register': return 'Yangi hisob yarating va imkoniyatlarni kashf eting'
      case 'forgot-password': return 'Email orqali parolingizni tiklang'
      default: return ''
    }
  }

  const features = [
    { icon: FiBookOpen, title: '1000+ darsliklar', desc: 'Barcha fanlar bo\'yicha' },
    { icon: FiTarget, title: 'Maqsadli tayyorgarlik', desc: 'Imtihonlarga tayyor bo\'ling' },
    { icon: FiTrendingUp, title: 'Natijalaringizni kuzating', desc: 'Statistika va tahlil' },
  ]

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#000000]' : 'bg-white'}`}>
      {/* Left Side - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden ${isDark ? 'bg-[#000000]' : 'bg-white'}`}>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 py-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/50 to-transparent" />
              <svg viewBox="0 0 40 40" className="w-8 h-8 relative z-10">
                {/* Stylized P with checkmark */}
                <path
                  d="M12 8h10c4 0 7 3 7 7s-3 7-7 7h-6v10h-4V8z M16 18h6c1.5 0 3-1.5 3-3s-1.5-3-3-3h-6v6z"
                  fill="white"
                />
                <path
                  d="M22 24l3 3 6-6"
                  stroke="#4ade80"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ProExam</span>
          </div>

          {/* Main Text */}
          <h1 className={`text-4xl xl:text-5xl font-bold leading-tight mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Bilimingizni sinang,
          </h1>
          <h2 className={`text-4xl xl:text-5xl font-bold mb-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
            Muvaffaqiyatga erishing
          </h2>
          <p className={`text-lg mb-12 max-w-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            O'zbekistonning eng yirik onlayn ta'lim platformasida o'z bilimlaringizni sinab ko'ring va rivojlaning.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-10">
            {features.map((feature, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-xl ${
                  isDark
                    ? 'bg-[#111111] border border-gray-800'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <feature.icon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>
                <div>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.title}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Badge */}
          <div className={`flex items-center gap-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            <FiCheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
            <span className="text-sm">50,000+ talabalar bizga ishonadi</span>
          </div>
        </div>
      </div>

      {/* Back Button - Fixed Top Left */}
      <button
        onClick={() => navigate('/')}
        className={`fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
          isDark
            ? 'text-gray-400 hover:text-white hover:bg-white/10'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
      >
        <FiArrowLeft className="w-5 h-5" />
        <span className="font-medium">Orqaga</span>
      </button>

      {/* Theme Toggle - Fixed Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggleIcon />
      </div>

      {/* Right Side - Form */}
      <div className={`w-full lg:w-1/2 xl:w-2/5 flex flex-col ${isDark ? 'bg-[#000000]' : 'bg-white'}`}>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-lg">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 mb-4">
                <span className="text-2xl font-bold text-white">P</span>
              </div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>ProExam</h1>
            </div>

            {/* Form Card */}
            <Card className={isDark ? '!bg-[#111111] !border-gray-800' : ''}>
              <div className="text-center mb-6">
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{getTitle()}</h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{getSubtitle()}</p>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {formType === 'login' && (
                  <motion.div key="login" variants={formVariants} initial="initial" animate="animate" exit="exit">
                    <LoginForm onForgotPassword={handleForgotPassword} onSwitchToRegister={handleSwitchToRegister} />
                  </motion.div>
                )}
                {formType === 'register' && (
                  <motion.div key="register" variants={formVariants} initial="initial" animate="animate" exit="exit">
                    <RegisterForm onSuccess={handleRegisterSuccess} onSwitchToLogin={handleBackToLogin} />
                  </motion.div>
                )}
                {formType === 'forgot-password' && (
                  <motion.div key="forgot" variants={formVariants} initial="initial" animate="animate" exit="exit">
                    <ForgotPasswordFlow onBack={handleBackToLogin} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

            {/* Bottom Text */}
            <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Ro'yxatdan o'tish orqali siz bizning{' '}
              <a href="#" className="text-blue-500 hover:underline">Foydalanish shartlari</a>
              {' '}va{' '}
              <a href="#" className="text-blue-500 hover:underline">Maxfiylik siyosati</a>
              ga rozilik bildirasiz.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
