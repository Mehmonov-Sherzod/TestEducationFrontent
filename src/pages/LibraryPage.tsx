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

        setBooks(
          values.map((b: any) => ({
            id: b.Id || b.id,
            description: b.Description || b.description,
            image: b.Image || b.image,
          }))
        )

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
        image: form.file,
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1
              className={`text-3xl font-bold ${
                (isDark ? 'text-white' : 'text-gray-700')
              }`}
            >
              Kutubxona
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
              O'quv materiallari va kitoblar
            </p>
          </div>

          {canManageLibrary && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
              }`}
            >
              <FiPlus className="w-5 h-5" />
              Yangi qo'shish
            </motion.button>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-white border-gray-200 text-black focus:ring-cyan-500'}`}
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
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all min-w-[180px] justify-between ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black'}`}
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
          <div className="flex items-center justify-center py-20">
            <div
              className={`w-12 h-12 border-4 rounded-full animate-spin ${
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
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FiFilter
                  className={`w-20 h-20 mx-auto mb-4 ${isDark ? 'text-cyan-400' : 'text-blue-500'}`}
                />
              </motion.div>
              <p
                className={`text-xl mb-2 ${
                  (isDark ? 'text-white' : 'text-gray-700')
                }`}
              >
                Fan tanlang
              </p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Kitoblarni ko'rish uchun yuqoridagi filterdan fan tanlang
              </p>
            </div>
          </motion.div>
        ) : books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FiBook
                  className={`w-20 h-20 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                />
              </motion.div>
              <p
                className={`text-xl mb-2 ${
                  (isDark ? 'text-gray-400' : 'text-gray-600')
                }`}
              >
                Kitoblar topilmadi
              </p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Yangi kitob qo'shish uchun "Yangi qo'shish" tugmasini bosing
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {books.map((book) => {
              const hasImage = book.image && book.image.startsWith('http')
              const currentYear = new Date().getFullYear()

              return (
                <motion.div
                  key={book.id}
                  variants={cardVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  {/* Abituriyent Style Book Cover */}
                  <div
                    className="relative overflow-hidden rounded-lg shadow-lg"
                    style={{ aspectRatio: '3/4' }}
                  >
                    {hasImage ? (
                      <>
                        <img
                          src={book.image}
                          alt={book.description}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <a
                            href={book.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-white text-gray-800 hover:bg-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiEye className="w-5 h-5" />
                          </a>
                          {canManageLibrary && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(book)
                              }}
                              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      /* Abituriyent Style Cover */
                      <div className="w-full h-full bg-gradient-to-b from-cyan-500 via-blue-600 to-purple-700 p-3 flex flex-col">
                        {/* Top decorative line */}
                        <div className="text-center text-[6px] text-white/60 mb-1 truncate">
                          O'zbekiston Respublikasi ta'lim tizimi uchun
                        </div>

                        {/* Header Banner */}
                        <div className="relative bg-gradient-to-r from-purple-800 via-purple-700 to-purple-800 py-1.5 px-2 -mx-3">
                          <p className="text-white font-bold text-center text-xs tracking-wider">
                            KUTUBXONA
                          </p>
                          {/* Year badge */}
                          <div className="absolute -right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow">
                            <span className="text-[8px] font-bold text-gray-800">{currentYear}</span>
                          </div>
                        </div>

                        {/* Center content */}
                        <div className="flex-1 flex flex-col items-center justify-center relative">
                          {/* Background book icon */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <FiBook className="w-24 h-24 text-white" />
                          </div>

                          {/* Subject name */}
                          <h3 className="text-white font-bold text-center text-sm leading-tight mb-1 relative z-10 line-clamp-2">
                            {book.description?.split(' ').slice(0, 3).join(' ').toUpperCase()}
                          </h3>

                          {/* Subtitle */}
                          <p className="text-yellow-300 text-[10px] text-center italic">
                            fanidan
                          </p>
                          <p className="text-white/90 text-[9px] text-center">
                            mavzulashtirilgan
                          </p>
                          <p className="text-white font-semibold text-[10px] text-center">
                            testlar to'plami
                          </p>
                        </div>

                        {/* Bottom section */}
                        <div className="flex items-end justify-between mt-auto">
                          {/* Grade/Level badge */}
                          <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1">
                            <span className="text-white font-bold text-lg">1-11</span>
                          </div>

                          {/* Publisher style */}
                          <div className="text-right">
                            <div className="w-6 h-6 rounded bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                              <FiBook className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {canManageLibrary && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(book)
                              }}
                              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Book edge effect */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-black/30 to-transparent" />
                  </div>

                  {/* Title below */}
                  <p className={`mt-2 text-sm font-medium text-center line-clamp-2 ${
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
            className={`flex items-center justify-between mt-8 p-4 rounded-xl ${
              isDark ? 'bg-gray-800/50' : 'bg-white shadow-sm'
            }`}
          >
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Jami: {totalCount} ta kitob
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!hasPrevious}
                className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiChevronLeft className="w-5 h-5" />
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
                disabled={!hasNext}
                className={`p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FiChevronRight className="w-5 h-5" />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl p-6 border shadow-xl ${isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}
            >
              <h2
                className={`text-xl font-bold mb-6 ${
                  (isDark ? 'text-white' : 'text-gray-700')
                }`}
              >
                Yangi kitob qo'shish
              </h2>

              <div className="space-y-4">
                {/* Description */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
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
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-cyan-500'}`}
                  />
                </div>

                {/* Subject */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    Fan *
                  </label>
                  <select
                    value={form.subjectId}
                    onChange={(e) =>
                      setForm({ ...form, subjectId: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-800 border-gray-700 text-white focus:ring-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-cyan-500'}`}
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
                    className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    Fayl *
                  </label>
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all ${isDark ? 'border-gray-700 hover:border-cyan-500/50 bg-gray-800' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}
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
                      <div className="text-center">
                        <FiBook
                          className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}
                        />
                        <p
                          className={`text-sm ${
                            (isDark ? 'text-gray-400' : 'text-gray-600')
                          }`}
                        >
                          {form.file.name}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FiUpload
                          className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        />
                        <p
                          className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          Fayl yuklash uchun bosing
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all ${isDark ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-sm rounded-2xl p-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <div className="text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <FiTrash2
                    className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  />
                </div>
                <h3
                  className={`text-lg font-bold mb-2 ${
                    (isDark ? 'text-white' : 'text-gray-700')
                  }`}
                >
                  O'chirishni tasdiqlang
                </h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  "{deleteConfirm.description}" kitobini o'chirmoqchimisiz?
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className={`flex-1 py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 ${
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



