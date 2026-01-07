import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiClipboard,
  FiPlay,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiClock,
  FiX,
  FiAward,
  FiTarget,
  FiRefreshCw,
} from 'react-icons/fi'
import { useTheme } from '@contexts/ThemeContext'
import { useAuthStore } from '@store/authStore'
import { testService } from '@api/test.service'
import { StartTestMixed30Response, FinishTestResult } from '@appTypes/test.types'
import { MathRenderer } from '@components/MathRenderer'
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
  useTheme() // Theme context available if needed
  const { token } = useAuthStore()

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
  const [isExpanded, setIsExpanded] = useState(false)

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('/api/Subject/get-all-page', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            PageNumber: 1,
            PageSize: 1000,
            Search: '',
          }),
        })
        const data = await response.json()
        if (data.Succeeded && data.Result?.Values) {
          setSubjects(data.Result.Values)
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
        // Get the question ID
        const questionId = String(q.userQuestionId || q.UserQuestionId || q.id || q.Id || '')
        const selectedIdx = selectedAnswers.get(questionId)

        console.log(`Q${qIdx}: questionId=${questionId}, selectedIdx=${selectedIdx}`)

        if (selectedIdx !== undefined) {
          const answers = q.userQuestionAnswers || q.UserQuestionAnswers || []
          const idx = parseInt(selectedIdx)
          const selectedAnswer = answers[idx]

          if (selectedAnswer) {
            // Log all fields in the answer object to find the correct field name
            console.log(`  -> Answer object keys:`, Object.keys(selectedAnswer))
            console.log(`  -> Answer object:`, selectedAnswer)

            // Try all possible field names for answer ID
            const answerId = String(
              selectedAnswer.userQuestionAnswerId ||
              selectedAnswer.UserQuestionAnswerId ||
              selectedAnswer.answerId ||
              selectedAnswer.AnswerId ||
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

  // Test Result UI - Full Screen Modal with Portal (renders outside layout)
  if (testResult) {
    const percentage = Math.round(testResult.PercentageOfCorrectAnswers)
    const isGood = percentage >= 70
    const isMedium = percentage >= 50 && percentage < 70

    return createPortal(
      <div className="fixed inset-0 z-[9999]">
        {/* Background with gradient */}
        <div className={`absolute inset-0 ${
          isGood
            ? 'bg-gradient-to-br from-green-950 via-green-900 to-emerald-950'
            : isMedium
              ? 'bg-gradient-to-br from-yellow-950 via-amber-900 to-orange-950'
              : 'bg-gradient-to-br from-red-950 via-rose-900 to-pink-950'
        }`} />

        {/* Animated circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 ${
            isGood ? 'bg-green-400' : isMedium ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
          <div className={`absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 ${
            isGood ? 'bg-emerald-400' : isMedium ? 'bg-amber-400' : 'bg-rose-400'
          }`} />
        </div>

        <div className="relative h-full flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-full max-w-lg"
          >
            {/* Main Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden shadow-2xl">
              {/* Trophy/Icon Section */}
              <div className="pt-10 pb-6 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
                  className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    isGood ? 'bg-green-500' : isMedium ? 'bg-yellow-500' : 'bg-red-500'
                  } shadow-lg`}
                >
                  <FiAward className="w-12 h-12 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {isGood ? 'Ajoyib!' : isMedium ? 'Yaxshi!' : 'Qayta urinib ko\'ring'}
                </h1>
                <p className="text-white/70">Test muvaffaqiyatli yakunlandi</p>
              </div>

              {/* Big Percentage Circle */}
              <div className="flex justify-center pb-8">
                <div className={`w-40 h-40 rounded-full border-8 flex items-center justify-center ${
                  isGood ? 'border-green-400' : isMedium ? 'border-yellow-400' : 'border-red-400'
                } bg-white/5`}>
                  <div className="text-center">
                    <span className="text-5xl font-bold text-white">{percentage}</span>
                    <span className="text-2xl text-white/70">%</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="px-6 pb-6">
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                    <p className="text-3xl font-bold text-white">{testResult.TotalQuestions}</p>
                    <p className="text-white/60 text-sm">Jami savol</p>
                  </div>
                  <div className="bg-green-500/20 backdrop-blur rounded-2xl p-4 text-center border border-green-500/30">
                    <p className="text-3xl font-bold text-green-400">{testResult.Correct}</p>
                    <p className="text-green-300/60 text-sm">To'g'ri</p>
                  </div>
                  <div className="bg-red-500/20 backdrop-blur rounded-2xl p-4 text-center border border-red-500/30">
                    <p className="text-3xl font-bold text-red-400">{testResult.Incorrect}</p>
                    <p className="text-red-300/60 text-sm">Noto'g'ri</p>
                  </div>
                </div>

                {/* Score Bar */}
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/70 flex items-center gap-2">
                      <FiTarget size={18} />
                      Ball
                    </span>
                    <span className="text-2xl font-bold text-white">
                      {testResult.TotalScore} / {testResult.TotalQuestions}
                    </span>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className={`h-full rounded-full ${
                        isGood ? 'bg-green-500' : isMedium ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={handleStartNewTest}
                  className="w-full py-4 rounded-2xl font-semibold bg-white text-gray-900 hover:bg-white/90 transition-all flex items-center justify-center gap-3 text-lg shadow-lg"
                >
                  <FiRefreshCw size={20} />
                  Yangi Test Boshlash
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>,
      document.body
    )
  }

  // Debug: Log test session structure
  if (testSession) {
    console.log('TestSession exists:', testSession)
    console.log('Questions:', questions)
    console.log('Current question:', currentQuestion)
  }

  // Test Session UI - show loading if session exists but no questions yet
  if (testSession && questions.length === 0) {
    return createPortal(
      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-[#030712]" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/70 text-lg">Savollar yuklanmoqda...</p>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // Test Session UI - Full Screen Modal with Portal (renders outside layout)
  if (testSession && currentQuestion) {
    const answeredCount = selectedAnswers.size
    const progressPercent = (answeredCount / questions.length) * 100

    return createPortal(
      <div className="fixed inset-0 z-[9999]">
        {/* Dark Background */}
        <div className="absolute inset-0 bg-[#030712]" />

        {/* Subtle decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 px-4 py-4 bg-[#0a0a0f] border-b border-gray-800/50">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                {/* Left: Exit & Progress */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setTestSession(null)}
                    className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-all"
                  >
                    <FiX size={20} />
                  </button>
                  <div>
                    <p className="text-white font-semibold text-lg">
                      Savol {currentQuestionIndex + 1} / {questions.length}
                    </p>
                    <p className="text-white/50 text-sm">{answeredCount} ta javob berildi</p>
                  </div>
                </div>

                {/* Right: Timer */}
                <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-mono text-xl font-bold ${
                  timeRemaining < 300
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                    : 'bg-gray-800/50 text-white border border-gray-700/50'
                }`}>
                  <FiClock size={22} />
                  {formatTime(timeRemaining)}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Question & Answers - Takes 2 columns on large screens */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Question Card */}
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#0f0f14] rounded-3xl p-6 border border-gray-800/50"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white text-lg flex-shrink-0 shadow-lg">
                        {currentQuestionIndex + 1}
                      </div>
                      <div className="text-xl leading-relaxed text-white pt-2">
                        <MathRenderer text={currentQuestion.questionText || currentQuestion.QuestionText} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Answers */}
                  <motion.div
                    key={`answers-${currentQuestionIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                  >
                    {(currentQuestion.userQuestionAnswers || currentQuestion.UserQuestionAnswers || []).map((answer: any, idx: number) => {
                      const questionId = String(currentQuestion.userQuestionId || currentQuestion.UserQuestionId || currentQuestion.id || currentQuestion.Id || 'q')
                      const answerText = answer.answerText || answer.AnswerText || ''
                      const isSelected = selectedAnswers.get(questionId) === String(idx)

                      return (
                        <button
                          key={idx}
                          onClick={() => handleSelectAnswer(questionId, String(idx))}
                          className={`w-full p-5 rounded-2xl text-left flex items-center gap-4 transition-all ${
                            isSelected
                              ? 'bg-blue-500/20 border-2 border-blue-500 shadow-lg shadow-blue-500/10'
                              : 'bg-[#0f0f14] border-2 border-gray-800/50 hover:bg-[#151520] hover:border-gray-700/50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-lg flex-shrink-0 transition-all ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-800 text-gray-400'
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <div className={`flex-1 text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            <MathRenderer text={answerText} />
                          </div>
                          {isSelected && (
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <FiCheck className="text-white" size={18} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </motion.div>
                </div>

                {/* Question Navigator - Right Sidebar on large screens */}
                <div className="lg:col-span-1">
                  <div className="bg-[#0f0f14] rounded-3xl p-5 border border-gray-800/50 sticky top-4">
                    <h3 className="text-gray-400 text-sm font-medium mb-4">Savollar navigatsiyasi</h3>
                    <div className="grid grid-cols-5 gap-2">
                      {questions.map((q: any, idx: number) => {
                        const qId = String(q.userQuestionId || q.UserQuestionId || q.id || q.Id || `q-${idx}`)
                        const isAnswered = selectedAnswers.has(qId)
                        const isCurrent = idx === currentQuestionIndex
                        return (
                          <button
                            key={qId}
                            onClick={() => setCurrentQuestionIndex(idx)}
                            className={`w-full aspect-square rounded-xl font-medium text-sm transition-all ${
                              isCurrent
                                ? 'bg-blue-500 text-white shadow-lg scale-110'
                                : isAnswered
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-gray-800/50 text-gray-500 hover:bg-gray-700/50 border border-gray-700/50'
                            }`}
                          >
                            {idx + 1}
                          </button>
                        )
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-4 border-t border-gray-800/50 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-4 h-4 rounded bg-blue-500" />
                        <span>Joriy savol</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
                        <span>Javob berilgan</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-4 h-4 rounded bg-gray-800/50 border border-gray-700/50" />
                        <span>Javobsiz</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-4 py-4 bg-[#0a0a0f] border-t border-gray-800/50">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all disabled:opacity-30 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/50"
              >
                <FiChevronLeft size={20} />
                Oldingi
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleFinishTest}
                  disabled={isLoading}
                  className="flex items-center gap-3 px-8 py-3 rounded-2xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 shadow-lg shadow-green-500/30"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheck size={20} />
                      Testni Yakunlash
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="flex items-center gap-3 px-8 py-3 rounded-2xl font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg shadow-blue-500/30"
                >
                  Keyingi
                  <FiChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  // Selection UI
  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl"
      >
        {/* Main Card */}
        <div
          className="rounded-2xl overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-rose-700 shadow-xl"
        >
          {/* Header */}
          <div
            className="p-6 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-white/80 text-sm font-medium">Fan va mavzulashgan test</p>
              <motion.div
                animate={{ rotate: isExpanded ? 0 : [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: isExpanded ? 0 : Infinity, repeatDelay: 3 }}
                className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"
              >
                <FiClipboard className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-1">
              Mixed Test
            </h2>
            <p className="text-white/70">30 savol • 30 daqiqa</p>
          </div>

          {/* Expandable Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6">
                  {/* Subject Selection */}
                  <div className="mb-4">
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Fan tanlang
                    </label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                    >
                      <option value="" className="text-gray-900">Fan tanlang...</option>
                      {subjects.map((subject) => (
                        <option key={subject.Id} value={subject.Id} className="text-gray-900">
                          {subject.SubjectName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Topic Selection */}
                  <div className="mb-5">
                    <label className="block text-white/80 text-sm font-medium mb-2">
                      Mavzu tanlang (ixtiyoriy)
                    </label>
                    <select
                      value={selectedTopicId}
                      onChange={(e) => setSelectedTopicId(e.target.value)}
                      disabled={!selectedSubjectId}
                      className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
                    >
                      <option value="" className="text-gray-900">Barcha mavzular</option>
                      {topics.map((topic) => (
                        <option key={topic.id} value={topic.id} className="text-gray-900">
                          {topic.topicName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Button */}
                  <button
                    type="button"
                    onClick={handleStartTest}
                    disabled={!selectedSubjectId || isLoading}
                    className="w-full py-3 rounded-xl bg-white text-red-600 font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiPlay size={18} />
                        Testni Boshlash
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
