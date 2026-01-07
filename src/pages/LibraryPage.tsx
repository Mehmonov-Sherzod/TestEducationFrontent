import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiBook,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiX,
  FiUpload,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingBag,
  FiShoppingCart,
  FiDownload,
} from 'react-icons/fi'
import { libraryService, SharedSource, UserSharedSource, PageOption } from '@api/library.service'
import { subjectService } from '@api/subject.service'
import { useTheme } from '@contexts/ThemeContext'
import { useAuthStore } from '@store/authStore'
import toast from 'react-hot-toast'

interface SubjectOption {
  id: string
  name: string
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

export const LibraryPage = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { user } = useAuthStore()

  // Check permissions
  const isSuperAdmin = user?.permissions?.includes('ManageAdmins') ||
    user?.permissions?.includes('ManageUsers') ||
    user?.permissions?.includes('SystemSettings')
  const canManageLibrary = user?.permissions?.includes('ManageLibrary') || isSuperAdmin

  // Tab state
  const [activeTab, setActiveTab] = useState<'books' | 'purchased'>('books')

  // Data state
  const [books, setBooks] = useState<SharedSource[]>([])
  const [myBooks, setMyBooks] = useState<UserSharedSource[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMyBooks, setIsLoadingMyBooks] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<SharedSource | null>(null)
  const [buyConfirm, setBuyConfirm] = useState<SharedSource | null>(null)
  const [isBuying, setIsBuying] = useState(false)

  // Form state
  const [form, setForm] = useState({
    description: '',
    price: '',
    subjectId: '',
    file: null as File | null,
  })

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const response = await subjectService.getAll()
      if (response.Succeeded && response.Result) {
        const values = Array.isArray(response.Result) ? response.Result : []
        setSubjects(
          values.map((s: any) => ({
            id: s.Id || s.id,
            name: s.SubjectName || s.subjectName || s.Name || s.name,
          }))
        )
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }, [])

  // Fetch books with pagination
  const fetchBooks = useCallback(async () => {
    if (!selectedSubjectId) {
      setBooks([])
      setTotalCount(0)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)

      const pageOption: PageOption = {
        PageNumber: currentPage,
        PageSize: pageSize,
        Search: searchQuery,
        SubjectId: selectedSubjectId,
      }

      const response = await libraryService.getPaged(pageOption)

      if (response.Succeeded && response.Result) {
        const result = response.Result
        const values = result.Values || []

        console.log('API Response Values:', values)

        // API base URL for relative paths (empty in dev for proxy, full URL in prod)
        const apiBaseUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001')

        setBooks(
          values.map((b: any) => {
            // Get file URL from Image or Path field
            let fileUrl = b.Image || b.image || b.Path || b.path || ''

            // Convert relative URL to absolute
            if (fileUrl && !fileUrl.startsWith('http')) {
              fileUrl = `${apiBaseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`
            }

            return {
              id: b.Id || b.id,
              description: b.Description || b.description,
              image: fileUrl,
              price: b.Price || b.price || 0,
            }
          })
        )
        setFailedImages(new Set()) // Clear failed images on new data

        const total = result.TotalCount || 0
        setTotalCount(total)
        setHasPrevious(currentPage > 1)
        setHasNext(currentPage * pageSize < total)
      } else {
        setBooks([])
        setTotalCount(0)
      }
    } catch (error) {
      console.error('Failed to fetch books:', error)
      setBooks([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, searchQuery, selectedSubjectId])

  // Fetch my purchased books (GetMyBook API)
  const fetchMyBooks = useCallback(async () => {
    try {
      setIsLoadingMyBooks(true)
      const response = await libraryService.getMyBooks()

      if (response.Succeeded && response.Result) {
        const apiBaseUrl = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_BASE_URL || 'https://localhost:5001')
        const books = Array.isArray(response.Result) ? response.Result : []

        setMyBooks(
          books.map((book: any) => {
            let fileUrl = book.Path || book.path || ''
            if (fileUrl && !fileUrl.startsWith('http')) {
              fileUrl = `${apiBaseUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`
            }
            return {
              description: book.Description || book.description,
              path: fileUrl,
              userId: book.UserId || book.userId,
            }
          })
        )
      } else {
        setMyBooks([])
      }
    } catch (error) {
      console.error('Failed to fetch my books:', error)
      setMyBooks([])
    } finally {
      setIsLoadingMyBooks(false)
    }
  }, [])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  useEffect(() => {
    if (activeTab === 'purchased') {
      fetchMyBooks()
    }
  }, [activeTab, fetchMyBooks])

  // Reset to page 1 when search or subject changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedSubjectId])

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize)

  // Handle create
  const handleCreate = async () => {
    if (!form.description.trim()) {
      toast.error('Tavsif kiriting')
      return
    }
    if (!form.subjectId) {
      toast.error('Fan tanlang')
      return
    }
    if (!form.file) {
      toast.error('Fayl tanlang')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await libraryService.create({
        description: form.description,
        price: parseFloat(form.price) || 0,
        subjectId: form.subjectId,
        file: form.file,
      })

      if (response.Succeeded) {
        toast.success('Kitob muvaffaqiyatli qo\'shildi!')
        setIsCreateModalOpen(false)
        setForm({ description: '', price: '', subjectId: '', file: null })
        fetchBooks()
      } else {
        toast.error(response.Errors?.join(', ') || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Failed to create:', error)
      toast.error('Xatolik yuz berdi')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deleteConfirm || !deleteConfirm.id) {
      toast.error('Kitob ID topilmadi')
      console.error('Delete failed: No ID found', deleteConfirm)
      return
    }

    try {
      setIsSubmitting(true)
      console.log('Deleting book with ID:', deleteConfirm.id)
      const response = await libraryService.delete(deleteConfirm.id)

      if (response.Succeeded) {
        toast.success('Kitob o\'chirildi!')
        setDeleteConfirm(null)
        fetchBooks()
      } else {
        toast.error(response.Errors?.join(', ') || 'Xatolik yuz berdi')
      }
    } catch (error) {
      console.error('Failed to delete:', error)
      toast.error('Xatolik yuz berdi')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle buy book confirmation
  const handleBuyBook = async () => {
    if (!buyConfirm || !buyConfirm.id) {
      toast.error('Kitob ID topilmadi')
      return
    }

    try {
      setIsBuying(true)
      const response = await libraryService.buyBook(buyConfirm.id)

      if (response.Succeeded) {
        toast.success('Kitob muvaffaqiyatli sotib olindi!')
        setBuyConfirm(null)
        fetchMyBooks() // Refresh purchased books
        setActiveTab('purchased') // Switch to purchased tab
      } else {
        toast.error(response.Errors?.join(', ') || 'Xatolik yuz berdi')
      }
    } catch (error: any) {
      console.error('Failed to buy book:', error)
      toast.error(error?.response?.data?.Errors?.[0] || 'Balans yetarli emas yoki xatolik yuz berdi')
    } finally {
      setIsBuying(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-bold ${
                (isDark ? 'text-white' : 'text-gray-700')
              }`}
            >
              Kutubxona
            </h1>
            <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              O'quv materiallari va kitoblar
            </p>
          </div>

          {canManageLibrary && activeTab === 'books' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-medium transition-all text-sm sm:text-base w-full sm:w-auto ${
                isDark
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
              }`}
            >
              <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              Yangi qo'shish
            </motion.button>
          )}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => setActiveTab('books')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm sm:text-base ${
              activeTab === 'books'
                ? isDark
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : isDark
                  ? 'bg-[#151515] text-gray-400 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiBook className="w-4 h-4" />
            Kitoblar
          </button>
          <button
            onClick={() => setActiveTab('purchased')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all text-sm sm:text-base ${
              activeTab === 'purchased'
                ? isDark
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                  : 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                : isDark
                  ? 'bg-[#151515] text-gray-400 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
            }`}
          >
            <FiShoppingBag className="w-4 h-4" />
            Sotib olingan
            {myBooks.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'purchased'
                  ? 'bg-white/20 text-white'
                  : isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                {myBooks.length}
              </span>
            )}
          </button>
        </motion.div>

        {/* Filters - only show for books tab */}
        {activeTab === 'books' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 sm:max-w-md">
            <FiSearch
              className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${isDark ? 'bg-[#151515] border-gray-600/30 text-white focus:ring-blue-500/50 focus:border-blue-500' : 'bg-white border-gray-200 text-black focus:ring-blue-500'}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Subject Filter */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all w-full sm:min-w-[180px] justify-between text-sm sm:text-base ${isDark ? 'bg-[#151515] border-gray-600/30 text-white' : 'bg-white border-gray-200 text-black'}`}
            >
              <div className="flex items-center gap-2">
                <FiFilter className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
                <span className="truncate">
                  {selectedSubjectId
                    ? subjects.find((s) => s.id === selectedSubjectId)?.name
                    : 'Fanni tanlang'}
                </span>
              </div>
            </motion.button>

            <AnimatePresence>
              {isSubjectDropdownOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSubjectDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute top-full mt-2 w-56 max-h-60 overflow-y-auto rounded-xl border shadow-2xl z-50 ${isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200'}`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSubjectId(null)
                        setIsSubjectDropdownOpen(false)
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        !selectedSubjectId
                          ? isDark
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-blue-50 text-blue-600'
                          : isDark
                          ? 'text-white hover:bg-[#1a1a1a]'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      Barcha fanlar
                    </button>
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => {
                          setSelectedSubjectId(subject.id)
                          setIsSubjectDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          selectedSubjectId === subject.id
                            ? isDark
                              ? 'bg-cyan-500/20 text-cyan-400'
                              : 'bg-blue-50 text-blue-600'
                            : isDark
                            ? 'text-white hover:bg-[#1a1a1a]'
                            : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {subject.name}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        )}

        {/* Content - Books Tab */}
        {activeTab === 'books' && (
          <>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 border-4 rounded-full animate-spin ${
                false
                  ? 'border-red-500 border-t-transparent'
                  : 'border-blue-500 border-t-transparent'
              }`}
            />
          </div>
        ) : !selectedSubjectId ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center py-12 sm:py-20"
          >
            <div className="text-center px-4">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FiFilter
                  className={`w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 ${isDark ? 'text-cyan-400' : 'text-blue-500'}`}
                />
              </motion.div>
              <p
                className={`text-lg sm:text-xl mb-2 ${
                  (isDark ? 'text-white' : 'text-gray-700')
                }`}
              >
                Fanni tanlang
              </p>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Kitoblarni ko'rish uchun yuqoridagi filterdan fanni tanlang
              </p>
            </div>
          </motion.div>
        ) : books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center py-12 sm:py-20"
          >
            <div className="text-center px-4">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FiBook
                  className={`w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                />
              </motion.div>
              <p
                className={`text-lg sm:text-xl mb-2 ${
                  (isDark ? 'text-gray-400' : 'text-gray-600')
                }`}
              >
                Kitoblar topilmadi
              </p>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Yangi kitob qo'shish uchun "Yangi qo'shish" tugmasini bosing
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
          >
            {books.map((book) => {
              const hasImage = book.image && book.image.startsWith('http') && !failedImages.has(book.id || '')

              // Generate gradient color for placeholder
              const getGradient = (str: string) => {
                const gradients = [
                  'from-blue-500 to-indigo-600',
                  'from-emerald-500 to-teal-600',
                  'from-orange-500 to-red-500',
                  'from-purple-500 to-pink-500',
                  'from-cyan-500 to-blue-500',
                  'from-amber-500 to-orange-500',
                  'from-green-500 to-emerald-600',
                  'from-rose-500 to-pink-600',
                ]
                let hash = 0
                for (let i = 0; i < str.length; i++) {
                  hash = str.charCodeAt(i) + ((hash << 5) - hash)
                }
                return gradients[Math.abs(hash) % gradients.length]
              }

              const gradient = getGradient(book.description || 'kitob')

              return (
                <motion.div
                  key={book.id}
                  variants={cardVariants}
                  className="group"
                >
                  {/* Card */}
                  <motion.div
                    whileHover={{ y: -8, scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`relative rounded-2xl overflow-hidden ${
                      isDark ? 'bg-[#1a1a1a]' : 'bg-white'
                    } shadow-lg hover:shadow-2xl transition-shadow duration-300`}
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {hasImage ? (
                        <img
                          src={book.image}
                          alt={book.description}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={() => {
                            setFailedImages(prev => new Set(prev).add(book.id || ''))
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <FiBook className="w-12 h-12 text-white/80" />
                        </div>
                      )}

                      {/* Price Badge */}
                      <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg backdrop-blur-sm ${
                        book.price > 0
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      }`}>
                        {book.price > 0 ? (
                          <span className="flex items-center gap-1">
                            {book.price.toLocaleString()}
                            <span className="opacity-80">so'm</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <span>Bepul</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 sm:p-4">
                      <h3 className={`text-sm font-semibold line-clamp-2 mb-3 ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}>
                        {book.description}
                      </h3>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {book.price > 0 ? (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              setBuyConfirm(book)
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium shadow-lg shadow-green-500/25"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FiShoppingCart className="w-4 h-4" />
                            Sotib olish
                          </motion.button>
                        ) : (
                          <motion.a
                            href={book.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium shadow-lg shadow-blue-500/25"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <FiDownload className="w-4 h-4" />
                            Yuklab olish
                          </motion.a>
                        )}
                        {canManageLibrary && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteConfirm(book)
                            }}
                            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 p-3 sm:p-4 rounded-xl ${
              isDark ? 'bg-[#151515]/50' : 'bg-white shadow-sm'
            }`}
          >
            <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Jami: {totalCount} ta kitob
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!hasPrevious}
                className={`p-1.5 sm:p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDark
                    ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
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
                          ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'
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
                disabled={!hasNext}
                className={`p-1.5 sm:p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDark
                    ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </motion.div>
        )}
          </>
        )}

        {/* Content - Purchased Books Tab */}
        {activeTab === 'purchased' && (
          <>
            {isLoadingMyBooks ? (
              <div className="flex items-center justify-center py-12 sm:py-20">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 border-4 rounded-full animate-spin border-green-500 border-t-transparent`} />
              </div>
            ) : myBooks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center py-12 sm:py-20"
              >
                <div className="text-center px-4">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FiShoppingBag
                      className={`w-12 h-12 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    />
                  </motion.div>
                  <p className={`text-lg sm:text-xl mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Sotib olingan kitoblar yo'q
                  </p>
                  <p className={`text-sm sm:text-base ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Kitoblar sotib olganingizda bu yerda ko'rinadi
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
              >
                {myBooks.map((book, index) => {
                  const bookDesc = book.description || book.Description || 'kitob'

                  // Generate gradient color
                  const getGradient = (str: string) => {
                    const gradients = [
                      'from-green-500 to-emerald-600',
                      'from-emerald-500 to-teal-600',
                      'from-teal-500 to-cyan-600',
                      'from-cyan-500 to-blue-600',
                    ]
                    let hash = 0
                    for (let i = 0; i < str.length; i++) {
                      hash = str.charCodeAt(i) + ((hash << 5) - hash)
                    }
                    return gradients[Math.abs(hash) % gradients.length]
                  }

                  const gradient = getGradient(bookDesc)

                  return (
                    <motion.div
                      key={index}
                      variants={cardVariants}
                      className="group"
                    >
                      {/* Card */}
                      <motion.div
                        whileHover={{ y: -8, scale: 1.03 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className={`relative rounded-2xl overflow-hidden ${
                          isDark ? 'bg-[#1a1a1a]' : 'bg-white'
                        } shadow-lg hover:shadow-2xl transition-shadow duration-300`}
                      >
                        {/* Image Container */}
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                            <FiBook className="w-12 h-12 text-white/80" />
                          </div>

                          {/* Hover Overlay with Download */}
                          {book.path && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <motion.a
                                href={book.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 rounded-full bg-green-500 text-white shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                              >
                                <FiDownload className="w-5 h-5" />
                              </motion.a>
                            </div>
                          )}

                          {/* Purchased Badge */}
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg bg-green-500 text-white flex items-center gap-1">
                            <FiShoppingBag className="w-3 h-3" />
                            Sotib olingan
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 sm:p-4">
                          <h3 className={`text-sm font-semibold line-clamp-2 ${
                            isDark ? 'text-white' : 'text-gray-800'
                          }`}>
                            {bookDesc}
                          </h3>
                        </div>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#151515] border-gray-600/30 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              <h2
                className={`text-lg sm:text-xl font-bold mb-4 sm:mb-6 ${
                  (isDark ? 'text-white' : 'text-gray-700')
                }`}
              >
                Yangi kitob qo'shish
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* Description */}
                <div>
                  <label
                    className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    Tavsif *
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Kitob nomi yoki tavsifi"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white focus:ring-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'}`}
                  />
                </div>

                {/* Price */}
                <div>
                  <label
                    className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    Narxi (so'm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="0 = Bepul"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white focus:ring-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'}`}
                  />
                </div>

                {/* Subject */}
                <div>
                  <label
                    className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    Fan *
                  </label>
                  <select
                    value={form.subjectId}
                    onChange={(e) =>
                      setForm({ ...form, subjectId: e.target.value })
                    }
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white focus:ring-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'}`}
                  >
                    <option value="" className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      Fan tanlang
                    </option>
                    {subjects.map((subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                        className={isDark ? 'text-gray-400' : 'text-gray-600'}
                      >
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label
                    className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    Fayl *
                  </label>
                  <label
                    className={`flex flex-col items-center justify-center w-full h-24 sm:h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isDark ? 'border-gray-600/30 hover:border-blue-500/50 bg-[#1a1a1a]' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,image/*"
                      onChange={(e) =>
                        setForm({ ...form, file: e.target.files?.[0] || null })
                      }
                      className="hidden"
                    />
                    {form.file ? (
                      <div className="text-center px-2">
                        <FiBook
                          className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}
                        />
                        <p
                          className={`text-xs sm:text-sm truncate max-w-[200px] ${
                            (isDark ? 'text-gray-400' : 'text-gray-600')
                          }`}
                        >
                          {form.file.name}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FiUpload
                          className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1.5 sm:mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        />
                        <p
                          className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          Fayl yuklash uchun bosing
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${isDark ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Yuklanmoqda...' : 'Saqlash'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${isDark ? 'bg-[#151515] border-gray-600/30 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              <div className="text-center">
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}
                >
                  <FiTrash2
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`}
                  />
                </div>
                <h3
                  className={`text-base sm:text-lg font-bold mb-2 ${
                    (isDark ? 'text-white' : 'text-gray-700')
                  }`}
                >
                  O'chirishni tasdiqlang
                </h3>
                <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  "{deleteConfirm.description}" kitobini o'chirmoqchimisiz?
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 text-sm sm:text-base ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'O\'chirilmoqda...' : 'O\'chirish'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buy Confirmation Modal */}
      <AnimatePresence>
        {buyConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setBuyConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${isDark ? 'bg-[#151515] border-gray-600/30 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              <div className="text-center">
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}
                >
                  <FiShoppingCart
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`}
                  />
                </div>
                <h3
                  className={`text-base sm:text-lg font-bold mb-2 ${
                    (isDark ? 'text-white' : 'text-gray-700')
                  }`}
                >
                  Sotib olishni tasdiqlang
                </h3>
                <p className={`text-sm sm:text-base mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  "{buyConfirm.description}" kitobini sotib olmoqchimisiz?
                </p>
                <p className={`text-lg sm:text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {buyConfirm.price.toLocaleString()} so'm
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setBuyConfirm(null)}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBuyBook}
                  disabled={isBuying}
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium bg-green-500 text-white hover:bg-green-600 text-sm sm:text-base ${
                    isBuying ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isBuying ? 'Sotib olinmoqda...' : 'Sotib olish'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LibraryPage



