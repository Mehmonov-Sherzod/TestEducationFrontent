import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FiBarChart2,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi'
import { useTheme } from '@contexts/ThemeContext'
import { resultService } from '@api/result.service'
import toast from 'react-hot-toast'

interface TestResultItem {
  TotalQuestions: number
  CorrectAnswers: number
  IncorrectAnswers: number
  PercentageOfCorrectAnswers: number
  TotalScore: number
}

export const ResultsPage = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [results, setResults] = useState<TestResultItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  const fetchResults = async () => {
    try {
      setIsLoading(true)
      const response = await resultService.getPagedMyTestResults({
        PageNumber: currentPage,
        PageSize: pageSize,
        Search: searchQuery,
      })

      console.log('Results API Response:', response)

      if (response.Succeeded && response.Result) {
        // Handle both PascalCase and camelCase - cast to any for runtime fallback
        const result = response.Result as any
        const values = result.Values || result.values || []
        const total = result.TotalCount || result.totalCount || values.length
        setResults(values)
        setTotalCount(total)
        setHasNext(result.HasNext || false)
        setHasPrevious(result.HasPrevious || false)

        console.log('Pagination info:', { total, hasNext: result.HasNext, hasPrevious: result.HasPrevious })
      }
    } catch (error) {
      console.error('Failed to fetch results:', error)
      toast.error('Natijalarni yuklashda xatolik')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResults()
  }, [currentPage, searchQuery])

  // Total pages calculated but not needed for current pagination UI (uses hasNext/hasPrevious)
  void Math.ceil(totalCount / pageSize)

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return isDark ? 'text-green-400' : 'text-green-600'
    if (percentage >= 50) return isDark ? 'text-yellow-400' : 'text-yellow-600'
    return isDark ? 'text-red-400' : 'text-red-600'
  }

  const getScoreBg = (percentage: number) => {
    if (percentage >= 70) return isDark ? 'bg-green-500/20' : 'bg-green-100'
    if (percentage >= 50) return isDark ? 'bg-yellow-500/20' : 'bg-yellow-100'
    return isDark ? 'bg-red-500/20' : 'bg-red-100'
  }

  return (
    <div className="w-full py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <FiBarChart2 className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            Natijalar
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Barcha test natijalaringiz
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Qidirish..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 text-sm ${
              isDark
                ? 'bg-[#151515] border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500/50'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Results List */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#111] border-gray-800' : 'bg-white border-gray-200'}`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${isDark ? 'border-blue-500' : 'border-blue-600'}`} />
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Yuklanmoqda...</p>
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiBarChart2 className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Natijalar topilmadi</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>#</th>
                    <th className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Savollar</th>
                    <th className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>To'g'ri</th>
                    <th className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Noto'g'ri</th>
                    <th className={`px-4 py-3 text-center text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Foiz</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
                  {results.map((result, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className={isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}
                    >
                      <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>
                      <td className={`px-4 py-3 text-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {result.TotalQuestions}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          <FiCheckCircle className="w-4 h-4" />
                          {result.CorrectAnswers}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                          <FiXCircle className="w-4 h-4" />
                          {result.IncorrectAnswers}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-lg text-sm font-semibold ${getScoreBg(result.PercentageOfCorrectAnswers)} ${getScoreColor(result.PercentageOfCorrectAnswers)}`}>
                          {Math.round(result.PercentageOfCorrectAnswers)}%
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className={`sm:hidden divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Test #{(currentPage - 1) * pageSize + index + 1}
                    </h3>
                    <span className={`px-2 py-1 rounded-lg text-sm font-bold ${getScoreBg(result.PercentageOfCorrectAnswers)} ${getScoreColor(result.PercentageOfCorrectAnswers)}`}>
                      {Math.round(result.PercentageOfCorrectAnswers)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      {result.TotalQuestions} savol
                    </span>
                    <span className={`flex items-center gap-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                      <FiCheckCircle className="w-4 h-4" />
                      {result.CorrectAnswers}
                    </span>
                    <span className={`flex items-center gap-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      <FiXCircle className="w-4 h-4" />
                      {result.IncorrectAnswers}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {(hasNext || hasPrevious || results.length >= pageSize) && (
              <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {(currentPage - 1) * pageSize + 1}-{(currentPage - 1) * pageSize + results.length} / {totalCount > results.length ? totalCount : (currentPage - 1) * pageSize + results.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={!hasPrevious}
                    className={`p-2 rounded-lg disabled:opacity-50 transition-colors ${
                      isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FiChevronLeft className="w-4 h-4" />
                  </button>

                  <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    {currentPage}
                  </span>

                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!hasNext}
                    className={`p-2 rounded-lg disabled:opacity-50 transition-colors ${
                      isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
