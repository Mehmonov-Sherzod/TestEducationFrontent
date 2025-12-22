import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiBook,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSearch,
  FiX,
  FiSave,
  FiShield,
  FiKey,
  FiUser,
  FiGlobe,
  FiAlertTriangle,
} from 'react-icons/fi'
import { useAuthStore } from '@store/authStore'
import { useTheme } from '@contexts/ThemeContext'
import toast from 'react-hot-toast'

interface SubjectTranslate {
  ColumnName: string
  TranslateText: string
}

interface Subject {
  Id?: number
  SubjectName: string
  Translates?: SubjectTranslate[]
}


type Language = 'uz' | 'rus' | 'eng'

const LANGUAGES = [
  { code: 'uz' as Language, label: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'rus' as Language, label: 'Русский', flag: '🇷🇺' },
  { code: 'eng' as Language, label: 'English', flag: '🇬🇧' },
]

export const SubjectsPage = () => {
  const { token, user } = useAuthStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [hasNext, setHasNext] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('uz')
  const [deletingSubject, setDeletingSubject] = useState<{ Id: number; Name: string } | null>(null)

  // Check permissions
  const canManageSubjects = user?.permissions?.includes('ManageSubjects')
  const isSuperAdmin = user?.permissions?.includes('ManageAdmins') ||
    user?.permissions?.includes('ManageUsers') ||
    user?.permissions?.includes('SystemSettings')
  const isAdmin = user?.permissions?.includes('ManageSubjects') && !isSuperAdmin
  const isStudent = !canManageSubjects

  // Create/Edit form state
  const [subjectForm, setSubjectForm] = useState({
    name_uz: '',
    name_rus: '',
    name_eng: '',
  })

  // All subjects (for client-side pagination)
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])

  // Fetch all subjects
  const fetchSubjects = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('https://localhost:5001/api/Subject/get-all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'lang': selectedLanguage,
        },
      })

      const data = await response.json()

      if (data.Succeeded && data.Result) {
        setAllSubjects(data.Result)
      } else {
        toast.error('Failed to fetch subjects')
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
      toast.error('Failed to load subjects')
    } finally {
      setIsLoading(false)
    }
  }

  // Apply client-side filtering and pagination
  useEffect(() => {
    let filtered = allSubjects

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = allSubjects.filter(subject =>
        subject.SubjectName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setTotalCount(filtered.length)

    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    setSubjects(filtered.slice(startIndex, endIndex))

    // Update pagination state
    setHasPrevious(currentPage > 1)
    setHasNext(endIndex < filtered.length)
  }, [allSubjects, searchQuery, currentPage, pageSize])

  useEffect(() => {
    fetchSubjects()
  }, [selectedLanguage])

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Create subject
  const handleCreateSubject = async () => {
    if (!canManageSubjects) {
      toast.error('Only Admin and SuperAdmin can create subjects')
      return
    }

    if (!subjectForm.name_uz || !subjectForm.name_rus || !subjectForm.name_eng) {
      toast.error('Please enter subject name in all 3 languages')
      return
    }

    try {
      const response = await fetch('https://localhost:5001/api/Subject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          Name: subjectForm.name_uz,
          SubjectTranslates: [
            { LanguageId: 0, ColumnName: 'SubjectName', TranslateText: subjectForm.name_uz },
            { LanguageId: 1, ColumnName: 'SubjectName', TranslateText: subjectForm.name_rus },
            { LanguageId: 2, ColumnName: 'SubjectName', TranslateText: subjectForm.name_eng },
          ],
        }),
      })

      const data = await response.json()

      if (data.Succeeded) {
        toast.success('Subject created successfully!')
        setIsCreating(false)
        setSubjectForm({ name_uz: '', name_rus: '', name_eng: '' })
        fetchSubjects()
      } else {
        const errorMessage = data.Errors?.join(', ') || 'Failed to create subject'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Failed to create subject:', error)
      toast.error('An error occurred while creating subject')
    }
  }

  // Update subject
  const handleUpdateSubject = async () => {
    if (!canManageSubjects || !editingSubject || !editingSubject.Id) {
      toast.error('Only Admin and SuperAdmin can update subjects')
      return
    }

    if (!subjectForm.name_uz || !subjectForm.name_rus || !subjectForm.name_eng) {
      toast.error('Please enter subject name in all 3 languages')
      return
    }

    try {
      const response = await fetch(`https://localhost:5001/api/Subject/${editingSubject.Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          SubjectNmae: subjectForm.name_uz,
          UpdateSubjectTranslateModels: [
            { Id: 0, LanguageId: 0, ColumnName: 'SubjectName', TranslateText: subjectForm.name_uz },
            { Id: 0, LanguageId: 1, ColumnName: 'SubjectName', TranslateText: subjectForm.name_rus },
            { Id: 0, LanguageId: 2, ColumnName: 'SubjectName', TranslateText: subjectForm.name_eng },
          ],
        }),
      })

      const data = await response.json()

      if (data.Succeeded) {
        toast.success('Subject updated successfully!')
        setEditingSubject(null)
        setSubjectForm({ name_uz: '', name_rus: '', name_eng: '' })
        fetchSubjects()
      } else {
        const errorMessage = data.Errors?.join(', ') || 'Failed to update subject'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Failed to update subject:', error)
      toast.error('An error occurred while updating subject')
    }
  }

  // Delete subject
  const handleDeleteSubject = async () => {
    if (!deletingSubject) return

    try {
      const response = await fetch(`https://localhost:5001/api/Subject/${deletingSubject.Id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.Succeeded) {
        toast.success('Subject deleted successfully!')
        setDeletingSubject(null)
        fetchSubjects()
      } else {
        const errorMessage = data.Errors?.join(', ') || 'Failed to delete subject'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Failed to delete subject:', error)
      toast.error('An error occurred while deleting subject')
    }
  }

  const openDeleteConfirmation = (subjectId: number, subjectName: string) => {
    if (!canManageSubjects) {
      toast.error('Only Admin and SuperAdmin can delete subjects')
      return
    }
    setDeletingSubject({ Id: subjectId, Name: subjectName })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-4xl font-bold mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-700'}`}>
            <FiBook className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
            Subjects
            {isSuperAdmin && (
              <span className={`text-xs px-3 py-1 rounded-full font-normal flex items-center gap-1 ${
                isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <FiShield className="w-3 h-3" />
                SuperAdmin
              </span>
            )}
            {isAdmin && (
              <span className={`text-xs px-3 py-1 rounded-full font-normal flex items-center gap-1 ${
                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                <FiKey className="w-3 h-3" />
                Admin
              </span>
            )}
            {isStudent && (
              <span className={`text-xs px-3 py-1 rounded-full font-normal flex items-center gap-1 ${
                isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                <FiUser className="w-3 h-3" />
                Student
              </span>
            )}
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            {canManageSubjects ? 'Manage subjects' : 'Browse available subjects'}
          </p>
        </div>
        {canManageSubjects && (
          <button
            onClick={() => setIsCreating(true)}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all ${
              isDark ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FiPlus className="w-5 h-5" />
            Create Subject
          </button>
        )}
      </div>

      {/* Language Selector */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <FiGlobe className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>Language:</span>
        </div>
        <div className="flex gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedLanguage === lang.code
                  ? isDark
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'bg-blue-600 text-white shadow-lg'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lang.flag} {lang.label}
            </button>
          ))}
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
            placeholder="Search subjects..."
            className={`w-full pl-12 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500'
                : 'bg-white/70 border-cyan-100 text-black placeholder-gray-400 focus:ring-blue-500'
            }`}
          />
        </div>
      </div>

      {/* Subjects Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${isDark ? 'border-cyan-500' : 'border-blue-500'}`}></div>
            <p className={`text-lg ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>Loading subjects...</p>
          </div>
        </div>
      ) : subjects.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <FiBook className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No subjects found</p>
          </div>
        </div>
      ) : (
        <>
          <div className={`rounded-xl overflow-hidden border ${
            isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white/60 border-cyan-100 shadow-sm'
          }`}>
            {/* Table Header */}
            <div className={`grid grid-cols-12 gap-4 px-6 py-4 border-b ${
              isDark ? 'bg-gray-800/80 border-gray-700' : 'bg-cyan-50/40 border-cyan-100'
            }`}>
              <div className={`col-span-1 text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                #
              </div>
              <div className={`col-span-8 text-sm font-semibold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                Subject Name ({selectedLanguage === 'uz' ? "O'zbekcha" : selectedLanguage === 'rus' ? 'Русский' : 'English'})
              </div>
              {canManageSubjects && (
                <div className={`col-span-3 text-sm font-semibold text-right ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                  Actions
                </div>
              )}
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-700/50">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.Id || index}
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
                  <div className={`col-span-8 font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {subject.SubjectName}
                  </div>
                  {canManageSubjects && (
                    <div className="col-span-3 flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingSubject(subject)
                          setSubjectForm({
                            name_uz: subject.SubjectName,
                            name_rus: subject.SubjectName,
                            name_eng: subject.SubjectName,
                          })
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isDark
                            ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        <FiEdit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => openDeleteConfirmation(subject.Id!, subject.SubjectName)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          isDark
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={`flex items-center justify-between mt-6 p-4 rounded-xl ${
              isDark ? 'bg-gray-800/50' : 'bg-cyan-50/50 shadow-sm'
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

      {/* Create Subject Modal */}
      <AnimatePresence>
        {isCreating && canManageSubjects && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl shadow-2xl p-8 max-w-md w-full border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  <FiBook className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
                  Create New Subject
                </h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <FiX className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    🇺🇿 Subject Name (O'zbekcha) *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.name_uz}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name_uz: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500'
                        : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:ring-blue-500'
                    }`}
                    placeholder="Matematika"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    🇷🇺 Subject Name (Русский) *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.name_rus}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name_rus: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500'
                        : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:ring-blue-500'
                    }`}
                    placeholder="Математика"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    🇬🇧 Subject Name (English) *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.name_eng}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name_eng: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500'
                        : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:ring-blue-500'
                    }`}
                    placeholder="Mathematics"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleCreateSubject}
                    className={`flex-1 py-3 px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                      isDark ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FiSave className="w-5 h-5" />
                    Create Subject
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                      isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingSubject && canManageSubjects && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeletingSubject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`p-8 rounded-2xl shadow-2xl max-w-md w-full border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-full ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                  <FiAlertTriangle className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-blue-600'}`} />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-700'}`}>Delete Subject</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>This action cannot be undone</p>
                </div>
              </div>

              <div className={`mb-6 p-4 rounded-lg border ${
                isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
              }`}>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Are you sure you want to delete the subject{' '}
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-700'}`}>"{deletingSubject.Name}"</span>?
                </p>
                <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  All associated data will be permanently removed.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingSubject(null)}
                  className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSubject}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Subject Modal */}
      <AnimatePresence>
        {editingSubject && canManageSubjects && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingSubject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl shadow-2xl p-8 max-w-md w-full border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                  <FiEdit2 className={isDark ? 'text-cyan-400' : 'text-blue-500'} />
                  Edit Subject
                </h2>
                <button
                  onClick={() => setEditingSubject(null)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}
                >
                  <FiX className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    🇺🇿 Subject Name (O'zbekcha) *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.name_uz}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name_uz: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500'
                        : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:ring-blue-500'
                    }`}
                    placeholder="Matematika"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    🇷🇺 Subject Name (Русский) *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.name_rus}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name_rus: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500'
                        : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:ring-blue-500'
                    }`}
                    placeholder="Математика"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    🇬🇧 Subject Name (English) *
                  </label>
                  <input
                    type="text"
                    value={subjectForm.name_eng}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name_eng: e.target.value })}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-gray-700 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500'
                        : 'bg-gray-50 border-gray-200 text-black placeholder-gray-400 focus:ring-blue-500'
                    }`}
                    placeholder="Mathematics"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateSubject}
                    className={`flex-1 py-3 px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                      isDark ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FiSave className="w-5 h-5" />
                    Update Subject
                  </button>
                  <button
                    onClick={() => setEditingSubject(null)}
                    className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                      isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
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
