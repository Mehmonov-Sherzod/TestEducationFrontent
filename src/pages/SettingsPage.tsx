import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@contexts/ThemeContext'
import { useAuth } from '@hooks/useAuth'
import { cn } from '@utils/cn'
import { userService } from '@api/user.service'
import toast from 'react-hot-toast'

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const isDark = theme === 'dark'
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  return (
    <div className="w-full py-2">
      <div className="w-full space-y-3">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-xl border',
            isDark ? 'bg-[#111111] border-gray-800' : 'bg-white border-gray-200'
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className={cn(
                'font-medium',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                Parolni o'zgartirish
              </h3>
              <p className={cn(
                'text-sm mt-0.5',
                isDark ? 'text-gray-500' : 'text-gray-500'
              )}>
                Oxirgi o'zgarish 3 oy oldin
              </p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                isDark
                  ? 'bg-[#1a1a1a] hover:bg-[#222] text-white border border-gray-700'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              )}
            >
              Yangilash
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={cn(
            'rounded-xl border',
            isDark ? 'bg-[#111111] border-gray-800' : 'bg-white border-gray-200'
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className={cn(
                'font-medium',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                {isDark ? 'Tungi rejim' : 'Kunduzgi rejim'}
              </h3>
              <p className={cn(
                'text-sm mt-0.5',
                isDark ? 'text-gray-500' : 'text-gray-500'
              )}>
                {isDark ? 'Qorong\'u tema yoqilgan' : 'Yorug\' tema yoqilgan'}
              </p>
            </div>
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={cn(
                'relative w-12 h-7 rounded-full transition-all duration-300',
                isDark ? 'bg-blue-500' : 'bg-gray-300'
              )}
            >
              <motion.div
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
                animate={{ left: isDark ? '26px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'rounded-xl border',
            isDark ? 'bg-[#111111] border-gray-800' : 'bg-white border-gray-200'
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className={cn(
                'font-medium',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                Hisobdan chiqish
              </h3>
              <p className={cn(
                'text-sm mt-0.5',
                isDark ? 'text-gray-500' : 'text-gray-500'
              )}>
                Joriy qurilmadan chiqish
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-red-500 hover:bg-red-600 text-white"
            >
              Chiqish
            </button>
          </div>
        </motion.div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && user && (
        <PasswordModal
          isDark={isDark}
          userId={user.id}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </div>
  )
}

// Password Change Modal
const PasswordModal = ({ isDark, userId, onClose }: { isDark: boolean; userId: number; onClose: () => void }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Parollar mos kelmaydi')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Parol kamida 6 ta belgi bo\'lishi kerak')
      return
    }

    setIsLoading(true)
    try {
      await userService.updatePassword(userId, {
        oldPassword: currentPassword,
        newPassword: newPassword,
      })
      toast.success('Parol muvaffaqiyatli o\'zgartirildi')
      onClose()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      if (err.response?.data?.message) {
        toast.error(err.response.data.message)
      } else {
        toast.error('Xatolik yuz berdi')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'relative w-full max-w-md rounded-2xl p-6',
          isDark ? 'bg-[#111111]' : 'bg-white'
        )}
      >
        <h2 className={cn(
          'text-lg font-semibold mb-4',
          isDark ? 'text-white' : 'text-gray-900'
        )}>
          Parolni o'zgartirish
        </h2>

        <div className="space-y-4">
          <div>
            <label className={cn(
              'block text-sm font-medium mb-2',
              isDark ? 'text-gray-300' : 'text-gray-700'
            )}>
              Joriy parol
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Joriy parolni kiriting"
              className={cn(
                'w-full px-4 py-3 rounded-xl text-sm outline-none',
                isDark
                  ? 'bg-[#1a1a1a] text-white placeholder:text-gray-600 ring-1 ring-gray-800 focus:ring-blue-500'
                  : 'bg-gray-50 text-gray-900 placeholder:text-gray-400 ring-1 ring-gray-200 focus:ring-blue-500'
              )}
            />
          </div>

          <div>
            <label className={cn(
              'block text-sm font-medium mb-2',
              isDark ? 'text-gray-300' : 'text-gray-700'
            )}>
              Yangi parol
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yangi parolni kiriting"
              className={cn(
                'w-full px-4 py-3 rounded-xl text-sm outline-none',
                isDark
                  ? 'bg-[#1a1a1a] text-white placeholder:text-gray-600 ring-1 ring-gray-800 focus:ring-blue-500'
                  : 'bg-gray-50 text-gray-900 placeholder:text-gray-400 ring-1 ring-gray-200 focus:ring-blue-500'
              )}
            />
          </div>

          <div>
            <label className={cn(
              'block text-sm font-medium mb-2',
              isDark ? 'text-gray-300' : 'text-gray-700'
            )}>
              Parolni tasdiqlang
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yangi parolni tasdiqlang"
              className={cn(
                'w-full px-4 py-3 rounded-xl text-sm outline-none',
                isDark
                  ? 'bg-[#1a1a1a] text-white placeholder:text-gray-600 ring-1 ring-gray-800 focus:ring-blue-500'
                  : 'bg-gray-50 text-gray-900 placeholder:text-gray-400 ring-1 ring-gray-200 focus:ring-blue-500'
              )}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className={cn(
              'flex-1 py-3 rounded-xl text-sm font-medium transition-all',
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            )}
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className="flex-1 py-3 rounded-xl text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
