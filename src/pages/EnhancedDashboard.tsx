import { motion } from 'framer-motion'
import {
  FiBook,
  FiHelpCircle,
  FiClipboard,
  FiAward,
  FiTrendingUp,
  FiClock,
} from 'react-icons/fi'
import { Card } from '@components/shared/Card'
import { useAuth } from '@hooks/useAuth'
import { useTheme } from '@contexts/ThemeContext'

export const EnhancedDashboard = () => {
  const { user } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const stats = [
    {
      label: 'Total Subjects',
      value: '12',
      icon: <FiBook className="w-8 h-8" />,
      color: 'from-blue-600 to-blue-400',
      change: '+2 this month',
    },
    {
      label: 'Questions Practiced',
      value: '324',
      icon: <FiHelpCircle className="w-8 h-8" />,
      color: 'from-purple-600 to-purple-400',
      change: '+48 this week',
    },
    {
      label: 'Tests Completed',
      value: '15',
      icon: <FiClipboard className="w-8 h-8" />,
      color: 'from-white to-gray-100',
      change: '+3 this week',
    },
    {
      label: 'Average Score',
      value: '85%',
      icon: <FiAward className="w-8 h-8" />,
      color: 'from-green-600 to-green-400',
      change: '+5% improvement',
    },
  ]

  const recentActivity = [
    { subject: 'Mathematics', score: 92, date: '2 hours ago' },
    { subject: 'Physics', score: 88, date: '1 day ago' },
    { subject: 'Chemistry', score: 76, date: '2 days ago' },
  ]

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
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Welcome back, {user?.fullName}!
        </h1>
        <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
          Here's what's happening with your learning today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div key={stat.label} variants={itemVariants}>
            <Card hoverable className="relative overflow-hidden">
              {/* Gradient Background */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl`}
              />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg`}
                  >
                    {stat.icon}
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
                  >
                    <FiTrendingUp className="text-green-400" />
                  </motion.div>
                </div>

                <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                <p className="text-xs text-green-400">{stat.change}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FiClock className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
              Recent Activity
            </h2>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors ${isDark ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}
                >
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.subject}</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{activity.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {activity.score}%
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Score</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h2>

            <div className="space-y-3">
              {[
                {
                  label: 'Start New Test',
                  icon: <FiClipboard />,
                  iconColor: isDark ? 'text-cyan-400' : 'text-blue-600',
                  bgColor: isDark ? 'bg-cyan-500/20' : 'bg-blue-100',
                },
                {
                  label: 'Browse Subjects',
                  icon: <FiBook />,
                  iconColor: isDark ? 'text-blue-400' : 'text-blue-500',
                  bgColor: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
                },
                {
                  label: 'Practice Questions',
                  icon: <FiHelpCircle />,
                  iconColor: isDark ? 'text-purple-400' : 'text-purple-500',
                  bgColor: isDark ? 'bg-purple-500/20' : 'bg-purple-100',
                },
                {
                  label: 'View Results',
                  icon: <FiAward />,
                  iconColor: isDark ? 'text-green-400' : 'text-green-500',
                  bgColor: isDark ? 'bg-green-500/20' : 'bg-green-100',
                },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all ${isDark ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'}`}
                >
                  <div className={`p-2 rounded-lg ${action.bgColor} ${action.iconColor}`}>
                    {action.icon}
                  </div>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{action.label}</span>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
