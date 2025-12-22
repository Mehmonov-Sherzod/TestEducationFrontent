import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiLogOut, FiUser, FiMail, FiShield } from 'react-icons/fi'
import { AnimatedBackground } from '@components/shared/AnimatedBackground'
import { Card } from '@components/shared/Card'
import { Button } from '@components/shared/Button'
import { useAuth } from '@hooks/useAuth'
import { useTheme } from '@contexts/ThemeContext'
import { ROUTES } from '@utils/constants'

export const Dashboard = () => {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate(ROUTES.AUTH)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Dashboard Content */}
      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>
            <p className={`mt-1 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back, {user?.fullName || 'User'}!
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <FiLogOut />
            Logout
          </Button>
        </motion.div>

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        >
          {/* User Info Card */}
          <motion.div variants={itemVariants}>
            <Card hoverable>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className={`w-12 sm:w-16 h-12 sm:h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDark
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
                    : 'bg-gradient-to-br from-purple-500 to-pink-600'
                }`}>
                  <FiUser className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className={`font-semibold text-base sm:text-lg truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.fullName}</h3>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Student</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <FiMail className={`flex-shrink-0 ${isDark ? 'text-cyan-400' : 'text-purple-600'}`} />
                  <span className={`truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user?.email}</span>
                </div>
                {user?.roles && user.roles.length > 0 && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <FiShield className={`flex-shrink-0 ${isDark ? 'text-cyan-400' : 'text-purple-600'}`} />
                    <span className={`truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.roles.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Placeholder Cards */}
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card hoverable className="h-full">
                <div className="text-center py-4 sm:py-8">
                  <div className={`w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-white/20' : 'bg-purple-500/10'
                  }`}>
                    <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full ${isDark ? 'bg-white/50' : 'bg-purple-500/30'}`} />
                  </div>
                  <h3 className={`font-semibold mb-1 sm:mb-2 text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>Coming Soon</h3>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Feature placeholder {i}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[90%] sm:max-w-sm"
          >
            <Card>
              <h3 className={`text-lg sm:text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirm Logout</h3>
              <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Are you sure you want to logout?
              </p>

              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
