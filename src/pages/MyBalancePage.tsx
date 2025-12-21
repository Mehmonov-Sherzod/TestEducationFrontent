import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiCreditCard, FiCopy, FiCheck } from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa'
import { useAuth } from '@hooks/useAuth'
import { useTheme } from '@contexts/ThemeContext'
import { cn } from '@utils/cn'

interface TopUpInfo {
  id: number
  cardNumber: string
  userAdmin: string
  fullName: string
}

export const MyBalancePage = () => {
  const { user, token } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [topUpInfo, setTopUpInfo] = useState<TopUpInfo | null>(null)
  const [isLoadingTopUp, setIsLoadingTopUp] = useState(false)
  const [copied, setCopied] = useState(false)

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
        setTopUpInfo(data)
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
        className="w-80 rounded-2xl p-5 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 shadow-xl shadow-blue-500/20"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Balans</p>
            <p className="text-white text-3xl font-bold">
              {formatBalance(user?.balance || 0)} <span className="text-xl font-normal">so'm</span>
            </p>
            <p className="text-white/60 text-sm mt-1">ID: {user?.id}</p>
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
      {isTopUpModalOpen && topUpInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsTopUpModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'w-full max-w-md rounded-2xl p-6 shadow-2xl',
              isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-gray-200'
            )}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  isDark ? 'bg-green-500/20' : 'bg-green-100'
                )}
              >
                <FiCreditCard className={isDark ? 'text-green-400' : 'text-green-600'} size={20} />
              </div>
              <h3 className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                Balansni to'ldirish
              </h3>
            </div>

            {/* Card Number */}
            <div className={cn(
              'p-4 rounded-xl mb-4',
              isDark ? 'bg-gray-700/50' : 'bg-gray-100'
            )}>
              <p className={cn('text-xs mb-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
                Karta raqami
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className={cn('text-lg font-mono font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                  {topUpInfo.cardNumber}
                </p>
                <button
                  onClick={() => copyToClipboard(topUpInfo.cardNumber)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200',
                    copied ? 'text-green-500' : isDark ? 'text-gray-400' : 'text-gray-500'
                  )}
                >
                  {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
                </button>
              </div>
              <p className={cn('text-sm mt-1', isDark ? 'text-gray-400' : 'text-gray-600')}>
                {topUpInfo.fullName}
              </p>
            </div>

            {/* Admin Contact */}
            <a
              href={`https://t.me/${topUpInfo.userAdmin.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl transition-colors mb-4',
                isDark
                  ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
              )}
            >
              <FaTelegram size={24} />
              <div>
                <p className="font-medium">{topUpInfo.userAdmin}</p>
                <p className={cn('text-xs', isDark ? 'text-blue-300/70' : 'text-blue-500')}>
                  Telegram orqali bog'lanish
                </p>
              </div>
            </a>

            <p className={cn('text-sm text-center', isDark ? 'text-gray-400' : 'text-gray-500')}>
              To'lov chekini adminga yuboring
            </p>

            <button
              onClick={() => setIsTopUpModalOpen(false)}
              className={cn(
                'w-full mt-4 py-3 rounded-xl font-medium transition-colors',
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              )}
            >
              Yopish
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
