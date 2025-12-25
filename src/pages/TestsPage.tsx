import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiClipboard,
  FiPlay,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiClock,
  FiX,
  FiBook,
  FiLayers,
} from 'react-icons/fi'
import { useTheme } from '@contexts/ThemeContext'
import { useAuthStore } from '@store/authStore'
import { testService } from '@api/test.service'
import { StartTestMixed30Response, UserQuestionResponse } from '@appTypes/test.types'
import toast from 'react-hot-toast'

interface Subject {
  Id: string
  SubjectName: string
}

interface Topic {
  id: string
  topicName: string
}

export const TestsPage = () => {
  const { theme } = useTheme()
  const { token } = useAuthStore()
  const isDark = theme === 'dark'

  // Selection state
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Test state
  const [testSession, setTestSession] = useState<StartTestMixed30Response | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(new Map())
  const [timeRemaining, setTimeRemaining] = useState(30 * 60) // 30 minutes in seconds

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/Subject/get-all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'lang': 'uz',
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
    fetchSubjects()
  }, [token])

  // Fetch topics when subject changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedSubjectId) {
        setTopics([])
        return
      }
      try {
        const response = await fetch(
          `/api/topic/paged?SubjectId=${selectedSubjectId}&PageNumber=1&PageSize=100`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'lang': 'uz',
            },
          }
        )
        const data = await response.json()
        if (data.Succeeded && data.Result?.Values) {
          const allTopics: Topic[] = []
          data.Result.Values.forEach((group: any) => {
            if (group.Topics) {
              group.Topics.forEach((topic: any) => {
                allTopics.push({ id: topic.Id, topicName: topic.TopicName })
              })
            }
          })
          setTopics(allTopics)
        }
      } catch (error) {
        console.error('Failed to fetch topics:', error)
      }
    }
    fetchTopics()
    setSelectedTopicId('')
  }, [selectedSubjectId, token])

  // Timer
  useEffect(() => {
    if (!testSession) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinishTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testSession])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartTest = async () => {
    if (!selectedSubjectId) {
      toast.error('Iltimos, fan tanlang')
      return
    }

    setIsLoading(true)
    try {
      const requestData: any = { SubjectId: selectedSubjectId }
      if (selectedTopicId) {
        requestData.TopicId = selectedTopicId
      }
      const response = await testService.startTestMixed30(requestData)

      if (response.Succeeded && response.Result) {
        setTestSession(response.Result)
        setCurrentQuestionIndex(0)
        setSelectedAnswers(new Map())
        setTimeRemaining(30 * 60)
        toast.success('Test boshlandi!')
      } else {
        toast.error(response.Errors?.join(', ') || 'Test boshlanmadi')
      }
    } catch (error: any) {
      console.error('Failed to start test:', error)
      toast.error(error.response?.data?.Errors?.join(', ') || 'Xatolik yuz berdi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAnswer = (questionId: string, answerId: string) => {
    setSelectedAnswers((prev) => {
      const newMap = new Map(prev)
      newMap.set(questionId, answerId)
      return newMap
    })
  }

  const handleFinishTest = () => {
    toast.success('Test yakunlandi!')
    // TODO: Submit answers to backend
    setTestSession(null)
  }

  const currentQuestion: UserQuestionResponse | undefined = testSession?.UserQuestions[currentQuestionIndex]

  // Test Session UI
  if (testSession && currentQuestion) {
    return (
      <div className="min-h-screen py-4 px-2 sm:px-4">
        {/* Header */}
        <div className={`rounded-xl p-4 mb-4 flex items-center justify-between ${isDark ? 'bg-[#151515] border border-gray-700' : 'bg-white border border-gray-200 shadow'}`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTestSession(null)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              <FiX size={20} />
            </button>
            <div>
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Mixed Test - 30 savol
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Savol {currentQuestionIndex + 1} / {testSession.TotalQuestions}
              </p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
            <FiClock size={18} />
            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        {/* Question Navigation */}
        <div className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-[#151515] border border-gray-700' : 'bg-white border border-gray-200 shadow'}`}>
          <div className="flex flex-wrap gap-2">
            {testSession.UserQuestions.map((q, idx) => {
              const isAnswered = selectedAnswers.has(q.Id)
              const isCurrent = idx === currentQuestionIndex
              return (
                <button
                  key={q.Id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                    isCurrent
                      ? isDark
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-600 text-white'
                      : isAnswered
                        ? isDark
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-green-100 text-green-600'
                        : isDark
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Question Content */}
        <motion.div
          key={currentQuestion.Id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`rounded-xl p-6 ${isDark ? 'bg-[#151515] border border-gray-700' : 'bg-white border border-gray-200 shadow'}`}
        >
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentQuestion.QuestionText}
          </h3>

          <div className="space-y-3">
            {currentQuestion.UserQuestionAnswers.map((answer, idx) => {
              const isSelected = selectedAnswers.get(currentQuestion.Id) === answer.Id
              return (
                <button
                  key={answer.Id}
                  onClick={() => handleSelectAnswer(currentQuestion.Id, answer.Id)}
                  className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${
                    isSelected
                      ? isDark
                        ? 'bg-blue-500/20 border-2 border-blue-500 text-white'
                        : 'bg-blue-50 border-2 border-blue-500 text-gray-900'
                      : isDark
                        ? 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:bg-gray-800'
                        : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{answer.AnswerText}</span>
                  {isSelected && <FiCheck className="text-blue-500" size={20} />}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 ${
              isDark
                ? 'bg-gray-800 text-white hover:bg-gray-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            <FiChevronLeft size={20} />
            Oldingi
          </button>

          {currentQuestionIndex === testSession.TotalQuestions - 1 ? (
            <button
              onClick={handleFinishTest}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-green-500 text-white hover:bg-green-600 transition-all"
            >
              <FiCheck size={20} />
              Yakunlash
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(testSession.TotalQuestions - 1, prev + 1))}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Keyingi
              <FiChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Selection UI
  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={`w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}
          >
            <FiClipboard className={`w-10 h-10 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </motion.div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Test Boshlash
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Mixed Test - 30 ta savol (10 oson, 10 o'rta, 10 qiyin)
          </p>
        </div>

        {/* Selection Card */}
        <div className={`rounded-2xl p-6 ${isDark ? 'bg-[#151515] border border-gray-700' : 'bg-white border border-gray-200 shadow-lg'}`}>
          {/* Subject Selection */}
          <div className="mb-6">
            <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <FiBook size={16} />
              Fan tanlang *
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500/50'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'
              }`}
            >
              <option value="">Fan tanlang</option>
              {subjects.map((subject) => (
                <option key={subject.Id} value={subject.Id}>
                  {subject.SubjectName}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Selection */}
          <div className="mb-8">
            <label className={`flex items-center gap-2 text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <FiLayers size={16} />
              Mavzu tanlang (ixtiyoriy)
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              disabled={!selectedSubjectId}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 disabled:opacity-50 ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white focus:ring-blue-500/50'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'
              }`}
            >
              <option value="">Barcha mavzular</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.topicName}
                </option>
              ))}
            </select>
          </div>

          {/* Info Box */}
          <div className={`rounded-xl p-4 mb-6 ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
              Test haqida:
            </h4>
            <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li>- Jami 30 ta savol</li>
              <li>- 10 ta oson (Easy)</li>
              <li>- 10 ta o'rta (Medium)</li>
              <li>- 10 ta qiyin (Hard)</li>
              <li>- Vaqt: 30 daqiqa</li>
            </ul>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartTest}
            disabled={!selectedSubjectId || isLoading}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 ${
              isDark
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Yuklanmoqda...
              </>
            ) : (
              <>
                <FiPlay size={20} />
                Testni Boshlash
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
