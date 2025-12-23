import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiLayers,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiSearch,
  FiX,
  FiSave,
  FiShield,
  FiKey,
  FiUser,
  FiBook,
  FiAlertTriangle,
  FiFilter,
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from 'react-icons/fi'
import { useAuthStore } from '@store/authStore'
import { useTheme } from '@contexts/ThemeContext'
import { topicService, handleApiError } from '@api/topic.service'
import { subjectService } from '@api/subject.service'
import {
  Topic,
  SubjectTopicsResponse,
  TopicPageParams,
} from '@/types/topic.types'
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
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
}

const pulseVariants = {
  initial: { scale: 1 },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const TopicsPage = () => {
  const { user } = useAuthStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Data state
  const [subjectTopics, setSubjectTopics] = useState<SubjectTopicsResponse[]>([])
  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Modal state
  const [isCreating, setIsCreating] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [deletingTopic, setDeletingTopic] = useState<{ id: string; name: string } | null>(null)
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null)

  // Form state
  const [topicForm, setTopicForm] = useState({
    topicName: '',
    subjectId: '',
  })

  // Check permissions
  const canManageTopics = user?.permissions?.includes('ManageTopics') ||
    user?.permissions?.includes('ManageSubjects') ||
    user?.permissions?.includes('ManageQuestions')
  const isSuperAdmin =
    user?.permissions?.includes('ManageAdmins') ||
    user?.permissions?.includes('ManageUsers') ||
    user?.permissions?.includes('SystemSettings')
  const isAdmin =
    (user?.permissions?.includes('ManageTopics') ||
      user?.permissions?.includes('ManageSubjects') ||
      user?.permissions?.includes('ManageQuestions')) &&
    !isSuperAdmin
  const isStudent = !canManageTopics

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setCurrentPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch subjects for dropdown
  const fetchSubjects = useCallback(async () => {
    try {
      const response = await subjectService.getAll('uz')
      if (response.Succeeded && response.Result) {
        const subjectOptions: SubjectOption[] = response.Result.map((s: any) => ({
          id: s.Id,
          name: s.SubjectName,
        }))
        setSubjects(subjectOptions)
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
      toast.error('Failed to load subjects')
    }
  }, [])

  // Fetch topics with pagination
  const fetchTopics = useCallback(async () => {
    try {
      setIsLoading(true)
      const params: TopicPageParams = {
        pageNumber: currentPage,
        pageSize: pageSize,
        subjectId: selectedSubjectFilter || undefined,
        search: debouncedSearch || undefined,
      }

      const response = await topicService.getPaged(params)

      if (response.Succeeded && response.Result) {
        // Handle PascalCase from backend
        const result = response.Result as any
        const values = result.Values || result.values || []
        const total = result.TotalCount || result.totalCount || 0

        // Map the response to our types
        const mappedTopics: SubjectTopicsResponse[] = values.map((st: any) => ({
          subjectId: st.SubjectId || st.subjectId,
          subjectName: st.SubjectName || st.subjectName,
          topics: (st.Topics || st.topics || []).map((t: any) => ({
            id: t.Id || t.id,
            topicName: t.TopicName || t.topicName,
            subjectId: t.SubjectId || t.subjectId,
            subjectName: t.SubjectName || t.subjectName || st.SubjectName || st.subjectName,
            questionCount: t.QuestionCount || t.questionCount || 0,
          })),
        }))

        setSubjectTopics(mappedTopics)
        setTotalCount(total)
      } else {
        toast.error('Failed to fetch topics')
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error)
      toast.error(handleApiError(error))
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, pageSize, selectedSubjectFilter, debouncedSearch])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  // Create topic
  const handleCreateTopic = async () => {
    if (!canManageTopics) {
      toast.error('You do not have permission to create topics')
      return
    }

    if (!topicForm.topicName.trim()) {
      toast.error('Please enter topic name')
      return
    }

    if (!topicForm.subjectId) {
      toast.error('Please select a subject')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await topicService.create({
        TopicName: topicForm.topicName,
        SubjectId: topicForm.subjectId,
      })

      if (response.Succeeded) {
        toast.success('Topic created successfully!')
        setIsCreating(false)
        setTopicForm({ topicName: '', subjectId: '' })
        fetchTopics()
      } else {
        toast.error(response.Errors?.join(', ') || 'Failed to create topic')
      }
    } catch (error) {
      console.error('Failed to create topic:', error)
      toast.error(handleApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update topic
  const handleUpdateTopic = async () => {
    if (!canManageTopics || !editingTopic) {
      toast.error('You do not have permission to update topics')
      return
    }

    if (!topicForm.topicName.trim()) {
      toast.error('Please enter topic name')
      return
    }

    try {
      setIsSubmitting(true)
      const response = await topicService.update(editingTopic.id, {
        TopicName: topicForm.topicName,
      })

      if (response.Succeeded) {
        toast.success('Topic updated successfully!')
        setEditingTopic(null)
        setTopicForm({ topicName: '', subjectId: '' })
        fetchTopics()
      } else {
        toast.error(response.Errors?.join(', ') || 'Failed to update topic')
      }
    } catch (error) {
      console.error('Failed to update topic:', error)
      toast.error(handleApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete topic
  const handleDeleteTopic = async () => {
    if (!deletingTopic) return

    try {
      setIsSubmitting(true)
      const response = await topicService.delete(deletingTopic.id)

      if (response.Succeeded) {
        toast.success('Topic deleted successfully!')
        setDeletingTopic(null)
        fetchTopics()
      } else {
        toast.error(response.Errors?.join(', ') || 'Failed to delete topic')
      }
    } catch (error) {
      console.error('Failed to delete topic:', error)
      toast.error(handleApiError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open edit modal
  const openEditModal = (topic: Topic) => {
    if (!canManageTopics) {
      toast.error('You do not have permission to edit topics')
      return
    }
    setEditingTopic(topic)
    setTopicForm({
      topicName: topic.topicName,
      subjectId: topic.subjectId,
    })
  }

  // Open delete confirmation
  const openDeleteConfirmation = (topic: Topic) => {
    if (!canManageTopics) {
      toast.error('You do not have permission to delete topics')
      return
    }
    setDeletingTopic({ id: topic.id, name: topic.topicName })
  }

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="py-4 sm:py-8 px-2 sm:px-4 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8"
      >
        <div>
          <h1
            className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex flex-wrap items-center gap-2 sm:gap-3 ${
              (isDark ? 'text-white' : 'text-gray-700')
            }`}
          >
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <FiLayers
                className={isDark ? 'text-blue-400' : 'text-gray-600'}
              />
            </motion.div>
            <span>Topics</span>
            {isSuperAdmin && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-normal flex items-center gap-1 ${
                  isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'
                }`}
              >
                <FiShield className="w-3 h-3" />
                SuperAdmin
              </motion.span>
            )}
            {isAdmin && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-normal flex items-center gap-1 ${
                  isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
                }`}
              >
                <FiKey className="w-3 h-3" />
                Admin
              </motion.span>
            )}
            {isStudent && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
                className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-normal flex items-center gap-1 ${
                  isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-600'
                }`}
              >
                <FiUser className="w-3 h-3" />
                Student
              </motion.span>
            )}
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {canManageTopics
              ? 'Manage topics across all subjects'
              : 'Browse available topics'}
          </p>
        </div>
        {canManageTopics && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(34, 211, 238, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setTopicForm({ topicName: '', subjectId: '' })
              setIsCreating(true)
            }}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 text-sm sm:text-base w-full sm:w-auto ${
              isDark
                ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/30'
                : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/30'
            }`}
          >
            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            Create Topic
          </motion.button>
        )}
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-4 sm:mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
      >
        {/* Search */}
        <div className="relative flex-1 sm:max-w-md">
          <FiSearch
            className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
              (isDark ? 'text-gray-400' : 'text-gray-500')
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${isDark ? 'bg-[#151515] border-gray-600/30 text-white focus:ring-blue-500/50 focus:border-blue-500' : 'bg-white border-gray-200 text-black focus:ring-blue-500'}`}
          />
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <FiX className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        <div className="flex gap-2 sm:gap-4">
          {/* Subject Filter Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border transition-all duration-300 w-full sm:min-w-[200px] justify-between text-sm sm:text-base ${isDark ? 'bg-[#151515] border-gray-600/30 text-white' : 'bg-white border-gray-200 text-black'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FiFilter
                  className={`flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-gray-600'}`}
                />
                <span className="truncate text-sm">
                  {selectedSubjectFilter
                    ? subjects.find((s) => s.id === selectedSubjectFilter)?.name ||
                      'All'
                    : 'All Subjects'}
                </span>
              </div>
              <motion.div
                animate={{ rotate: isFilterOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <FiChevronDown />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isFilterOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute top-full mt-2 w-full sm:min-w-[200px] rounded-xl border shadow-2xl z-50 overflow-hidden max-h-64 overflow-y-auto ${isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200'}`}
                  >
                    <button
                      onClick={() => {
                        setSelectedSubjectFilter('')
                        setIsFilterOpen(false)
                        setCurrentPage(1)
                      }}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors flex items-center gap-2 text-sm ${
                        !selectedSubjectFilter
                          ? isDark
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-blue-50 text-blue-600'
                          : isDark
                          ? 'text-white hover:bg-[#1a1a1a]'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <FiBook className="w-4 h-4" />
                      All Subjects
                    </button>
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => {
                          setSelectedSubjectFilter(subject.id)
                          setIsFilterOpen(false)
                          setCurrentPage(1)
                        }}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors flex items-center gap-2 text-sm ${
                          selectedSubjectFilter === subject.id
                            ? isDark
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'bg-blue-50 text-blue-600'
                            : isDark
                            ? 'text-white hover:bg-[#1a1a1a]'
                            : 'text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <FiBook className="w-4 h-4" />
                        {subject.name}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchTopics()}
            disabled={isLoading}
            className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-300 flex-shrink-0 ${isDark ? 'bg-[#151515] border-gray-600/30 text-white' : 'bg-white border-gray-200 text-black'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FiRefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-20"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className={`w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={isDark ? 'text-gray-400' : 'text-gray-600'}
            >
              Loading topics...
            </motion.p>
          </div>
        </motion.div>
      ) : subjectTopics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center py-20"
        >
          <div className="text-center">
            <motion.div
              variants={pulseVariants}
              initial="initial"
              animate="pulse"
            >
              <FiLayers
                className={`w-20 h-20 mx-auto mb-4 ${
                  'text-gray-400'
                }`}
              />
            </motion.div>
            <p
              className={`text-xl mb-2 ${
                (isDark ? 'text-gray-400' : 'text-gray-500')
              }`}
            >
              No topics found
            </p>
            <p className={'text-gray-400'}>
              {debouncedSearch
                ? 'Try adjusting your search query'
                : 'Create your first topic to get started'}
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Compact Topics List by Subject */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {subjectTopics.map((subjectGroup) => (
              <motion.div
                key={subjectGroup.subjectId}
                variants={cardVariants}
                className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200 shadow-sm'}`}
              >
                {/* Clickable Subject Header */}
                <div
                  onClick={() => setExpandedSubjectId(expandedSubjectId === subjectGroup.subjectId ? null : subjectGroup.subjectId)}
                  className="flex items-center gap-3 p-4 cursor-pointer select-none"
                >
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${isDark ? 'bg-blue-500/15' : 'bg-gray-100'}`}
                  >
                    <FiBook
                      className={`w-5 h-5 ${
                        isDark ? 'text-blue-400' : 'text-gray-600'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm ${
                        (isDark ? 'text-white' : 'text-gray-700')
                      }`}
                    >
                      {subjectGroup.subjectName}
                    </p>
                    <span
                      className={`text-xs ${
                        'text-gray-400'
                      }`}
                    >
                      {subjectGroup.topics.length} topic{subjectGroup.topics.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {canManageTopics && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setTopicForm({ topicName: '', subjectId: subjectGroup.subjectId })
                        setIsCreating(true)
                      }}
                      className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                        isDark
                          ? 'hover:bg-blue-500/15 text-blue-400'
                          : 'hover:bg-blue-500/10 text-blue-600'
                      }`}
                    >
                      <FiPlus className="w-4 h-4" />
                    </motion.button>
                  )}
                  <motion.div
                    animate={{ rotate: expandedSubjectId === subjectGroup.subjectId ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex-shrink-0 ${(isDark ? 'text-gray-400' : 'text-gray-500')}`}
                  >
                    <FiChevronDown className="w-5 h-5" />
                  </motion.div>
                </div>

                {/* Expandable Topics List */}
                <AnimatePresence>
                  {expandedSubjectId === subjectGroup.subjectId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`px-4 pb-3 border-t ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      >
                        <div className="space-y-2 pt-3">
                          {subjectGroup.topics.map((topic, topicIndex) => (
                            <motion.div
                              key={topic.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: topicIndex * 0.03 }}
                              className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-[#1a1a1a] hover:bg-[#252525]' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
                            >
                              <div
                                className={`p-1.5 rounded-md flex-shrink-0 ${isDark ? 'bg-blue-500/15' : 'bg-gray-100'}`}
                              >
                                <FiLayers
                                  className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-gray-600'}`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium truncate ${
                                    (isDark ? 'text-white' : 'text-gray-700')
                                  }`}
                                >
                                  {topic.topicName}
                                </p>
                                <span
                                  className={`text-xs ${
                                    'text-gray-400'
                                  }`}
                                >
                                  {topic.questionCount} question{topic.questionCount !== 1 ? 's' : ''}
                                </span>
                              </div>
                              {canManageTopics && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => openEditModal(topic)}
                                    className={`p-1.5 rounded-md transition-colors ${
                                      isDark
                                        ? 'hover:bg-blue-500/15 text-blue-400'
                                        : 'hover:bg-blue-500/10 text-teal-600'
                                    }`}
                                  >
                                    <FiEdit2 className="w-3.5 h-3.5" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => openDeleteConfirmation(topic)}
                                    className={`p-1.5 rounded-md transition-colors ${
                                      isDark
                                        ? 'hover:bg-red-500/20 text-red-400'
                                        : 'hover:bg-red-500/10 text-red-600'
                                    }`}
                                  >
                                    <FiTrash2 className="w-3.5 h-3.5" />
                                  </motion.button>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 sm:mt-8 px-3 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border ${isDark ? 'bg-[#151515] border-gray-600/30 text-white' : 'bg-white border-gray-200 text-black'}`}
            >
              <p
                className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                {currentPage} / {totalPages} ({totalCount})
              </p>
              <div className="flex items-center gap-1 sm:gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-1 px-2 sm:px-4 py-2 rounded-lg transition-all text-sm ${isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <FiChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </motion.button>

                {/* Mobile: 3 pages, Desktop: 5 pages */}
                <div className="flex sm:hidden items-center gap-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 3) {
                      pageNum = i + 1
                    } else if (currentPage === 1) {
                      pageNum = i + 1
                    } else if (currentPage === totalPages) {
                      pageNum = totalPages - 2 + i
                    } else {
                      pageNum = currentPage - 1 + i
                    }
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                          currentPage === pageNum
                            ? isDark
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-blue-600 text-white shadow-lg'
                            : isDark
                            ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    )
                  })}
                </div>
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
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? isDark
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-blue-600 text-white shadow-lg'
                            : isDark
                            ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    )
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-1 px-2 sm:px-4 py-2 rounded-lg transition-all text-sm ${isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <FiChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Create Topic Modal */}
      <AnimatePresence>
        {isCreating && canManageTopics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => !isSubmitting && setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, rotateX: -10 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, y: 20, rotateX: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl shadow-2xl p-4 sm:p-8 max-w-md w-full relative overflow-hidden max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#151515] border border-gray-600/30' : 'bg-white border border-blue-500/30'}`}
            >
              {/* Animated Background Glow */}
              <motion.div
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'}`}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2
                    className={`text-lg sm:text-2xl font-bold flex items-center gap-2 ${
                      (isDark ? 'text-white' : 'text-gray-700')
                    }`}
                  >
                    <FiLayers
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                    />
                    <span className="hidden sm:inline">Create New Topic</span>
                    <span className="sm:hidden">New Topic</span>
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => !isSubmitting && setIsCreating(false)}
                    disabled={isSubmitting}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Subject Dropdown */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Subject *
                    </label>
                    <select
                      value={topicForm.subjectId}
                      onChange={(e) =>
                        setTopicForm({
                          ...topicForm,
                          subjectId: e.target.value,
                        })
                      }
                      disabled={isSubmitting}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white focus:ring-blue-500/50 focus:border-blue-500' : 'bg-white border-gray-200 text-black focus:ring-blue-500'}`}
                    >
                      <option value="" className={isDark ? 'bg-gray-900' : ''}>
                        Select a subject
                      </option>
                      {subjects.map((subject) => (
                        <option
                          key={subject.id}
                          value={subject.id}
                          className={isDark ? 'bg-gray-900' : ''}
                        >
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic Name */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Topic Name *
                    </label>
                    <input
                      type="text"
                      value={topicForm.topicName}
                      onChange={(e) =>
                        setTopicForm({ ...topicForm, topicName: e.target.value })
                      }
                      disabled={isSubmitting}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white focus:ring-blue-500/50 focus:border-blue-500' : 'bg-white border-gray-200 text-black focus:ring-blue-500'}`}
                      placeholder="Enter topic name"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <motion.button
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      onClick={() => !isSubmitting && setIsCreating(false)}
                      disabled={isSubmitting}
                      className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-colors text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      onClick={handleCreateTopic}
                      disabled={isSubmitting}
                      className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                        isDark
                          ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/25'
                          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/25'
                      } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <FiSave className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      {isSubmitting ? 'Creating...' : 'Create'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Topic Modal */}
      <AnimatePresence>
        {editingTopic && canManageTopics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => !isSubmitting && setEditingTopic(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl shadow-2xl p-4 sm:p-8 max-w-md w-full relative overflow-hidden max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#151515] border border-gray-600/30' : 'bg-white border border-blue-500/30'}`}
            >
              {/* Animated Background Glow */}
              <motion.div
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-blue-500/10' : 'bg-blue-500/20'}`}
              />

              <div className="relative">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2
                    className={`text-lg sm:text-2xl font-bold flex items-center gap-2 ${
                      (isDark ? 'text-white' : 'text-gray-700')
                    }`}
                  >
                    <FiEdit2 className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-blue-400' : 'text-blue-400'}`} />
                    Edit Topic
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => !isSubmitting && setEditingTopic(null)}
                    disabled={isSubmitting}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#1a1a1a] text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                  >
                    <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Subject Display (Read-only) */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Subject
                    </label>
                    <div
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border text-sm sm:text-base ${isDark ? 'bg-gray-900 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                    >
                      {editingTopic.subjectName}
                    </div>
                  </div>

                  {/* Topic Name */}
                  <div>
                    <label
                      className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                      Topic Name *
                    </label>
                    <input
                      type="text"
                      value={topicForm.topicName}
                      onChange={(e) =>
                        setTopicForm({ ...topicForm, topicName: e.target.value })
                      }
                      disabled={isSubmitting}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white focus:ring-blue-500/50 focus:border-blue-500' : 'bg-white border-gray-200 text-black focus:ring-blue-500'}`}
                      placeholder="Enter topic name"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                    <motion.button
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      onClick={() => !isSubmitting && setEditingTopic(null)}
                      disabled={isSubmitting}
                      className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold transition-colors text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      onClick={handleUpdateTopic}
                      disabled={isSubmitting}
                      className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                        isDark
                          ? 'bg-green-600 hover:bg-green-700 text-white hover:shadow-green-500/25'
                          : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/25'
                      } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <FiSave className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      {isSubmitting ? 'Updating...' : 'Update'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingTopic && canManageTopics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => !isSubmitting && setDeletingTopic(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className={`p-4 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full border ${isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="p-2 sm:p-3 bg-red-500/20 rounded-full"
                >
                  <FiAlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
                </motion.div>
                <div>
                  <h2
                    className={`text-lg sm:text-2xl font-bold ${
                      (isDark ? 'text-white' : 'text-gray-700')
                    }`}
                  >
                    Delete Topic
                  </h2>
                  <p
                    className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`mb-4 sm:mb-6 p-3 sm:p-4 border rounded-xl ${
                  isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'
                }`}
              >
                <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Are you sure you want to delete{' '}
                  <span
                    className={`font-bold ${
                      (isDark ? 'text-white' : 'text-gray-700')
                    }`}
                  >
                    "{deletingTopic.name}"
                  </span>
                  ?
                </p>
                <p
                  className={`text-xs sm:text-sm mt-1.5 sm:mt-2 ${
                    (isDark ? 'text-gray-400' : 'text-gray-500')
                  }`}
                >
                  All associated questions will be permanently removed.
                </p>
              </motion.div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  onClick={() => !isSubmitting && setDeletingTopic(null)}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-colors text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  onClick={handleDeleteTopic}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors inline-flex items-center justify-center gap-2 text-sm sm:text-base ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <FiTrash2 className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}



