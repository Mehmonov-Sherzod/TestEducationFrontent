import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@contexts/ThemeContext'
import { useAuth } from '@hooks/useAuth'
import { useAuthStore } from '@store/authStore'
import { cn } from '@utils/cn'
import { userService } from '@api/user.service'
import toast from 'react-hot-toast'
import { FiAlertTriangle } from 'react-icons/fi'

export const SettingsPage = () => {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const { token } = useAuthStore()
  const isDark = theme === 'dark'
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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

        {/* Delete Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cn(
            'rounded-xl border',
            isDark ? 'bg-[#111111] border-red-900/50' : 'bg-white border-red-200'
          )}
        >
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className={cn(
                'font-medium',
                isDark ? 'text-red-400' : 'text-red-600'
              )}>
                Hisobni o'chirish
              </h3>
              <p className={cn(
                'text-sm mt-0.5',
                isDark ? 'text-gray-500' : 'text-gray-500'
              )}>
                Hisobingiz va barcha ma'lumotlaringiz o'chiriladi
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-red-600 hover:bg-red-700 text-white"
            >
              O'chirish
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

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          isDark={isDark}
          token={token}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={logout}
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

// Delete Account Modal
const DeleteAccountModal = ({
  isDark,
  token,
  onClose,
  onSuccess
}: {
  isDark: boolean
  token: string | null
  onClose: () => void
  onSuccess: () => void
}) => {
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== 'O\'CHIRISH') {
      toast.error('Tasdiqlash uchun "O\'CHIRISH" so\'zini kiriting')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/User', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.Succeeded) {
        toast.success('Hisobingiz muvaffaqiyatli o\'chirildi')
        onSuccess()
      } else {
        const errorMessage = data.Errors?.join(', ') || 'Xatolik yuz berdi'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error('Xatolik yuz berdi')
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
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            'p-2 rounded-full',
            isDark ? 'bg-red-500/20' : 'bg-red-100'
          )}>
            <FiAlertTriangle className={cn(
              'w-6 h-6',
              isDark ? 'text-red-400' : 'text-red-600'
            )} />
          </div>
          <h2 className={cn(
            'text-lg font-semibold',
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            Hisobni o'chirish
          </h2>
        </div>

        <div className={cn(
          'p-4 rounded-xl mb-4',
          isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
        )}>
          <p className={cn(
            'text-sm',
            isDark ? 'text-gray-300' : 'text-gray-700'
          )}>
            <strong>Ogohlantirish:</strong> Bu amal qaytarib bo'lmaydi. Hisobingiz va barcha ma'lumotlaringiz butunlay o'chiriladi.
          </p>
        </div>

        <div className="mb-4">
          <label className={cn(
            'block text-sm font-medium mb-2',
            isDark ? 'text-gray-300' : 'text-gray-700'
          )}>
            Tasdiqlash uchun <strong>"O'CHIRISH"</strong> so'zini kiriting
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="O'CHIRISH"
            className={cn(
              'w-full px-4 py-3 rounded-xl text-sm outline-none',
              isDark
                ? 'bg-[#1a1a1a] text-white placeholder:text-gray-600 ring-1 ring-gray-800 focus:ring-red-500'
                : 'bg-gray-50 text-gray-900 placeholder:text-gray-400 ring-1 ring-gray-200 focus:ring-red-500'
            )}
          />
        </div>

        <div className="flex gap-3">
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
            onClick={handleDelete}
            disabled={isLoading || confirmText !== "O'CHIRISH"}
            className="flex-1 py-3 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'O\'chirilmoqda...' : 'O\'chirish'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
