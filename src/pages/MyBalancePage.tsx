import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiCreditCard, FiCopy, FiX } from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa'
import { useAuth } from '@hooks/useAuth'
import { useTheme } from '@contexts/ThemeContext'
import { cn } from '@utils/cn'

interface TopUpInfo {
  id?: number
  Id?: string
  cardNumber?: string
  CardNumber?: string
  userAdmin?: string
  UserAdmin?: string
  fullName?: string
  FullName?: string
}

interface UserBalance {
  Amout?: number
  BalanceCode?: string
}

export const MyBalancePage = () => {
  const { user, token } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [balanceData, setBalanceData] = useState<UserBalance | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [topUpInfo, setTopUpInfo] = useState<TopUpInfo | null>(null)
  const [isLoadingTopUp, setIsLoadingTopUp] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchUserBalance()
  }, [])

  const fetchUserBalance = async () => {
    try {
      const response = await fetch('https://localhost:5001/api/UserBalance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log('UserBalance API response:', data)
        // API returns { Succeeded, Result, Errors } format
        if (data.Succeeded && data.Result) {
          setBalanceData(data.Result)
        } else {
          setBalanceData(data)
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error)
    } finally {
      setIsLoadingBalance(false)
    }
  }

  const fetchTopUpInfo = async () => {
    setIsLoadingTopUp(true)
    try {
      const response = await fetch('https://localhost:5001/api/BalanceTransaction', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log('BalanceTransaction API response:', data)
        // API returns { Succeeded, Result, Errors } format
        if (data.Succeeded && data.Result) {
          setTopUpInfo(data.Result)
        } else {
          setTopUpInfo(data)
        }
        setIsTopUpModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching top up info:', error)
    } finally {
      setIsLoadingTopUp(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('uz-UZ').format(balance)
  }

  return (
    <div className="p-6">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-96 rounded-2xl p-6 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 shadow-xl shadow-blue-500/20"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Balans</p>
            <p className="text-white text-3xl font-bold">
              {isLoadingBalance ? '...' : formatBalance(balanceData?.Amout ?? 0)} <span className="text-xl font-normal">so'm</span>
            </p>
            <p className="text-white/60 text-sm mt-1">ID: {balanceData?.BalanceCode}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <FiCreditCard className="text-white" size={24} />
          </div>
        </div>

        {/* Top Up Button */}
        <button
          onClick={fetchTopUpInfo}
          disabled={isLoadingTopUp}
          className="w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus size={18} />
          {isLoadingTopUp ? 'Yuklanmoqda...' : 'Balansni to\'ldirish'}
        </button>
      </motion.div>

      {/* Top Up Modal */}
      {isTopUpModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsTopUpModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'w-full max-w-md rounded-2xl p-6 border shadow-xl',
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn('text-xl font-bold flex items-center gap-2', isDark ? 'text-white' : 'text-gray-900')}>
                <FiCreditCard className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
                Balansni to'ldirish
              </h2>
              <button
                onClick={() => setIsTopUpModalOpen(false)}
                className={cn('p-2 rounded-lg transition-colors', isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500')}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {isLoadingTopUp ? (
              <div className="flex items-center justify-center py-12">
                <div className={cn(
                  'w-10 h-10 border-4 rounded-full animate-spin',
                  isDark ? 'border-cyan-500 border-t-transparent' : 'border-blue-500 border-t-transparent'
                )} />
              </div>
            ) : topUpInfo ? (
              <div className="space-y-4">
                {/* Info Text */}
                <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Balansni to'ldirish uchun quyidagi karta raqamiga pul o'tkazing va admin bilan bog'laning.
                </p>

                {/* Card Number */}
                <div className={cn('p-4 rounded-xl', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
                  <p className={cn('text-xs mb-2', isDark ? 'text-gray-500' : 'text-gray-500')}>
                    Karta raqami
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn('text-xl font-mono font-bold tracking-wider', isDark ? 'text-white' : 'text-gray-900')}>
                      {topUpInfo.CardNumber || topUpInfo.cardNumber}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyToClipboard(topUpInfo.CardNumber || topUpInfo.cardNumber || '')}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        isDark ? 'bg-gray-800 hover:bg-gray-700 text-cyan-400' : 'bg-gray-200 hover:bg-gray-300 text-blue-600'
                      )}
                    >
                      <FiCopy className="w-5 h-5" />
                    </motion.button>
                  </div>
                  <p className={cn('text-sm mt-2', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    {topUpInfo.FullName || topUpInfo.fullName}
                  </p>
                </div>

                {/* Admin Info */}
                <div className={cn('p-4 rounded-xl', isDark ? 'bg-gray-900' : 'bg-gray-50')}>
                  <p className={cn('text-xs mb-2', isDark ? 'text-gray-500' : 'text-gray-500')}>
                    Admin ma'lumotlari
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                    )}>
                      <FaTelegram className={cn('w-6 h-6', isDark ? 'text-blue-400' : 'text-blue-500')} />
                    </div>
                    <div>
                      <p className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                        {topUpInfo.FullName || topUpInfo.fullName}
                      </p>
                      <a
                        href={`https://t.me/${(topUpInfo.UserAdmin || topUpInfo.userAdmin || '').replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn('text-sm', isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700')}
                      >
                        {topUpInfo.UserAdmin || topUpInfo.userAdmin}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Telegram Button */}
                <a
                  href={`https://t.me/${(topUpInfo.UserAdmin || topUpInfo.userAdmin || '').replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors',
                    isDark
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                  )}
                >
                  <FaTelegram className="w-5 h-5" />
                  Telegram orqali bog'lanish
                </a>

                {/* Note */}
                <p className={cn('text-xs text-center', isDark ? 'text-gray-500' : 'text-gray-400')}>
                  To'lov chekini adminga yuboring
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={cn(isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Ma'lumotlarni yuklashda xatolik yuz berdi
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
