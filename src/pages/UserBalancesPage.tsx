import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiDollarSign, FiSearch, FiUsers, FiEdit2, FiX, FiSave } from 'react-icons/fi'
import { useAuthStore } from '@store/authStore'
import { useTheme } from '@contexts/ThemeContext'
import toast from 'react-hot-toast'

interface UserBalance {
  id: string
  userName: string
  amount: number
  balanceCode: string
}

export const UserBalancesPage = () => {
  const { token } = useAuthStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [balances, setBalances] = useState<UserBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [editingBalance, setEditingBalance] = useState<UserBalance | null>(null)
  const [newAmount, setNewAmount] = useState('')

  // Fetch user balances
  const fetchBalances = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching balances with token:', token ? 'present' : 'missing')

      const response = await fetch('https://localhost:5001/api/UserBalance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          PageNumber: currentPage,
          PageSize: pageSize,
          Search: searchQuery,
        }),
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('User balances response:', data)

      if (data.Succeeded && data.Result) {
        const values = data.Result.Values || data.Result.values || []
        console.log('Values from API:', values)
        const mappedBalances = values.map((item: any) => ({
          id: item.Id || item.id || '',
          userName: item.FullName || item.fullName || item.UserName || '',
          amount: item.Amout || item.Amount || 0,
          balanceCode: item.BalanceCode || '',
        }))
        console.log('Mapped balances:', mappedBalances)
        setBalances(mappedBalances)
        setTotalCount(data.Result.TotalCount || data.Result.totalCount || 0)
      } else {
        const errorMsg = data.Errors?.join(', ') || 'Failed to fetch user balances'
        console.error('API error:', errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Failed to fetch user balances:', error)
      toast.error('Failed to load user balances')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalances()
  }, [currentPage, searchQuery])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Update balance
  const handleUpdateBalance = async () => {
    if (!editingBalance || !newAmount) {
      toast.error('Balans summasini kiriting')
      return
    }

    try {
      const response = await fetch(`https://localhost:5001/api/UserBalance?Id=${editingBalance.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          Amout: parseFloat(newAmount),
        }),
      })

      const data = await response.json()
      console.log('Update response:', data)

      if (data.Succeeded) {
        toast.success('Balans muvaffaqiyatli yangilandi!')
        setEditingBalance(null)
        setNewAmount('')
        fetchBalances()
      } else {
        const errorMsg = data.Errors?.join(', ') || 'Balansni yangilashda xatolik'
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Failed to update balance:', error)
      toast.error('Balansni yangilashda xatolik')
    }
  }

  const openEditModal = (balance: UserBalance) => {
    setEditingBalance(balance)
    setNewAmount(balance.amount.toString())
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-4xl font-bold mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-700'}`}>
            <FiUsers className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
            Foydalanuvchilar Balansi
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Barcha foydalanuvchilarning balansini ko'ring
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Qidirish..."
            className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500'
                : 'bg-white border-gray-200 text-black placeholder-gray-400 focus:ring-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Balances Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${isDark ? 'border-cyan-500' : 'border-blue-500'}`}></div>
            <p className={`text-lg ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>Loading...</p>
          </div>
        </div>
      ) : balances.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <FiDollarSign className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hech qanday balans topilmadi</p>
          </div>
        </div>
      ) : (
        <>
          <div className={`rounded-xl overflow-hidden border ${
            isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            {/* Table Header */}
            <div className={`grid grid-cols-12 gap-4 px-6 py-4 border-b ${
              isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`col-span-1 text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                #
              </div>
              <div className={`col-span-3 text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                Foydalanuvchi
              </div>
              <div className={`col-span-3 text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                Balance ID
              </div>
              <div className={`col-span-3 text-sm font-semibold text-right ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                Balans
              </div>
              <div className={`col-span-2 text-sm font-semibold text-right ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                Amallar
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-700/50">
              {balances.map((balance, index) => (
                <motion.div
                  key={balance.balanceCode || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${
                    isDark ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`col-span-1 font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {(currentPage - 1) * pageSize + index + 1}
                  </div>
                  <div className={`col-span-3 font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    {balance.userName || '-'}
                  </div>
                  <div className={`col-span-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {balance.balanceCode || '-'}
                  </div>
                  <div className={`col-span-3 text-right`}>
                    <span className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {balance.amount.toLocaleString()}
                    </span>
                    <span className={`ml-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      so'm
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      onClick={() => openEditModal(balance)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        isDark
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between mt-6 p-4 rounded-xl ${
              isDark ? 'bg-gray-800/50' : 'bg-white shadow-sm'
            }`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ←
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? isDark
                              ? 'bg-cyan-500 text-white'
                              : 'bg-blue-600 text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Balance Modal */}
      <AnimatePresence>
        {editingBalance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingBalance(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl shadow-2xl p-6 max-w-md w-full border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  <FiEdit2 className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
                  Balansni tahrirlash
                </h2>
                <button
                  onClick={() => setEditingBalance(null)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FiX className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Foydalanuvchi</p>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{editingBalance.userName}</p>
                </div>

                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Yangi balans (so'm)
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500'
                        : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:ring-blue-500'
                    }`}
                    placeholder="Balans summasini kiriting"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateBalance}
                    className={`flex-1 py-3 px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                      isDark ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FiSave className="w-5 h-5" />
                    Saqlash
                  </button>
                  <button
                    onClick={() => setEditingBalance(null)}
                    className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                      isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
