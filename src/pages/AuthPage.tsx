import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AnimatedBackground } from '@components/shared/AnimatedBackground'
import { ThemeToggleIcon } from '@components/shared/ThemeToggle'
import { useTheme } from '@contexts/ThemeContext'
import { ROUTES } from '@utils/constants'
import {
  FiUsers,
  FiFileText,
  FiAward,
  FiTrendingUp,
  FiBookOpen,
  FiTarget,
  FiZap,
  FiShield,
  FiUserPlus,
  FiEdit3,
  FiBarChart2,
  FiChevronDown,
  FiMail,
  FiPhone,
  FiMapPin,
  FiInstagram,
  FiFacebook,
  FiYoutube,
  FiPlay,
} from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa'

export const AuthPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()

  // Data
  const stats = [
    { icon: FiUsers, value: '10,000+', label: 'Foydalanuvchilar' },
    { icon: FiFileText, value: '50,000+', label: 'Testlar' },
    { icon: FiAward, value: '95%', label: 'Muvaffaqiyat' },
    { icon: FiTrendingUp, value: '4.9', label: 'Reyting' },
  ]

  const features = [
    { icon: FiBookOpen, title: 'Keng test bazasi', desc: 'Barcha fanlar bo\'yicha 50,000+ professional test savollari' },
    { icon: FiTarget, title: 'Maqsadli tayyorgarlik', desc: 'DTM, IELTS, SAT va boshqa imtihonlarga maxsus tayyorgarlik' },
    { icon: FiZap, title: 'Tezkor natijalar', desc: 'Test yakunlangandan so\'ng darhol batafsil tahlil' },
    { icon: FiShield, title: 'Ishonchli platforma', desc: '24/7 texnik yordam va xavfsiz ma\'lumotlar himoyasi' },
  ]

  const subjects = [
    { name: 'Matematika', tests: 8500, color: 'from-blue-500 to-blue-600', emoji: '📐' },
    { name: 'Kimyo', tests: 6200, color: 'from-green-500 to-green-600', emoji: '🧪' },
    { name: 'Fizika', tests: 7100, color: 'from-purple-500 to-purple-600', emoji: '⚛️' },
    { name: 'Biologiya', tests: 5800, color: 'from-pink-500 to-pink-600', emoji: '🧬' },
    { name: 'Geografiya', tests: 4200, color: 'from-cyan-500 to-cyan-600', emoji: '🌍' },
    { name: 'Tarix', tests: 5500, color: 'from-orange-500 to-orange-600', emoji: '🏛️' },
    { name: 'Ingliz tili', tests: 9000, color: 'from-red-500 to-red-600', emoji: '🇬🇧' },
    { name: 'Ona tili', tests: 4800, color: 'from-indigo-500 to-indigo-600', emoji: '📚' },
  ]

  const steps = [
    { num: 1, icon: FiUserPlus, title: 'Ro\'yxatdan o\'ting', desc: 'Bepul hisob yarating va platformaga kiring' },
    { num: 2, icon: FiBookOpen, title: 'Fan tanlang', desc: 'O\'zingizga kerakli fanni tanlang' },
    { num: 3, icon: FiEdit3, title: 'Test yechish', desc: 'Testlarni yechib, bilimingizni sinang' },
    { num: 4, icon: FiBarChart2, title: 'Natijalarni ko\'ring', desc: 'Batafsil tahlil va tavsiyalar oling' },
  ]

  const faqs = [
    { q: 'ProExam qanday ishlaydi?', a: 'Ro\'yxatdan o\'tib, kerakli fanni tanlab, testlarni yechishingiz mumkin. Har bir test yakunida batafsil tahlil va tavsiyalar olasiz.' },
    { q: 'Bepul versiyada nimalar bor?', a: 'Bepul versiyada kuniga 10 ta test, 3 ta fan va asosiy tahlil imkoniyatlari mavjud.' },
    { q: 'Testlar qayerdan olingan?', a: 'Testlar DTM, IELTS va boshqa rasmiy manbalardan professional o\'qituvchilar tomonidan tayyorlangan.' },
    { q: 'Guruh uchun chegirma bormi?', a: 'Ha, 10+ foydalanuvchi uchun 30% gacha chegirma beramiz. Biz bilan bog\'laning.' },
  ]

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f8fafc]'}`}>
      {/* Animated Background - only for hero */}
      <div className="absolute inset-0 h-screen">
        <AnimatedBackground />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all ${isDark ? 'bg-[#0a0a0a]/90' : 'bg-[#f8fafc]/90'} backdrop-blur-md border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>ProExam</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['Xususiyatlar', 'Fanlar', 'FAQ'].map((item, i) => (
                <button key={i} onClick={() => scrollToSection(item.toLowerCase())} className={`text-sm font-medium transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                  {item}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggleIcon />
              <motion.button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="px-5 py-2 rounded-xl font-medium text-sm bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Kirish
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium mb-6">
                <FiZap className="w-4 h-4" />
                #1 Ta'lim platformasi O'zbekistonda
              </div>
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Muvaffaqiyat yo'lida
                <span className="text-blue-500"> har kuni </span>
                o'sish
              </h1>
              <p className={`text-lg sm:text-xl leading-relaxed mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Kitoblardan tanlangan savollar, professional tayyorlangan testlar, tezkor natijalar. Bilimingizni sinab, kelajagingizni quring!
              </p>
              <div className="flex flex-wrap gap-4 mb-12">
                <motion.button
                  onClick={() => navigate(ROUTES.LOGIN)}
                  className="px-8 py-4 rounded-xl font-semibold text-white bg-blue-500 hover:bg-blue-600 shadow-xl shadow-blue-500/30 transition-all flex items-center gap-2"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Bepul boshlash
                  <FiPlay className="w-5 h-5" />
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection('xususiyatlar')}
                  className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 border-2 ${isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Batafsil
                </motion.button>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                  const IconComponent = stat.icon
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="text-center"
                    >
                      <IconComponent className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                      <div className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{stat.label}</div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
            {/* Right Content - Images */}
            <motion.div
              className="relative hidden lg:block"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative flex justify-center -space-x-12">
                <motion.img
                  src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=90"
                  alt="Online test"
                  className="w-56 h-72 object-cover rounded-2xl shadow-2xl border-4 border-white -rotate-6"
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                  style={{ zIndex: 1 }}
                />
                <motion.img
                  src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=90"
                  alt="Books"
                  className="w-56 h-72 object-cover rounded-2xl shadow-2xl border-4 border-white rotate-3"
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                  style={{ zIndex: 2 }}
                />
                <motion.img
                  src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&q=90"
                  alt="Student"
                  className="w-56 h-72 object-cover rounded-2xl shadow-2xl border-4 border-white -rotate-3"
                  whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                  style={{ zIndex: 3 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="xususiyatlar" className={`relative z-10 py-24 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-semibold mb-4">
              Xususiyatlar
            </span>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Nega aynan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">ProExam</span>?
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Platformamizning o'ziga xos xususiyatlari bilan tanishing
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={i}
                  className={`group p-8 rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${isDark ? 'bg-[#151515] border-gray-800 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10' : 'bg-white border-gray-200 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20'}`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="fanlar" className={`relative z-10 py-24 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-semibold mb-4">
              Fanlar
            </span>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Barcha <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">fanlar</span> bir joyda
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              8 ta asosiy fan bo'yicha 50,000+ test savollari
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((subject, i) => (
              <div
                key={i}
                className={`p-6 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 shadow-lg ${isDark ? 'bg-[#151515] border-gray-800 hover:border-gray-700 shadow-black/20' : 'bg-white border-gray-200 hover:shadow-xl shadow-gray-200'}`}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center mb-4 text-2xl`}>
                  {subject.emoji}
                </div>
                <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{subject.name}</h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{subject.tests.toLocaleString()} test</p>
                <button className="w-full py-2 rounded-lg text-sm font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors">
                  Boshlash
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={`py-24 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full ${isDark ? 'bg-blue-500/5' : 'bg-blue-500/10'} blur-3xl`} />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-semibold mb-4">
              Qanday ishlaydi?
            </span>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">4 oddiy qadam</span> bilan boshlang
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Ro'yxatdan o'tish va testni boshlash juda oson
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-blue-500/20 via-blue-500 to-blue-500/20" />
            {steps.map((step, i) => {
              const IconComponent = step.icon
              return (
                <div key={i} className="text-center relative">
                  <div className="relative inline-block mb-8">
                    <div className={`w-32 h-32 rounded-3xl flex items-center justify-center relative transition-transform hover:scale-105 ${isDark ? 'bg-[#151515] border border-gray-800' : 'bg-white shadow-xl'}`}>
                      <IconComponent className="w-12 h-12 text-blue-500" />
                      <div className="absolute -top-3 -right-3 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-blue-500/30">
                        {step.num}
                      </div>
                    </div>
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`relative z-10 py-24 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ko'p so'raladigan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">savollar</span>
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Savollaringizga javob toping
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${openFaq === i ? (isDark ? 'border-blue-500/50 bg-blue-500/5' : 'border-blue-500/50 bg-blue-50') : (isDark ? 'bg-[#151515] border-gray-800 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300')}`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className={`w-full px-6 py-5 flex items-center justify-between text-left gap-4`}
                >
                  <span className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{faq.q}</span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${openFaq === i ? 'bg-blue-500 rotate-180' : isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <FiChevronDown className={`w-5 h-5 transition-colors ${openFaq === i ? 'text-white' : isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className={`px-6 pb-6 text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={`py-24 px-4 sm:px-6 lg:px-8 relative z-10 overflow-hidden ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'} blur-3xl`} />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div
            className={`text-center p-12 sm:p-16 rounded-[2.5rem] border ${isDark ? 'bg-[#151515]/80 border-gray-800 backdrop-blur-xl' : 'bg-white/80 border-gray-200 backdrop-blur-xl shadow-2xl'}`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-500 text-sm font-semibold mb-6">
              <FiZap className="w-4 h-4" />
              Bugun boshlang
            </div>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Muvaffaqiyatga birinchi qadamni
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600"> bugun </span>
              tashlang
            </h2>
            <p className={`text-lg sm:text-xl mb-10 max-w-2xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              10,000+ foydalanuvchi allaqachon bizga qo'shildi. Siz ham kechikib qolmang!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Bepul ro'yxatdan o'tish
                <FiPlay className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('xususiyatlar')}
                className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-lg border-2 transition-all ${isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Batafsil ma'lumot
              </motion.button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 py-20 px-4 sm:px-6 lg:px-8 ${isDark ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-white font-bold text-xl">P</span>
                </div>
                <span className={`font-bold text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>ProExam</span>
              </div>
              <p className={`text-base mb-6 max-w-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                O'zbekistonning #1 online test platformasi. Sifatli ta'lim - yorug' kelajak!
              </p>
              <div className="flex gap-3">
                {[
                  { icon: FaTelegram, color: 'hover:bg-blue-500 hover:text-white' },
                  { icon: FiInstagram, color: 'hover:bg-pink-500 hover:text-white' },
                  { icon: FiFacebook, color: 'hover:bg-blue-600 hover:text-white' },
                  { icon: FiYoutube, color: 'hover:bg-red-500 hover:text-white' },
                ].map((item, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-[#151515] text-gray-400' : 'bg-gray-100 text-gray-600'} ${item.color}`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className={`font-bold text-lg mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Tezkor havolalar</h4>
              <ul className="space-y-4">
                {['Bosh sahifa', 'Fanlar', 'Narxlar', 'Yordam'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className={`text-base transition-colors hover:text-blue-500 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className={`font-bold text-lg mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Huquqiy</h4>
              <ul className="space-y-4">
                {['Foydalanish shartlari', 'Maxfiylik siyosati', 'Cookie siyosati'].map((item, i) => (
                  <li key={i}>
                    <a href="#" className={`text-base transition-colors hover:text-blue-500 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 className={`font-bold text-lg mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Bog'lanish</h4>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:mehmovovsherzod@gmail.com" className={`flex items-center gap-3 text-base transition-colors hover:text-blue-500 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#151515]' : 'bg-gray-100'}`}>
                      <FiMail className="w-5 h-5" />
                    </div>
                    mehmovovsherzod@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+998901537776" className={`flex items-center gap-3 text-base transition-colors hover:text-blue-500 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#151515]' : 'bg-gray-100'}`}>
                      <FiPhone className="w-5 h-5" />
                    </div>
                    +998 90 153 77 76
                  </a>
                </li>
                <li className={`flex items-center gap-3 text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#151515]' : 'bg-gray-100'}`}>
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  Toshkent, O'zbekiston
                </li>
              </ul>
            </div>
          </div>
          {/* Bottom bar */}
          <div className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              © 2025 ProExam. Barcha huquqlar himoyalangan.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className={`text-sm transition-colors hover:text-blue-500 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Maxfiylik</a>
              <a href="#" className={`text-sm transition-colors hover:text-blue-500 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Shartlar</a>
              <a href="#" className={`text-sm transition-colors hover:text-blue-500 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
