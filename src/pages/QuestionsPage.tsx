import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHelpCircle,
  FiPlus,
  FiSearch,
  FiX,
  FiSave,
  FiImage,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiFilter,
  FiEdit2,
} from 'react-icons/fi'
import { useAuthStore } from '@store/authStore'
import { useTheme } from '@contexts/ThemeContext'
import toast from 'react-hot-toast'
import { questionService } from '@api/question.service'
import { QuestionResponse, QuestionLevel, CreateAnswerData } from '@appTypes/question.types'
import { API_BASE_URL } from '@utils/constants'

interface Subject {
  Id: string
  SubjectName: string
}

interface Topic {
  id: string
  topicName: string
  subjectId: string
}

export const QuestionsPage = () => {
  const { token, user } = useAuthStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [questions, setQuestions] = useState<QuestionResponse[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('uz')
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null)

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<QuestionResponse | null>(null)
  const [editForm, setEditForm] = useState({
    questionText: '',
    level: QuestionLevel.Easy,
    answers: [] as { id: number; text: string; isCorrect: boolean }[],
  })

  // Check permissions
  const canManageQuestions = user?.permissions?.includes('ManageQuestions')

  // Modal topics (separate from filter topics)
  const [modalTopics, setModalTopics] = useState<Topic[]>([])

  // Create form state
  const [questionForm, setQuestionForm] = useState({
    subjectId: '',
    questionText: '',
    topicId: '',
    level: QuestionLevel.Easy,
    image: null as File | null,
    answers: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ] as CreateAnswerData[],
  })

  // Fetch subjects
  const fetchSubjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Subject/get-all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'lang': selectedLanguage,
        },
      })
      const data = await response.json()
      if (data.Succeeded && data.Result) {
        setSubjects(data.Result)
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error)
    }
  }

  // Fetch topics by subject
  const fetchTopics = async (subjectId: string) => {
    if (!subjectId) {
      setTopics([])
      return
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/topic/paged?SubjectId=${subjectId}&PageNumber=1&PageSize=100`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      if (data.Succeeded && data.Result?.Values) {
        // Extract topics from the grouped response
        const allTopics: Topic[] = []
        data.Result.Values.forEach((group: any) => {
          if (group.Topics) {
            group.Topics.forEach((topic: any) => {
              allTopics.push({
                id: topic.Id,
                topicName: topic.TopicName,
                subjectId: group.SubjectId,
              })
            })
          }
        })
        setTopics(allTopics)
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error)
    }
  }

  // Fetch topics for modal (separate from filter)
  const fetchModalTopics = async (subjectId: string) => {
    if (!subjectId) {
      setModalTopics([])
      return
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/topic/paged?SubjectId=${subjectId}&PageNumber=1&PageSize=100`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      if (data.Succeeded && data.Result?.Values) {
        const allTopics: Topic[] = []
        data.Result.Values.forEach((group: any) => {
          if (group.Topics) {
            group.Topics.forEach((topic: any) => {
              allTopics.push({
                id: topic.Id,
                topicName: topic.TopicName,
                subjectId: group.SubjectId,
              })
            })
          }
        })
        setModalTopics(allTopics)
      }
    } catch (error) {
      console.error('Failed to fetch modal topics:', error)
    }
  }

  // Fetch questions
  const fetchQuestions = async () => {
    if (!selectedSubjectId) {
      setQuestions([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await questionService.getPaginated(
        { pageNumber: currentPage, pageSize, search: searchQuery },
        selectedLanguage,
        selectedSubjectId,
        selectedTopicId || undefined
      )

      if (response.Succeeded && response.Result) {
        setQuestions(response.Result.Values || [])
        setTotalCount(response.Result.TotalCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error)
      toast.error('Failed to load questions')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSubjects()
  }, [])

  useEffect(() => {
    if (selectedSubjectId) {
      fetchTopics(selectedSubjectId)
      setSelectedTopicId('')
    }
  }, [selectedSubjectId])

  useEffect(() => {
    fetchQuestions()
  }, [currentPage, selectedSubjectId, selectedTopicId, selectedLanguage])

  // Create question
  const handleCreateQuestion = async () => {
    if (!questionForm.questionText || !questionForm.topicId) {
      toast.error('Please fill question text and select a topic')
      return
    }

    const correctAnswers = questionForm.answers.filter(a => a.isCorrect)
    if (correctAnswers.length !== 1) {
      toast.error('Please select exactly one correct answer')
      return
    }

    const emptyAnswers = questionForm.answers.filter(a => !a.text.trim())
    if (emptyAnswers.length > 0) {
      toast.error('Please fill all answer fields')
      return
    }

    try {
      const response = await questionService.create({
        questionText: questionForm.questionText,
        topicId: questionForm.topicId,
        level: questionForm.level,
        image: questionForm.image || undefined,
        answers: questionForm.answers,
      })

      if (response.Succeeded) {
        toast.success('Question created successfully!')
        setIsCreating(false)
        resetForm()
        fetchQuestions()
      } else {
        toast.error(response.Errors?.join(', ') || 'Failed to create question')
      }
    } catch (error: any) {
      console.error('Failed to create question:', error)
      // Show detailed error from backend
      const errorMessage = error.response?.data?.Errors?.join(', ')
        || error.response?.data?.message
        || error.message
        || 'An error occurred while creating question'
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setQuestionForm({
      subjectId: '',
      questionText: '',
      topicId: '',
      level: QuestionLevel.Easy,
      image: null,
      answers: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    })
    setModalTopics([])
  }

  // Start editing a question
  const handleStartEdit = (question: QuestionResponse) => {
    setEditingQuestion(question)
    setEditForm({
      questionText: question.QuestionText,
      level: question.QuestionLevel as QuestionLevel,
      answers: question.Answers.map((a) => ({
        id: a.id || a.Id || 0,
        text: a.AnswerText,
        isCorrect: a.isCorrect ?? a.IsCorrect ?? false,
      })),
    })
    setIsEditing(true)
  }

  // Update question
  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return

    if (!editForm.questionText.trim()) {
      toast.error('Please fill question text')
      return
    }

    const correctAnswers = editForm.answers.filter(a => a.isCorrect)
    if (correctAnswers.length !== 1) {
      toast.error('Please select exactly one correct answer')
      return
    }

    const emptyAnswers = editForm.answers.filter(a => !a.text.trim())
    if (emptyAnswers.length > 0) {
      toast.error('Please fill all answer fields')
      return
    }

    // Check if question has Id (lowercase or PascalCase)
    const questionId = editingQuestion.id || editingQuestion.Id
    if (!questionId) {
      toast.error('Question ID not available. Backend needs to return id in list response.')
      return
    }

    try {
      const response = await questionService.update(questionId, {
        questionText: editForm.questionText,
        level: editForm.level,
        answers: editForm.answers,
      })

      if (response.Succeeded) {
        toast.success('Question updated successfully!')
        setIsEditing(false)
        setEditingQuestion(null)
        fetchQuestions()
      } else {
        toast.error(response.Errors?.join(', ') || 'Failed to update question')
      }
    } catch (error: any) {
      console.error('Failed to update question:', error)
      const errorMessage = error.response?.data?.Errors?.join(', ')
        || error.response?.data?.message
        || error.message
        || 'An error occurred while updating question'
      toast.error(errorMessage)
    }
  }

  // Handle edit answer change
  const handleEditAnswerChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newAnswers = [...editForm.answers]
    if (field === 'isCorrect') {
      newAnswers.forEach((a, i) => {
        a.isCorrect = i === index
      })
    } else {
      newAnswers[index] = { ...newAnswers[index], text: value as string }
    }
    setEditForm({ ...editForm, answers: newAnswers })
  }

  const handleAnswerChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newAnswers = [...questionForm.answers]
    if (field === 'isCorrect') {
      // Only one correct answer allowed
      newAnswers.forEach((a, i) => {
        a.isCorrect = i === index
      })
    } else {
      newAnswers[index] = { ...newAnswers[index], text: value as string }
    }
    setQuestionForm({ ...questionForm, answers: newAnswers })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  const getLevelColor = (level: QuestionLevel) => {
    switch (level) {
      case QuestionLevel.Easy:
        return isDark ? 'bg-emerald-500/20 text-cyan-400 border border-emerald-500/30' : 'bg-green-100 text-green-600'
      case QuestionLevel.Medium:
        return isDark ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-yellow-100 text-yellow-600'
      case QuestionLevel.Hard:
        return isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
      default:
        return isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className={`text-4xl font-bold mb-2 flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <FiHelpCircle className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
            Questions Management
          </h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Manage your question bank
          </p>
        </div>
        {canManageQuestions && (
          <button
            onClick={() => setIsCreating(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all ${
              isDark
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
            }`}
          >
            <FiPlus className="w-5 h-5" />
            Add Question
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl mb-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Subject Select */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Subject *</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'}`}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.Id} value={subject.Id}>
                  {subject.SubjectName}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Select */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Topic</label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={!selectedSubjectId}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-red-500'} disabled:opacity-50`}
            >
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.topicName}
                </option>
              ))}
            </select>
          </div>

          {/* Language Select */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'}`}
            >
              <option value="uz">O'zbekcha</option>
              <option value="rus">Русский</option>
              <option value="eng">English</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Search</label>
            <div className="relative">
              <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className={`rounded-2xl shadow-lg overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        {!selectedSubjectId ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiFilter className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Please select a subject to view questions</p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className={`w-16 h-16 border-4 ${isDark ? 'border-cyan-500' : 'border-blue-500'} border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading questions...</p>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FiHelpCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No questions found</p>
            </div>
          </div>
        ) : (
          <>
            <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {questions.map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="overflow-hidden"
                >
                  {/* Question Header - Clickable */}
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                    className={`w-full p-4 text-left flex items-center justify-between gap-4 transition-colors ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    } ${expandedQuestion === index ? (isDark ? 'bg-gray-700/50' : 'bg-gray-50') : ''}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelColor(question.QuestionLevel)}`}>
                          {question.QuestionLevel}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {question.Answers.length} ta javob
                        </span>
                      </div>
                      <h3 className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {question.QuestionText}
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedQuestion === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </motion.div>
                  </button>

                  {/* Answers - Expandable */}
                  <AnimatePresence>
                    {expandedQuestion === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`overflow-hidden ${isDark ? 'bg-gray-800/50' : 'bg-gray-50/50'}`}
                      >
                        <div className="px-4 pb-4">
                          {question.Image && (
                            <div className="mb-4">
                              <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Rasm:
                              </p>
                              <a
                                href={questionService.getImageUrl(question.Image)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                <img
                                  src={questionService.getImageUrl(question.Image)}
                                  alt="Question"
                                  className={`max-h-60 rounded-xl border-2 shadow-lg hover:scale-105 transition-transform cursor-pointer ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                                />
                              </a>
                            </div>
                          )}
                          {/* Edit Button */}
                          {canManageQuestions && (
                            <div className="flex justify-end mb-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStartEdit(question)
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                  isDark
                                    ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                              >
                                <FiEdit2 className="w-4 h-4" />
                                Edit
                              </button>
                            </div>
                          )}
                          <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            Javob variantlari:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {question.Answers.map((answer, aIndex) => (
                              <div
                                key={aIndex}
                                className={`p-3 rounded-lg text-sm flex items-start gap-2 border ${
                                  isDark ? 'bg-gray-900/50 text-gray-200 border-gray-700' : 'bg-white text-gray-700 border-gray-200'
                                }`}
                              >
                                <span className={`font-semibold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                                  {String.fromCharCode(65 + aIndex)}.
                                </span>
                                <span>{answer.AnswerText}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg disabled:opacity-50 transition-colors ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <span className={isDark ? 'text-white' : 'text-gray-700'}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg disabled:opacity-50 transition-colors ${isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Question Modal */}
      <AnimatePresence>
        {isCreating && (
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
              className={`rounded-2xl shadow-2xl border p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className={`text-3xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiHelpCircle className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
                  Create New Question
                </h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}
                >
                  <FiX className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Subject and Topic in grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Select */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Subject *</label>
                  <select
                    value={questionForm.subjectId}
                    onChange={(e) => {
                      const newSubjectId = e.target.value
                      setQuestionForm({ ...questionForm, subjectId: newSubjectId, topicId: '' })
                      fetchModalTopics(newSubjectId)
                    }}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'}`}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.Id} value={subject.Id}>
                        {subject.SubjectName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic Select */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Topic *</label>
                  <select
                    value={questionForm.topicId}
                    onChange={(e) => setQuestionForm({ ...questionForm, topicId: e.target.value })}
                    disabled={!questionForm.subjectId}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-red-500'} disabled:opacity-50`}
                  >
                    <option value="">Select Topic</option>
                    {modalTopics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.topicName}
                      </option>
                    ))}
                  </select>
                </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Question Text *</label>
                  <textarea
                    value={questionForm.questionText}
                    onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 text-base ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
                    placeholder="Enter your question..."
                  />
                </div>

                {/* Level and Image in grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Level Select */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Difficulty Level</label>
                  <select
                    value={questionForm.level}
                    onChange={(e) => setQuestionForm({ ...questionForm, level: e.target.value as QuestionLevel })}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'}`}
                  >
                    <option value={QuestionLevel.Easy}>Easy</option>
                    <option value={QuestionLevel.Medium}>Medium</option>
                    <option value={QuestionLevel.Hard}>Hard</option>
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Image (Optional)</label>
                  <label className={`flex items-center justify-center w-full h-full min-h-[80px] rounded-lg border-2 border-dashed cursor-pointer transition-all ${isDark ? 'border-gray-700 hover:border-cyan-500/50 bg-gray-900' : 'border-gray-300 hover:border-blue-400 bg-gray-50'}`}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setQuestionForm({ ...questionForm, image: e.target.files?.[0] || null })}
                      className="hidden"
                    />
                    <div className="text-center py-4">
                      <FiImage className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                        {questionForm.image ? questionForm.image.name : 'Click to upload image'}
                      </span>
                    </div>
                  </label>
                </div>
                </div>

                {/* Answers */}
                <div>
                  <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Answers * (Select correct answer)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questionForm.answers.map((answer, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleAnswerChange(index, 'isCorrect', true)}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            answer.isCorrect
                              ? isDark
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-green-500 bg-green-500 text-white'
                              : isDark
                                ? 'border-gray-700 hover:border-green-500'
                                : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {answer.isCorrect && <FiCheck className="w-5 h-5" />}
                        </button>
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <span className={`font-semibold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                            {String.fromCharCode(65 + index)}.
                          </span>
                        </div>
                        <input
                          type="text"
                          value={answer.text}
                          onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                          placeholder={`Answer ${String.fromCharCode(65 + index)}`}
                          className={`flex-1 px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className={`flex gap-4 mt-8 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={handleCreateQuestion}
                    className={`flex-1 py-4 px-8 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-lg ${
                      isDark
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    <FiSave className="w-6 h-6" />
                    Create Question
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className={`py-4 px-8 rounded-xl font-semibold transition-colors text-lg ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Question Modal */}
      <AnimatePresence>
        {isEditing && editingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-2xl shadow-2xl border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiEdit2 className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
                  Edit Question
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100'}`}
                >
                  <FiX className={`w-6 h-6 ${isDark ? 'text-gray-300' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Question Text */}
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Question Text *</label>
                  <textarea
                    value={editForm.questionText}
                    onChange={(e) => setEditForm({ ...editForm, questionText: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
                    placeholder="Enter your question..."
                  />
                </div>

                {/* Level Select */}
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Difficulty Level</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value as QuestionLevel })}
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'}`}
                  >
                    <option value={QuestionLevel.Easy}>Easy</option>
                    <option value={QuestionLevel.Medium}>Medium</option>
                    <option value={QuestionLevel.Hard}>Hard</option>
                  </select>
                </div>

                {/* Answers */}
                <div>
                  <label className={`block text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Answers * (Select correct answer)</label>
                  <div className="space-y-3">
                    {editForm.answers.map((answer, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleEditAnswerChange(index, 'isCorrect', true)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                            answer.isCorrect
                              ? isDark
                                ? 'border-green-500 bg-green-500 text-white'
                                : 'border-green-500 bg-green-500 text-white'
                              : isDark
                                ? 'border-gray-700 hover:border-green-500'
                                : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {answer.isCorrect && <FiCheck className="w-4 h-4" />}
                        </button>
                        <input
                          type="text"
                          value={answer.text}
                          onChange={(e) => handleEditAnswerChange(index, 'text', e.target.value)}
                          placeholder={`Answer ${index + 1}`}
                          className={`flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500/50 focus:border-cyan-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateQuestion}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                      isDark
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    }`}
                  >
                    <FiSave className="w-5 h-5" />
                    Update Question
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className={`py-3 px-6 rounded-lg font-semibold transition-colors ${isDark ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
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
