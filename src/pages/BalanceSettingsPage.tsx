import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCreditCard, FiUser, FiSave, FiEdit2 } from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa'
import { useTheme } from '@contexts/ThemeContext'
import { useAuthStore } from '@store/authStore'
import { API_BASE_URL } from '@utils/constants'
import toast from 'react-hot-toast'

interface BalanceTransactionInfo {
  id: string
  cardNumber: string
  userAdmin: string
  fullName: string
}

export const BalanceSettingsPage = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { token } = useAuthStore()

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [info, setInfo] = useState<BalanceTransactionInfo | null>(null)
  const [form, setForm] = useState({
    cardNumber: '',
    userAdmin: '',
    fullName: '',
  })

  // Fetch current info
  useEffect(() => {
    const fetchInfo = async () => {
      if (!token) return

      try {
        const response = await fetch(`${API_BASE_URL}/api/BalanceTransaction`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        const data = await response.json()
        console.log('BalanceTransaction info:', data)

        if (data.Succeeded && data.Result) {
          const result = data.Result
          setInfo({
            id: result.Id || '',
            cardNumber: result.CardNumber || '',
            userAdmin: result.UserAdmin || '',
            fullName: result.FullName || '',
          })
          setForm({
            cardNumber: result.CardNumber || '',
            userAdmin: result.UserAdmin || '',
            fullName: result.FullName || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch balance transaction info:', error)
        toast.error('Ma\'lumotlarni yuklashda xatolik')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInfo()
  }, [token])

  // Handle update
  const handleUpdate = async () => {
    if (!token) return

    if (!form.cardNumber.trim()) {
      toast.error('Karta raqamini kiriting')
      return
    }
    if (!form.userAdmin.trim()) {
      toast.error('Telegram username kiriting')
      return
    }
    if (!form.fullName.trim()) {
      toast.error('To\'liq ismni kiriting')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/BalanceTransaction?Id=${info?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          CardNumber: form.cardNumber,
          UserAdmin: form.userAdmin,
          FullName: form.fullName,
        }),
      })

      const data = await response.json()
      console.log('Update response:', data)

      if (data.Succeeded) {
        toast.success('Ma\'lumotlar muvaffaqiyatli yangilandi!')
        setInfo({
          ...info!,
          cardNumber: form.cardNumber,
          userAdmin: form.userAdmin,
          fullName: form.fullName,
        })
        setIsEditing(false)
      } else {
        toast.error(data.Errors?.join(', ') || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Failed to update:', error)
      toast.error('Xatolik yuz berdi')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 border-4 rounded-full animate-spin ${
          isDark ? 'border-cyan-500 border-t-transparent' : 'border-blue-500 border-t-transparent'
        }`} />
      </div>
    )
  }

  return (
    <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Balans sozlamalari
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            To'lov qabul qilish uchun karta va admin ma'lumotlari
          </p>
        </motion.div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'
          }`}
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FiCreditCard className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
              To'lov ma'lumotlari
            </h2>
            {!isEditing && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <FiEdit2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            )}
          </div>

          {!isEditing ? (
            /* View Mode */
            <div className="space-y-3 sm:space-y-4">
              {/* Card Number */}
              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <FiCreditCard className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Karta raqami</p>
                </div>
                <p className={`text-lg sm:text-xl font-mono font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {info?.cardNumber || 'Kiritilmagan'}
                </p>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {info?.fullName || ''}
                </p>
              </div>

              {/* Admin Info */}
              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <FaTelegram className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Admin Telegram</p>
                </div>
                <p className={`text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {info?.userAdmin || 'Kiritilmagan'}
                </p>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-3 sm:space-y-4">
              {/* Card Number */}
              <div>
                <label className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FiCreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Karta raqami
                </label>
                <input
                  type="text"
                  value={form.cardNumber}
                  onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                  placeholder="8600 1234 5678 9012"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border focus:outline-none focus:ring-2 font-mono text-sm sm:text-base ${
                    isDark
                      ? 'bg-gray-900 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500'
                  }`}
                />
              </div>

              {/* Full Name */}
              <div>
                <label className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FiUser className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Karta egasi (F.I.O)
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Ism Familiya"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border focus:outline-none focus:ring-2 text-sm sm:text-base ${
                    isDark
                      ? 'bg-gray-900 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500'
                  }`}
                />
              </div>

              {/* Telegram Username */}
              <div>
                <label className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FaTelegram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Telegram username
                </label>
                <input
                  type="text"
                  value={form.userAdmin}
                  onChange={(e) => setForm({ ...form, userAdmin: e.target.value })}
                  placeholder="@username"
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border focus:outline-none focus:ring-2 text-sm sm:text-base ${
                    isDark
                      ? 'bg-gray-900 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-blue-500'
                  }`}
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsEditing(false)
                    setForm({
                      cardNumber: info?.cardNumber || '',
                      userAdmin: info?.userAdmin || '',
                      fullName: info?.fullName || '',
                    })
                  }}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdate}
                  disabled={isSaving}
                  className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium flex items-center justify-center gap-2 transition-colors text-sm sm:text-base ${
                    isDark
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FiSave className="w-4 h-4" />
                  {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default BalanceSettingsPage
