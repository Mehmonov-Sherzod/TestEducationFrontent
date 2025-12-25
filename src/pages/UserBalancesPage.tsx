import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiDollarSign, FiSearch, FiUsers, FiEdit2, FiX, FiSave, FiPlus } from 'react-icons/fi'
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
  const [addingBalance, setAddingBalance] = useState<UserBalance | null>(null)
  const [newAmount, setNewAmount] = useState('')
  const [addAmount, setAddAmount] = useState('')

  // Fetch user balances
  const fetchBalances = async () => {
    try {
      setIsLoading(true)
      console.log('Fetching balances with token:', token ? 'present' : 'missing')

      const response = await fetch(`/api/UserBalance`, {
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

    const amount = parseFloat(newAmount)

    try {
      // Body Amout = yangi balans, Query Amount = 0 (qo'shmaslik uchun)
      const response = await fetch(`/api/UserBalance?Id=${editingBalance.id}&Amount=0`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          Amout: amount,
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

  // Add to balance
  const handleAddBalance = async () => {
    if (!addingBalance || !addAmount) {
      toast.error('To\'ldiriladigan summani kiriting')
      return
    }

    const amount = parseFloat(addAmount)

    try {
      // Body Amout = 0, Query Amount = qo'shiladigan summa
      const response = await fetch(`/api/UserBalance?Id=${addingBalance.id}&Amount=${amount}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          Amout: addingBalance.amount,
        }),
      })

      const data = await response.json()
      console.log('Add balance response:', data)

      if (data.Succeeded) {
        toast.success(`${amount.toLocaleString()} so'm muvaffaqiyatli to'ldirildi!`)
        setAddingBalance(null)
        setAddAmount('')
        fetchBalances()
      } else {
        const errorMsg = data.Errors?.join(', ') || 'Balansni to\'ldirishda xatolik'
        toast.error(errorMsg)
      }
    } catch (error) {
      console.error('Failed to add balance:', error)
      toast.error('Balansni to\'ldirishda xatolik')
    }
  }

  const openEditModal = (balance: UserBalance) => {
    setEditingBalance(balance)
    setNewAmount(balance.amount.toString())
  }

  const openAddModal = (balance: UserBalance) => {
    setAddingBalance(balance)
    setAddAmount('')
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="py-4 sm:py-8 px-2 sm:px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <FiUsers className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-cyan-400' : 'text-gray-600'}`} />
            <span className="hidden sm:inline">Foydalanuvchilar Balansi</span>
            <span className="sm:hidden">Balanslar</span>
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Barcha foydalanuvchilarning balansini ko'ring
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative w-full sm:max-w-md">
          <FiSearch className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Qidirish..."
            className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${
              isDark
                ? 'bg-[#151515] border-gray-600/30 text-white placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500'
                : 'bg-white border-gray-200 text-black placeholder-gray-400 focus:ring-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Balances Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 sm:py-20">
          <div className="text-center">
            <div className={`w-10 h-10 sm:w-16 sm:h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4 ${isDark ? 'border-cyan-500' : 'border-gray-400'}`}></div>
            <p className={`text-sm sm:text-lg ${isDark ? 'text-cyan-400' : 'text-gray-600'}`}>Yuklanmoqda...</p>
          </div>
        </div>
      ) : balances.length === 0 ? (
        <div className="flex items-center justify-center py-12 sm:py-20">
          <div className="text-center px-4">
            <FiDollarSign className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-sm sm:text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hech qanday balans topilmadi</p>
          </div>
        </div>
      ) : (
        <>
          <div className={`rounded-xl overflow-hidden border ${
            isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            {/* Desktop Table Header */}
            <div className={`hidden sm:grid grid-cols-12 gap-4 px-4 lg:px-6 py-3 lg:py-4 border-b ${
              isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className={`col-span-1 text-xs lg:text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-gray-600'}`}>
                #
              </div>
              <div className={`col-span-3 text-xs lg:text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-gray-600'}`}>
                Foydalanuvchi
              </div>
              <div className={`col-span-3 text-xs lg:text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-gray-600'}`}>
                Balance ID
              </div>
              <div className={`col-span-3 text-xs lg:text-sm font-semibold text-right ${isDark ? 'text-cyan-400' : 'text-gray-600'}`}>
                Balans
              </div>
              <div className={`col-span-2 text-xs lg:text-sm font-semibold text-right ${isDark ? 'text-cyan-400' : 'text-gray-600'}`}>
                Amallar
              </div>
            </div>

            {/* Desktop Table Body */}
            <div className={`hidden sm:block divide-y ${isDark ? 'divide-gray-600/20' : 'divide-gray-100'}`}>
              {balances.map((balance, index) => (
                <motion.div
                  key={balance.balanceCode || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={`grid grid-cols-12 gap-4 px-4 lg:px-6 py-3 lg:py-4 items-center transition-colors ${
                    isDark ? 'hover:bg-[#1a1a1a]/30' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`col-span-1 font-medium text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {(currentPage - 1) * pageSize + index + 1}
                  </div>
                  <div className={`col-span-3 font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    {balance.userName || '-'}
                  </div>
                  <div className={`col-span-3 font-medium text-xs lg:text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {balance.balanceCode || '-'}
                  </div>
                  <div className={`col-span-3 text-right`}>
                    <span className={`text-base lg:text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      {balance.amount.toLocaleString()}
                    </span>
                    <span className={`ml-1 text-xs lg:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      so'm
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button
                      onClick={() => openAddModal(balance)}
                      className={`flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                        isDark
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      <FiPlus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      <span className="hidden lg:inline">To'ldirish</span>
                    </button>
                    <button
                      onClick={() => openEditModal(balance)}
                      className={`flex items-center gap-1.5 px-2 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all ${
                        isDark
                          ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                    >
                      <FiEdit2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mobile Cards */}
            <div className={`sm:hidden divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {balances.map((balance, index) => (
                <motion.div
                  key={balance.balanceCode || index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={`p-3 ${isDark ? 'hover:bg-[#1a1a1a]/30' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                          #{(currentPage - 1) * pageSize + index + 1}
                        </span>
                        <h3 className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {balance.userName || '-'}
                        </h3>
                      </div>
                      <p className={`text-xs truncate mb-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Balance ID: </span>
                        {balance.balanceCode || '-'}
                      </p>
                      <div>
                        <span className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          {balance.amount.toLocaleString()}
                        </span>
                        <span className={`ml-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          so'm
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => openAddModal(balance)}
                        className={`p-2 rounded-lg transition-all ${
                          isDark
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(balance)}
                        className={`p-2 rounded-lg transition-all ${
                          isDark
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl ${
              isDark ? 'bg-[#151515]/50' : 'bg-white shadow-sm'
            }`}>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} / {totalCount}
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm ${
                    isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ←
                </button>

                {/* Mobile: Show current/total */}
                <span className={`sm:hidden text-xs px-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  {currentPage} / {totalPages}
                </span>

                {/* Desktop: Show page numbers */}
                <div className="hidden sm:flex items-center gap-1">
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
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-all text-sm ${
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
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm ${
                    isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setEditingBalance(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full border ${
                isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  <FiEdit2 className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                  Balansni tahrirlash
                </h2>
                <button
                  onClick={() => setEditingBalance(null)}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-100'}`}
                >
                  <FiX className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className={`p-2.5 sm:p-3 rounded-lg ${isDark ? 'bg-[#1a1a1a]/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Foydalanuvchi</p>
                  <p className={`font-semibold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>{editingBalance.userName}</p>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Yangi balans (so'm)
                  </label>
                  <input
                    type="number"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base ${
                      isDark
                        ? 'bg-[#1a1a1a] border-gray-600/30 text-white placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500'
                        : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:ring-blue-500'
                    }`}
                    placeholder="Balans summasini kiriting"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setEditingBalance(null)}
                    className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                      isDark ? 'bg-[#1a1a1a] text-gray-200 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleUpdateBalance}
                    className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                      isDark ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FiSave className="w-4 h-4 sm:w-5 sm:h-5" />
                    Saqlash
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Balance Modal */}
      <AnimatePresence>
        {addingBalance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setAddingBalance(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 max-w-md w-full border ${
                isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  <FiPlus className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  Balansni to'ldirish
                </h2>
                <button
                  onClick={() => setAddingBalance(null)}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-100'}`}
                >
                  <FiX className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className={`p-2.5 sm:p-3 rounded-lg ${isDark ? 'bg-[#1a1a1a]/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Foydalanuvchi</p>
                  <p className={`font-semibold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>{addingBalance.userName}</p>
                </div>

                <div className={`p-2.5 sm:p-3 rounded-lg ${isDark ? 'bg-[#1a1a1a]/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Joriy balans</p>
                  <p className={`font-bold text-lg ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    {addingBalance.amount.toLocaleString()} <span className="text-sm font-normal opacity-70">so'm</span>
                  </p>
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    To'ldiriladigan summa (so'm)
                  </label>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base ${
                      isDark
                        ? 'bg-[#1a1a1a] border-gray-600/30 text-white placeholder-gray-500 focus:ring-green-500/50 focus:border-green-500'
                        : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:ring-green-500'
                    }`}
                    placeholder="Masalan: 50000"
                  />
                  {addAmount && (
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Yangi balans: <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                        {(addingBalance.amount + parseFloat(addAmount || '0')).toLocaleString()} so'm
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setAddingBalance(null)}
                    className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                      isDark ? 'bg-[#1a1a1a] text-gray-200 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleAddBalance}
                    className="flex-1 py-2.5 sm:py-3 px-4 sm:px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    To'ldirish
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
