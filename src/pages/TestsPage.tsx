import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  FiAward,
  FiTarget,
  FiXCircle,
  FiRefreshCw,
} from 'react-icons/fi'
import { useTheme } from '@contexts/ThemeContext'
import { useAuthStore } from '@store/authStore'
import { testService } from '@api/test.service'
import { StartTestMixed30Response, FinishTestResult } from '@appTypes/test.types'
import toast from 'react-hot-toast'

interface Subject {
  Id: string
  SubjectName: string
}

interface Topic {
  id: string
  topicName: string
}

// Separate component for answers to avoid re-render issues
interface AnswersListProps {
  currentQuestion: any
  selectedAnswers: Map<string, string>
  onSelectAnswer: (questionId: string, answerId: string) => void
  isDark: boolean
}

const AnswersList = ({ currentQuestion, selectedAnswers, onSelectAnswer, isDark }: AnswersListProps) => {
  // Get question index as ID (simpler and more reliable)
  const questionId = String(currentQuestion.userQuestionId || currentQuestion.UserQuestionId || currentQuestion.id || currentQuestion.Id || 'q')

  // Get answers array
  const answers = currentQuestion.userQuestionAnswers || currentQuestion.UserQuestionAnswers || []

  // Get selected answer INDEX for this question
  const selectedIndex = selectedAnswers.get(questionId)

  return (
    <div className="space-y-3">
      {answers.map((answer: any, idx: number) => {
        const answerText = answer.answerText || answer.AnswerText || ''
        // Use index for selection - simple and reliable
        const isSelected = selectedIndex === String(idx)

        return (
          <button
            key={idx}
            onClick={() => onSelectAnswer(questionId, String(idx))}
            className={`w-full p-4 rounded-xl text-left flex items-center gap-4 transition-all ${
              isSelected
                ? 'bg-blue-500/20 border-2 border-blue-500'
                : isDark
                  ? 'bg-gray-800/50 border border-gray-700 hover:bg-gray-800'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
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
            <span className={`flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {answerText}
            </span>
            {isSelected && <FiCheck className="text-blue-500" size={20} />}
          </button>
        )
      })}
    </div>
  )
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
  const [testResult, setTestResult] = useState<FinishTestResult | null>(null)

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
        console.log('Test Response:', response.Result)
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
    // Convert to strings for consistent comparison
    const qId = String(questionId)
    const aId = String(answerId)
    setSelectedAnswers((prev) => {
      const newMap = new Map(prev)
      newMap.set(qId, aId)
      return newMap
    })
  }

  const handleFinishTest = async () => {
    if (!testSession) return

    setIsLoading(true)
    try {
      const session = testSession as any

      // Debug: Show full session structure
      console.log('=== SESSION DATA ===')
      console.log('Session keys:', Object.keys(session))
      console.log('Session:', session)

      // Get TestProcessId - try all possible field names
      const testProcessId = session.id || session.Id || session.testProcessId || session.TestProcessId || ''
      console.log('TestProcessId:', testProcessId)

      // Get questions
      const questions = session.userQuestions || session.UserQuestions || []
      console.log('Questions count:', questions.length)

      // Debug first question structure
      if (questions.length > 0) {
        console.log('First question keys:', Object.keys(questions[0]))
        console.log('First question:', questions[0])

        const firstAnswers = questions[0].userQuestionAnswers || questions[0].UserQuestionAnswers || []
        if (firstAnswers.length > 0) {
          console.log('First answer keys:', Object.keys(firstAnswers[0]))
          console.log('First answer:', firstAnswers[0])
        }
      }

      // Debug selectedAnswers map
      console.log('Selected answers:', Array.from(selectedAnswers.entries()))

      // Build userQuestionFinishes
      const userQuestionFinishes: { UserQuestionId: string; MarkedAnsewrId: string }[] = []

      questions.forEach((q: any, qIdx: number) => {
        // Get the question ID we used in AnswersList
        const questionId = String(q.userQuestionId || q.UserQuestionId || q.id || q.Id || '')
        const selectedIdx = selectedAnswers.get(questionId)

        console.log(`Q${qIdx}: questionId=${questionId}, selectedIdx=${selectedIdx}`)

        if (selectedIdx !== undefined) {
          const answers = q.userQuestionAnswers || q.UserQuestionAnswers || []
          const idx = parseInt(selectedIdx)
          const selectedAnswer = answers[idx]

          if (selectedAnswer) {
            const answerId = String(
              selectedAnswer.userQuestionAnswerId ||
              selectedAnswer.UserQuestionAnswerId ||
              selectedAnswer.id ||
              selectedAnswer.Id ||
              ''
            )

            console.log(`  -> answerId=${answerId}`)

            if (questionId && answerId) {
              userQuestionFinishes.push({
                UserQuestionId: questionId,
                MarkedAnsewrId: answerId,
              })
            }
          }
        }
      })

      const requestData = {
        TestProcessId: testProcessId,
        userQuestionFinishes,
      }

      console.log('=== FINISH TEST REQUEST ===')
      console.log(JSON.stringify(requestData, null, 2))

      const response = await testService.finishTest(requestData)

      console.log('=== FINISH TEST RESPONSE ===')
      console.log(response)

      if (response.Succeeded && response.Result) {
        setTestResult(response.Result)
        setTestSession(null)
        toast.success('Test muvaffaqiyatli yakunlandi!')
      } else {
        toast.error(response.Errors?.join(', ') || 'Xatolik yuz berdi')
      }
    } catch (error: any) {
      console.error('=== FINISH TEST ERROR ===')
      console.error(error)
      console.error('Error response:', error.response?.data)
      toast.error(error.response?.data?.Errors?.join(', ') || 'Test yuborishda xatolik')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset to start new test
  const handleStartNewTest = () => {
    setTestResult(null)
    setSelectedAnswers(new Map())
    setCurrentQuestionIndex(0)
    setTimeRemaining(30 * 60)
  }

  // Handle camelCase from ASP.NET Core backend (default JSON serialization)
  const getQuestions = (session: any) => session?.userQuestions || session?.UserQuestions || []
  const questions = testSession ? getQuestions(testSession) : []
  const currentQuestion = questions[currentQuestionIndex]

  // Test Result UI
  if (testResult) {
    const percentage = testResult.PercentageOfCorrectAnswers
    const isGood = percentage >= 70
    const isMedium = percentage >= 50 && percentage < 70

    return (
      <div className="py-8 px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-2xl p-8 text-center ${isDark ? 'bg-[#151515] border border-gray-700' : 'bg-white border border-gray-200 shadow-lg'}`}
        >
          {/* Result Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isGood
                ? 'bg-green-500/20'
                : isMedium
                  ? 'bg-yellow-500/20'
                  : 'bg-red-500/20'
            }`}
          >
            <FiAward className={`w-12 h-12 ${
              isGood
                ? 'text-green-500'
                : isMedium
                  ? 'text-yellow-500'
                  : 'text-red-500'
            }`} />
          </motion.div>

          {/* Title */}
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Test yakunlandi!
          </h1>
          <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isGood ? 'Ajoyib natija!' : isMedium ? 'Yaxshi natija!' : 'Qayta urinib ko\'ring!'}
          </p>

          {/* Score Circle */}
          <div className="mb-8">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center border-4 ${
              isGood
                ? 'border-green-500'
                : isMedium
                  ? 'border-yellow-500'
                  : 'border-red-500'
            }`}>
              <span className={`text-4xl font-bold ${
                isGood
                  ? 'text-green-500'
                  : isMedium
                    ? 'text-yellow-500'
                    : 'text-red-500'
              }`}>
                {percentage}%
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <FiTarget className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {testResult.TotalQuestions}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Jami savollar</p>
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <FiCheck className={`w-6 h-6 mx-auto mb-2 text-green-500`} />
              <p className={`text-2xl font-bold text-green-500`}>
                {testResult.Correct}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>To'g'ri</p>
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <FiXCircle className={`w-6 h-6 mx-auto mb-2 text-red-500`} />
              <p className={`text-2xl font-bold text-red-500`}>
                {testResult.Incorrect}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Noto'g'ri</p>
            </div>

            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <FiAward className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {testResult.TotalScore}
              </p>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ball</p>
            </div>
          </div>

          {/* New Test Button */}
          <button
            onClick={handleStartNewTest}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
              isDark
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            <FiRefreshCw size={20} />
            Yangi Test
          </button>
        </motion.div>
      </div>
    )
  }

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
                Savol {currentQuestionIndex + 1} / {questions.length}
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
            {questions.map((q: any, idx: number) => {
              const qId = String(q.userQuestionId || q.UserQuestionId || q.id || q.Id || `q-${idx}`)
              const isAnswered = selectedAnswers.has(qId)
              const isCurrent = idx === currentQuestionIndex
              return (
                <button
                  key={qId}
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
          key={currentQuestion.userQuestionId || currentQuestion.UserQuestionId || currentQuestion.id || currentQuestion.Id || `question-${currentQuestionIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`rounded-xl p-6 ${isDark ? 'bg-[#151515] border border-gray-700' : 'bg-white border border-gray-200 shadow'}`}
        >
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentQuestion.questionText || currentQuestion.QuestionText}
          </h3>

          <AnswersList
            currentQuestion={currentQuestion}
            selectedAnswers={selectedAnswers}
            onSelectAnswer={handleSelectAnswer}
            isDark={isDark}
          />
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

          {currentQuestionIndex === questions.length - 1 ? (
            <button
              onClick={handleFinishTest}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-green-500 text-white hover:bg-green-600 transition-all"
            >
              <FiCheck size={20} />
              Yakunlash
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
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
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block"
          >
            <div className={`p-8 rounded-3xl ${isDark ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-purple-50'}`}>
              {/* Illustration */}
              <div className="text-center mb-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-8xl mb-4"
                >
                  📝
                </motion.div>
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Bilimingizni sinang!
                </h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Professional testlar bilan tayyorlaning
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`text-center p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
                  <div className={`text-3xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>10</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Oson</div>
                </div>
                <div className={`text-center p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
                  <div className={`text-3xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>10</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>O'rta</div>
                </div>
                <div className={`text-center p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
                  <div className={`text-3xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>10</div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Qiyin</div>
                </div>
              </div>

              {/* Features */}
              <div className="mt-8 space-y-3">
                {[
                  { icon: '⏱️', text: '30 daqiqa vaqt' },
                  { icon: '📊', text: 'Batafsil tahlil' },
                  { icon: '🎯', text: 'Aniq natija' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/80'}`}>
                    <span className="text-xl">{item.icon}</span>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={`rounded-3xl p-8 ${isDark ? 'bg-[#151515] border border-gray-800' : 'bg-white shadow-xl'}`}>
              {/* Header */}
              <div className="text-center mb-8">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <FiClipboard className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Test Boshlash
                </h1>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Fan va mavzuni tanlang
                </p>
              </div>

              {/* Subject Selection */}
              <div className="mb-5">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fan tanlang
                </label>
                <div className="relative">
                  <FiBook className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border appearance-none cursor-pointer focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-[#1a1a1a] border-gray-700 text-white focus:ring-blue-500/50'
                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Fan tanlang...</option>
                    {subjects.map((subject) => (
                      <option key={subject.Id} value={subject.Id}>
                        {subject.SubjectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Topic Selection */}
              <div className="mb-8">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Mavzu (ixtiyoriy)
                </label>
                <div className="relative">
                  <FiLayers className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                  <select
                    value={selectedTopicId}
                    onChange={(e) => setSelectedTopicId(e.target.value)}
                    disabled={!selectedSubjectId}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl border appearance-none cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-[#1a1a1a] border-gray-700 text-white focus:ring-blue-500/50'
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
              </div>

              {/* Mobile Info */}
              <div className={`lg:hidden rounded-xl p-4 mb-6 ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>30 savol</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>•</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>30 daqiqa</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>•</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Mixed</span>
                </div>
              </div>

              {/* Start Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartTest}
                disabled={!selectedSubjectId || isLoading}
                className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
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
              </motion.button>

              {/* Hint */}
              <p className={`text-center text-xs mt-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                Testni boshlash uchun fanni tanlash shart
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
