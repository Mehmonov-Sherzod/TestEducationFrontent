import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiLock, FiEye, FiEyeOff, FiCheck, FiAlertCircle } from 'react-icons/fi'
import { useAuth } from '@hooks/useAuth'
import { useTheme } from '@contexts/ThemeContext'
import { cn } from '@utils/cn'

export const ChangePasswordPage = () => {
  const { user, token } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (form.newPassword !== form.confirmPassword) {
      setMessage({ type: 'error', text: 'Yangi parollar mos kelmaydi' })
      return
    }

    if (form.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak' })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `https://localhost:5001/api/User/${user?.id}-Update-password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          }),
        }
      )

      if (response.ok) {
        setMessage({ type: 'success', text: 'Parol muvaffaqiyatli o\'zgartirildi' })
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.message || 'Xatolik yuz berdi' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Server bilan bog\'lanishda xatolik' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl p-6 shadow-xl',
          isDark
            ? 'bg-gray-800/50 border border-gray-700/50'
            : 'bg-white border border-gray-200'
        )}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isDark
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
                : 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10'
            )}
          >
            <FiLock
              className={isDark ? 'text-cyan-400' : 'text-blue-600'}
              size={24}
            />
          </div>
          <div>
            <h1
              className={cn(
                'text-xl font-bold',
                isDark ? 'text-white' : 'text-gray-900'
              )}
            >
              Parolni o'zgartirish
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Yangi parol kiriting
            </p>
          </div>
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-4 rounded-xl flex items-center gap-3 mb-6',
              message.type === 'success'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            )}
          >
            {message.type === 'success' ? (
              <FiCheck size={20} />
            ) : (
              <FiAlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label
              className={cn(
                'block text-sm font-medium mb-2',
                isDark ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Joriy parol
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                className={cn(
                  'w-full px-4 py-3 rounded-xl pr-12 transition-colors',
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                )}
                placeholder="Joriy parolingizni kiriting"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                }
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 p-1',
                  isDark ? 'text-gray-400' : 'text-gray-500'
                )}
              >
                {showPasswords.current ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              className={cn(
                'block text-sm font-medium mb-2',
                isDark ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Yangi parol
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className={cn(
                  'w-full px-4 py-3 rounded-xl pr-12 transition-colors',
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                )}
                placeholder="Yangi parolni kiriting"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                }
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 p-1',
                  isDark ? 'text-gray-400' : 'text-gray-500'
                )}
              >
                {showPasswords.new ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className={cn(
                'block text-sm font-medium mb-2',
                isDark ? 'text-gray-300' : 'text-gray-700'
              )}
            >
              Yangi parolni tasdiqlang
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className={cn(
                  'w-full px-4 py-3 rounded-xl pr-12 transition-colors',
                  isDark
                    ? 'bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-cyan-500'
                    : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                )}
                placeholder="Yangi parolni qayta kiriting"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })
                }
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2 p-1',
                  isDark ? 'text-gray-400' : 'text-gray-500'
                )}
              >
                {showPasswords.confirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3 rounded-xl font-medium transition-all mt-6',
              'bg-gradient-to-r from-cyan-500 to-blue-600 text-white',
              'hover:from-cyan-600 hover:to-blue-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? 'Saqlanmoqda...' : 'Parolni o\'zgartirish'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
