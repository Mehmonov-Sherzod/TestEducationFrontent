import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiBook,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiX,
  FiUpload,
  FiEye,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { libraryService, SharedSource, PageOption } from '@api/library.service'
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

  // Data state
  const [books, setBooks] = useState<SharedSource[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  // Form state
  const [form, setForm] = useState({
    description: '',
    subjectId: '',
    file: null as File | null,
  })

  // Fetch subjects
  const fetchSubjects = useCallback(async () => {
    try {
      const response = await subjectService.getAll('uz')
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

        // API base URL for relative paths
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://10.30.13.228:5000'

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

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

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
        subjectId: form.subjectId,
        file: form.file,
      })

      if (response.Succeeded) {
        toast.success('Kitob muvaffaqiyatli qo\'shildi!')
        setIsCreateModalOpen(false)
        setForm({ description: '', subjectId: '', file: null })
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

          {canManageLibrary && (
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

        {/* Filters */}
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
              className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-white border-gray-200 text-black focus:ring-cyan-500'}`}
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
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all w-full sm:min-w-[180px] justify-between text-sm sm:text-base ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}
            >
              <div className="flex items-center gap-2">
                <FiFilter className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
                <span className="truncate">
                  {selectedSubjectId
                    ? subjects.find((s) => s.id === selectedSubjectId)?.name
                    : 'Barcha fanlar'}
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
                    className={`absolute top-full mt-2 w-56 max-h-60 overflow-y-auto rounded-xl border shadow-2xl z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
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
                          ? 'text-white hover:bg-gray-700'
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
                            ? 'text-white hover:bg-gray-700'
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

        {/* Content */}
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
                Fan tanlang
              </p>
              <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Kitoblarni ko'rish uchun yuqoridagi filterdan fan tanlang
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
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
          >
            {books.map((book) => {
              const hasImage = book.image && book.image.startsWith('http') && !failedImages.has(book.id)

              // Generate dynamic color based on book description
              const getColorFromString = (str: string) => {
                const colors = [
                  { from: 'from-blue-500', via: 'via-blue-600', to: 'to-indigo-700', spine: 'bg-blue-800' },
                  { from: 'from-emerald-500', via: 'via-teal-600', to: 'to-cyan-700', spine: 'bg-emerald-800' },
                  { from: 'from-orange-500', via: 'via-red-500', to: 'to-rose-600', spine: 'bg-orange-800' },
                  { from: 'from-purple-500', via: 'via-violet-600', to: 'to-indigo-700', spine: 'bg-purple-800' },
                  { from: 'from-pink-500', via: 'via-rose-500', to: 'to-red-600', spine: 'bg-pink-800' },
                  { from: 'from-cyan-500', via: 'via-blue-500', to: 'to-indigo-600', spine: 'bg-cyan-800' },
                  { from: 'from-amber-500', via: 'via-orange-500', to: 'to-red-500', spine: 'bg-amber-800' },
                  { from: 'from-lime-500', via: 'via-green-500', to: 'to-emerald-600', spine: 'bg-lime-800' },
                ]
                let hash = 0
                for (let i = 0; i < str.length; i++) {
                  hash = str.charCodeAt(i) + ((hash << 5) - hash)
                }
                return colors[Math.abs(hash) % colors.length]
              }

              const bookColor = getColorFromString(book.description || 'kitob')
              const initials = (book.description || 'K').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')

              return (
                <motion.div
                  key={book.id}
                  variants={cardVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  {/* Realistic 3D Book */}
                  <div className="relative" style={{ aspectRatio: '3/4', perspective: '1000px' }}>
                    {/* Book pages (side) */}
                    <div
                      className="absolute left-0 top-[3px] bottom-[3px] w-5 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-200 rounded-l-[2px]"
                      style={{
                        transform: 'rotateY(-15deg) translateX(-2px)',
                        boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {/* Page lines */}
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className="h-[1px] bg-gray-300/60" style={{ marginTop: `${4 + i * 5}%` }} />
                      ))}
                    </div>

                    {/* Main book cover */}
                    <div
                      className="relative w-full h-full overflow-hidden rounded-r-md rounded-l-[3px]"
                      style={{
                        boxShadow: '6px 6px 20px rgba(0,0,0,0.4), 2px 2px 6px rgba(0,0,0,0.2), inset -2px 0 4px rgba(0,0,0,0.1)',
                        transform: 'translateX(3px)'
                      }}
                    >
                    {hasImage ? (
                      <>
                        <img
                          src={book.image}
                          alt={book.description}
                          className="w-full h-full object-cover"
                          onError={() => {
                            setFailedImages(prev => new Set(prev).add(book.id))
                          }}
                        />
                        {/* Bottom buttons - always visible */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent pt-8 pb-3 flex items-end justify-center gap-3">
                          <motion.a
                            href={book.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur-sm"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FiEye className="w-4 h-4" />
                          </motion.a>
                          {canManageLibrary && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(book)
                              }}
                              className="p-2.5 rounded-full bg-red-500/90 text-white shadow-lg backdrop-blur-sm"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </>
                    ) : (
                      /* Dynamic Generated Book Cover */
                      <div className={`w-full h-full flex flex-col relative bg-gradient-to-br ${bookColor.from} ${bookColor.via} ${bookColor.to} overflow-hidden`}>
                        {/* Leather/Paper texture */}
                        <div className="absolute inset-0 opacity-10" style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                        }} />

                        {/* Embossed frame */}
                        <div className="absolute inset-3 border border-white/20 rounded-sm pointer-events-none shadow-inner" />
                        <div className="absolute inset-4 border border-black/10 rounded-sm pointer-events-none" />

                        {/* Corner ornaments */}
                        <div className="absolute top-2 left-6 text-amber-200/50 text-[10px]">❧</div>
                        <div className="absolute top-2 right-2 text-amber-200/50 text-[10px] rotate-90">❧</div>
                        <div className="absolute bottom-8 left-6 text-amber-200/50 text-[10px] rotate-[-90deg]">❧</div>
                        <div className="absolute bottom-8 right-2 text-amber-200/50 text-[10px] rotate-180">❧</div>

                        {/* Main content */}
                        <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
                          {/* Embossed initials */}
                          <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-3 border-2 border-white/30 shadow-lg"
                            style={{
                              background: 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
                              boxShadow: 'inset 2px 2px 4px rgba(255,255,255,0.2), inset -2px -2px 4px rgba(0,0,0,0.2)'
                            }}>
                            <span className="text-white font-bold text-xl" style={{
                              textShadow: '1px 1px 2px rgba(0,0,0,0.5), -1px -1px 1px rgba(255,255,255,0.3)'
                            }}>
                              {initials || 'K'}
                            </span>
                          </div>

                          {/* Decorative divider */}
                          <div className="flex items-center gap-1 mb-2">
                            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />
                            <div className="w-2 h-2 rotate-45 border border-amber-200/60" />
                            <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />
                          </div>

                          {/* Title */}
                          <h3 className="text-white font-semibold text-center text-[11px] leading-snug line-clamp-3 px-2"
                            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                            {book.description || 'Kitob'}
                          </h3>
                        </div>

                        {/* Bottom buttons - always visible */}
                        <div className="bg-black/40 backdrop-blur-sm px-2 py-2.5 relative z-10 flex items-center justify-center gap-3">
                          {book.image ? (
                            <motion.a
                              href={book.image}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2.5 rounded-full bg-white/90 text-gray-800 shadow-lg backdrop-blur-sm"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiEye className="w-4 h-4" />
                            </motion.a>
                          ) : (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                toast.error('Fayl mavjud emas')
                              }}
                              className="p-2.5 rounded-full bg-white/50 text-gray-500 cursor-not-allowed shadow-lg backdrop-blur-sm"
                              whileHover={{ scale: 1.05 }}
                            >
                              <FiEye className="w-4 h-4" />
                            </motion.button>
                          )}
                          {canManageLibrary && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(book)
                              }}
                              className="p-2.5 rounded-full bg-red-500/90 text-white shadow-lg backdrop-blur-sm"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cover spine highlight */}
                    <div className="absolute left-0 top-0 bottom-0 w-[6px] bg-gradient-to-r from-black/30 via-white/10 to-transparent pointer-events-none" />

                    {/* Top/Bottom book edge */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-b from-white/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  </div>

                  {/* Title below */}
                  <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium text-center line-clamp-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {book.description}
                  </p>
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
              isDark ? 'bg-gray-800/50' : 'bg-white shadow-sm'
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
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                disabled={!hasNext}
                className={`p-1.5 sm:p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </motion.div>
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
              className={`w-full max-w-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border shadow-xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}
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
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-cyan-500'}`}
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
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-cyan-500'}`}
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
                    className={`flex flex-col items-center justify-center w-full h-24 sm:h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isDark ? 'border-gray-700 hover:border-cyan-500/50 bg-gray-800' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}
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
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium transition-all text-sm sm:text-base ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
              className={`w-full max-w-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}
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
                  className={`flex-1 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
    </div>
  )
}

export default LibraryPage



