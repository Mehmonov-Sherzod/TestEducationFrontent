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
        `/api/User/${user?.id}-Update-password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            OldPassword: form.currentPassword,
            NewPassword: form.newPassword,
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-xl p-6 sm:p-8 border',
            isDark
              ? 'bg-[#151515] border-gray-600/30'
              : 'bg-white border-gray-200 shadow-lg'
          )}
        >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isDark
                ? 'bg-blue-500/20'
                : 'bg-blue-100'
            )}
          >
            <FiLock
              className={cn('w-6 h-6', isDark ? 'text-blue-400' : 'text-blue-600')}
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
            <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
              Yangi parol kiriting
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-4 rounded-lg flex items-center gap-3 mb-6',
              message.type === 'success'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-red-500/10 text-red-500'
            )}
          >
            {message.type === 'success' ? (
              <FiCheck className="w-5 h-5 flex-shrink-0" />
            ) : (
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label
              className={cn(
                'block text-sm font-medium mb-2',
                isDark ? 'text-white' : 'text-gray-700'
              )}
            >
              Joriy parol
            </label>
            <div className={cn(
              'flex items-center rounded-lg border transition-colors',
              isDark
                ? 'bg-[#1a1a1a] border-gray-600/30 focus-within:border-blue-500'
                : 'bg-gray-50 border-gray-200 focus-within:border-blue-500'
            )}>
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({ ...form, currentPassword: e.target.value })
                }
                className={cn(
                  'flex-1 px-4 py-3 bg-transparent outline-none text-sm',
                  isDark
                    ? 'text-white placeholder-gray-500'
                    : 'text-gray-900 placeholder-gray-400'
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
                  'px-4 py-3',
                  isDark ? 'text-gray-500' : 'text-gray-400'
                )}
              >
                {showPasswords.current ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label
              className={cn(
                'block text-sm font-medium mb-2',
                isDark ? 'text-white' : 'text-gray-700'
              )}
            >
              Yangi parol
            </label>
            <div className={cn(
              'flex items-center rounded-lg border transition-colors',
              isDark
                ? 'bg-[#1a1a1a] border-gray-600/30 focus-within:border-blue-500'
                : 'bg-gray-50 border-gray-200 focus-within:border-blue-500'
            )}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className={cn(
                  'flex-1 px-4 py-3 bg-transparent outline-none text-sm',
                  isDark
                    ? 'text-white placeholder-gray-500'
                    : 'text-gray-900 placeholder-gray-400'
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
                  'px-4 py-3',
                  isDark ? 'text-gray-500' : 'text-gray-400'
                )}
              >
                {showPasswords.new ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              className={cn(
                'block text-sm font-medium mb-2',
                isDark ? 'text-white' : 'text-gray-700'
              )}
            >
              Yangi parolni tasdiqlang
            </label>
            <div className={cn(
              'flex items-center rounded-lg border transition-colors',
              isDark
                ? 'bg-[#1a1a1a] border-gray-600/30 focus-within:border-blue-500'
                : 'bg-gray-50 border-gray-200 focus-within:border-blue-500'
            )}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className={cn(
                  'flex-1 px-4 py-3 bg-transparent outline-none text-sm',
                  isDark
                    ? 'text-white placeholder-gray-500'
                    : 'text-gray-900 placeholder-gray-400'
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
                  'px-4 py-3',
                  isDark ? 'text-gray-500' : 'text-gray-400'
                )}
              >
                {showPasswords.confirm ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'w-full py-3 rounded-lg font-medium transition-all mt-2 text-sm',
              'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
              'hover:from-blue-600 hover:to-cyan-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? 'Saqlanmoqda...' : 'Parolni o\'zgartirish'}
          </button>
        </form>
        </motion.div>
      </div>
    </div>
  )
}
