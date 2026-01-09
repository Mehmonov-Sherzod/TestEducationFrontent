import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import {
  FiPlay,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiClock,
  FiX,
  FiAward,
  FiRefreshCw,
  FiBookOpen,
  FiSun,
  FiMoon,
} from 'react-icons/fi'
import { BsCalculator } from 'react-icons/bs'
import { useTheme } from '@contexts/ThemeContext'
import { useAuthStore } from '@store/authStore'
import { MathRenderer } from '@components/MathRenderer'
import toast from 'react-hot-toast'

interface Subject {
  Id: string
  SubjectName: string
}

interface DTMTestResponse {
  userTestId: string
  questions: DTMQuestion[]
}

interface DTMQuestion {
  userQuestionId: string
  questionText: string
  questionImageUrl?: string
  subjectName: string
  userQuestionAnswers: DTMAnswer[]
}

interface DTMAnswer {
  answerId: string
  answerText: string
}

interface FinishTestResult {
  correctAnswers: number
  wrongAnswers: number
  totalQuestions: number
  score: number
}

export const DTMTestPage = () => {
  const { theme, setTheme } = useTheme()
  const { token } = useAuthStore()
  const isDark = theme === 'dark'

  // State
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const testDuration = 180 // 3 hours in minutes

  // Test session state
  const [testSession, setTestSession] = useState<DTMTestResponse | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string>>(new Map())
  const [timeRemaining, setTimeRemaining] = useState(180 * 60) // seconds
  const [testResult, setTestResult] = useState<FinishTestResult | null>(null)

  // Calculator state
  const [showCalculator, setShowCalculator] = useState(false)
  const [calcDisplay, setCalcDisplay] = useState('0')
  const [calcPrevValue, setCalcPrevValue] = useState<number | null>(null)
  const [calcOperator, setCalcOperator] = useState<string | null>(null)
  const [calcWaitingForOperand, setCalcWaitingForOperand] = useState(false)

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const handleCalcNumber = (num: string) => {
    if (calcWaitingForOperand) {
      setCalcDisplay(num)
      setCalcWaitingForOperand(false)
    } else {
      setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num)
    }
  }

  const handleCalcOperator = (op: string) => {
    const currentValue = parseFloat(calcDisplay)
    if (calcPrevValue === null) {
      setCalcPrevValue(currentValue)
    } else if (calcOperator) {
      const result = calculate(calcPrevValue, currentValue, calcOperator)
      setCalcDisplay(String(result))
      setCalcPrevValue(result)
    }
    setCalcWaitingForOperand(true)
    setCalcOperator(op)
  }

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : 0
      default: return b
    }
  }

  const handleCalcEquals = () => {
    if (calcOperator && calcPrevValue !== null) {
      const currentValue = parseFloat(calcDisplay)
      const result = calculate(calcPrevValue, currentValue, calcOperator)
      setCalcDisplay(String(result))
      setCalcPrevValue(null)
      setCalcOperator(null)
      setCalcWaitingForOperand(true)
    }
  }

  const handleCalcClear = () => {
    setCalcDisplay('0')
    setCalcPrevValue(null)
    setCalcOperator(null)
    setCalcWaitingForOperand(false)
  }

  const handleCalcDecimal = () => {
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.')
    }
  }

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

  // Timer
  useEffect(() => {
    if (!testSession || testResult) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleFinishTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testSession, testResult])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleSubjectSelection = (subjectId: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subjectId)) {
        return prev.filter((id) => id !== subjectId)
      }
      if (prev.length >= 2) {
        toast.error('Faqat 2 ta asosiy fan tanlash mumkin')
        return prev
      }
      return [...prev, subjectId]
    })
  }

  const handleStartTest = async () => {
    if (selectedSubjects.length !== 2) {
      toast.error('Iltimos, 2 ta asosiy fan tanlang')
      return
    }

    setIsLoading(true)
    try {
      const now = new Date()
      const endTime = new Date(now.getTime() + testDuration * 60 * 1000)

      const requestBody = {
        SubjectId: selectedSubjects,
        StartTime: now.toISOString(),
        EndTime: endTime.toISOString(),
      }

      console.log('=== DTM REQUEST ===')
      console.log('Request body:', JSON.stringify(requestBody, null, 2))

      const response = await fetch('/api/StartTest/start-dtm-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log('=== DTM RESPONSE ===')
      console.log('Full response:', JSON.stringify(data, null, 2))

      // Har bir fan uchun savol sonini ko'rsatish
      if (data.Result?.Subjects) {
        console.log('=== SUBJECTS BREAKDOWN ===')
        data.Result.Subjects.forEach((s: any) => {
          console.log(`${s.SubjectName}: ${s.UserQuestions?.length || 0} ta savol`)
        })
      }

      if (data.Succeeded && data.Result) {
        const result = data.Result

        // Savollar Subjects ichida - har bir fanning UserQuestions'ini yig'amiz
        const allQuestions: DTMQuestion[] = []

        if (result.Subjects && Array.isArray(result.Subjects)) {
          result.Subjects.forEach((subject: any) => {
            const subjectName = subject.SubjectName || ''
            const questions = subject.UserQuestions || []

            questions.forEach((q: any) => {
              allQuestions.push({
                userQuestionId: q.UserQuestionId,
                questionText: q.QuestionText,
                questionImageUrl: q.QuestionImageUrl,
                subjectName: subjectName,
                userQuestionAnswers: (q.UserQuestionAnswers || []).map((a: any) => ({
                  answerId: a.UserQuestionAnswerId,
                  answerText: a.AnswerText,
                })),
              })
            })
          })
        }

        console.log('Total questions collected:', allQuestions.length)

        const mappedSession: DTMTestResponse = {
          userTestId: result.Id,
          questions: allQuestions,
        }

        setTestSession(mappedSession)
        setTimeRemaining(testDuration * 60)
        setCurrentQuestionIndex(0)
        setSelectedAnswers(new Map())
        toast.success('DTM test boshlandi!')
      } else {
        const errorMessage = data.Errors?.join(', ') || 'Test boshlashda xatolik'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Failed to start DTM test:', error)
      toast.error('Test boshlashda xatolik yuz berdi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAnswer = (questionId: string, answerIndex: string) => {
    setSelectedAnswers((prev) => {
      const newMap = new Map(prev)
      newMap.set(questionId, answerIndex)
      return newMap
    })
  }

  const handleFinishTest = async () => {
    if (!testSession) return

    try {
      const answers = testSession.questions.map((q) => {
        const selectedIndex = selectedAnswers.get(q.userQuestionId)
        const selectedAnswer = selectedIndex !== undefined
          ? q.userQuestionAnswers[parseInt(selectedIndex)]
          : null

        return {
          UserQuestionId: q.userQuestionId,
          UserQuestionAnswerId: selectedAnswer?.answerId || null,
        }
      })

      const response = await fetch('/api/StartTest/finish-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          UserTestId: testSession.userTestId,
          Answers: answers,
        }),
      })

      const data = await response.json()
      console.log('Finish test response:', data)

      if (data.Succeeded && data.Result) {
        const r = data.Result
        // Map PascalCase to camelCase
        const mappedResult: FinishTestResult = {
          correctAnswers: r.CorrectAnswers ?? r.correctAnswers ?? 0,
          wrongAnswers: r.WrongAnswers ?? r.wrongAnswers ?? 0,
          totalQuestions: r.TotalQuestions ?? r.totalQuestions ?? 0,
          score: r.Score ?? r.score ?? 0,
        }
        setTestResult(mappedResult)
        toast.success('Test yakunlandi!')
      } else {
        toast.error('Testni yakunlashda xatolik')
      }
    } catch (error) {
      console.error('Failed to finish test:', error)
      toast.error('Xatolik yuz berdi')
    }
  }

  const handleCloseTest = () => {
    setTestSession(null)
    setTestResult(null)
    setSelectedAnswers(new Map())
    setCurrentQuestionIndex(0)
    setSelectedSubjects([])
  }

  // Test Session UI
  if (testSession) {
    const currentQuestion = testSession.questions[currentQuestionIndex]
    const totalQuestions = testSession.questions.length
    const answeredCount = selectedAnswers.size

    // Show result
    if (testResult) {
      return createPortal(
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 ${
          isDark ? 'bg-[#030712]' : 'bg-gray-100'
        }`}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-lg rounded-2xl p-8 ${
              isDark ? 'bg-[#0a0a0a] border border-gray-800' : 'bg-white shadow-xl'
            }`}
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto mb-4">
                <FiAward className="text-white" size={40} />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                DTM Test yakunlandi!
              </h2>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Natijalaringiz</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className={`rounded-xl p-4 text-center ${
                isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
              }`}>
                <p className="text-3xl font-bold text-green-500">{testResult.correctAnswers}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>To'g'ri</p>
              </div>
              <div className={`rounded-xl p-4 text-center ${
                isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
              }`}>
                <p className="text-3xl font-bold text-red-500">{testResult.wrongAnswers}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Noto'g'ri</p>
              </div>
            </div>

            <div className={`rounded-xl p-6 text-center mb-6 ${
              isDark ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
            }`}>
              <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Umumiy ball</p>
              <p className="text-4xl font-bold text-blue-500">{testResult.score}%</p>
            </div>

            <button
              onClick={handleCloseTest}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
            >
              Yopish
            </button>
          </motion.div>
        </div>,
        document.body
      )
    }

    // Test questions UI
    return createPortal(
      <div className={`fixed inset-0 z-[9999] flex flex-col ${isDark ? 'bg-[#0a0f1a]' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-3 border-b ${
          isDark ? 'bg-[#0d1321] border-gray-800/50' : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-6">
            <div>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>DTM Test</h1>
              <p className="text-sm text-blue-500">{currentQuestion?.subjectName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl ${
              timeRemaining < 300
                ? 'bg-red-500/10 border border-red-500/30 text-red-500'
                : isDark
                  ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                  : 'bg-blue-50 border border-blue-200 text-blue-600'
            }`}>
              <FiClock size={18} />
              <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
            </div>
            <div className={`px-5 py-2.5 rounded-xl ${
              isDark ? 'bg-gray-800/50 border border-gray-700/50' : 'bg-gray-100 border border-gray-200'
            }`}>
              <span className="text-green-500 font-semibold">{answeredCount}</span>
              <span className={`mx-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>/</span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{totalQuestions}</span>
            </div>
            {/* Calculator button */}
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={`p-2.5 rounded-xl transition-colors ${
                showCalculator
                  ? 'bg-purple-500 text-white'
                  : isDark
                    ? 'bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400'
                    : 'bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-600'
              }`}
              title="Kalkulyator"
            >
              <BsCalculator size={20} />
            </button>
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-colors ${
                isDark
                  ? 'bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600'
              }`}
              title={isDark ? 'Light rejim' : 'Dark rejim'}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button
              onClick={handleCloseTest}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl transition-colors"
            >
              <FiX size={18} />
              <span className="font-medium">Chiqish</span>
            </button>
          </div>
        </div>

        {/* Floating Calculator */}
        {showCalculator && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className={`fixed top-20 right-6 z-[10000] w-64 rounded-3xl overflow-hidden shadow-2xl ${
              isDark ? 'bg-gradient-to-b from-[#1a1a2e] to-[#16213e]' : 'bg-gradient-to-b from-gray-100 to-white'
            }`}
            style={{ boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-2 ${
              isDark ? 'bg-[#0f0f23]' : 'bg-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <BsCalculator className={isDark ? 'text-purple-400' : 'text-purple-600'} size={16} />
                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Kalkulyator</span>
              </div>
              <button
                onClick={() => setShowCalculator(false)}
                className={`p-1 rounded-full transition-colors ${
                  isDark ? 'hover:bg-red-500/20 text-gray-500 hover:text-red-400' : 'hover:bg-red-100 text-gray-400 hover:text-red-500'
                }`}
              >
                <FiX size={14} />
              </button>
            </div>

            {/* Display */}
            <div className={`px-4 py-4 ${isDark ? 'bg-[#0f0f23]/50' : 'bg-white'}`}>
              <div className={`text-right text-3xl font-light tracking-wide truncate ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {calcDisplay}
              </div>
              {calcOperator && (
                <div className={`text-right text-sm mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {calcPrevValue} {calcOperator}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="p-3 grid grid-cols-4 gap-2">
              {/* Row 1 */}
              <button onClick={handleCalcClear} className={`p-3 rounded-xl font-medium text-red-400 transition-all hover:scale-105 ${
                isDark ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-red-50 hover:bg-red-100'
              }`}>C</button>
              <button onClick={() => handleCalcOperator('÷')} className={`p-3 rounded-xl font-medium transition-all hover:scale-105 ${
                isDark ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400' : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
              }`}>÷</button>
              <button onClick={() => handleCalcOperator('×')} className={`p-3 rounded-xl font-medium transition-all hover:scale-105 ${
                isDark ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400' : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
              }`}>×</button>
              <button onClick={() => setCalcDisplay(calcDisplay.length > 1 ? calcDisplay.slice(0, -1) : '0')} className={`p-3 rounded-xl font-medium transition-all hover:scale-105 ${
                isDark ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400' : 'bg-orange-50 hover:bg-orange-100 text-orange-600'
              }`}>⌫</button>

              {/* Row 2 */}
              {['7', '8', '9'].map((n) => (
                <button key={n} onClick={() => handleCalcNumber(n)} className={`p-3 rounded-xl font-medium transition-all hover:scale-105 ${
                  isDark ? 'bg-[#1e1e3f] hover:bg-[#2a2a4a] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}>{n}</button>
              ))}
              <button onClick={() => handleCalcOperator('-')} className={`p-3 rounded-xl font-medium transition-all hover:scale-105 ${
                isDark ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400' : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
              }`}>−</button>

              {/* Row 3 */}
              {['4', '5', '6'].map((n) => (
                <button key={n} onClick={() => handleCalcNumber(n)} className={`p-3 rounded-xl font-medium transition-all hover:scale-105 ${
                  isDark ? 'bg-[#1e1e3f] hover:bg-[#2a2a4a] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}>{n}</button>
              ))}
              <button onClick={() => handleCalcOperator('+')} className={`p-3 rounded-xl font-medium transition-all hover:scale-105 ${
                isDark ? 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400' : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
              }`}>+</button>

              {/* Row 4 */}
              {['1', '2', '3'].map((n) => (
                <button key={n} onClick={() => handleCalcNumber(n)} className={`p-3 rounded-xl font-medium transition-all hover:scale-105 ${
                  isDark ? 'bg-[#1e1e3f] hover:bg-[#2a2a4a] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}>{n}</button>
              ))}
              <button onClick={handleCalcEquals} className="p-3 rounded-xl font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 row-span-2">=</button>

              {/* Row 5 */}
              <button onClick={() => handleCalcNumber('0')} className={`p-3 rounded-xl font-medium col-span-2 transition-all hover:scale-105 ${
                isDark ? 'bg-[#1e1e3f] hover:bg-[#2a2a4a] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}>0</button>
              <button onClick={handleCalcDecimal} className={`p-3 rounded-xl font-medium transition-all hover:scale-105 ${
                isDark ? 'bg-[#1e1e3f] hover:bg-[#2a2a4a] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}>.</button>
            </div>
          </motion.div>
        )}

        {/* Main content with sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar - Question numbers grouped by subject */}
          <div className={`w-72 border-r overflow-y-auto p-4 ${
            isDark ? 'bg-[#0d1321] border-gray-800/50' : 'bg-white border-gray-200'
          }`}>
            {(() => {
              // Group questions by subject
              const groupedQuestions: { [key: string]: { question: DTMQuestion; globalIndex: number }[] } = {}
              testSession.questions.forEach((q, idx) => {
                const subjectName = q.subjectName || 'Boshqa'
                if (!groupedQuestions[subjectName]) {
                  groupedQuestions[subjectName] = []
                }
                groupedQuestions[subjectName].push({ question: q, globalIndex: idx })
              })

              return Object.entries(groupedQuestions).map(([subjectName, questions]) => {
                const answeredCount = questions.filter(q => selectedAnswers.has(q.question.userQuestionId)).length
                const totalCount = questions.length

                return (
                <div key={subjectName} className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'text-blue-400' : 'text-blue-600'
                    }`}>{subjectName}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      answeredCount === totalCount
                        ? 'bg-green-500/20 text-green-500'
                        : answeredCount > 0
                          ? isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                          : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {answeredCount}/{totalCount}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {questions.map(({ question, globalIndex }) => (
                      <button
                        key={globalIndex}
                        onClick={() => setCurrentQuestionIndex(globalIndex)}
                        className={`w-9 h-9 rounded-lg text-xs font-semibold transition-all ${
                          globalIndex === currentQuestionIndex
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                            : selectedAnswers.has(question.userQuestionId)
                              ? 'bg-green-500/20 text-green-500 border border-green-500/40'
                              : isDark
                                ? 'bg-[#1a2234] text-gray-400 hover:bg-[#222d42]'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        {globalIndex + 1}
                      </button>
                    ))}
                  </div>
                </div>
                )
              })
            })()}
          </div>

          {/* Question content */}
          <div className="flex-1 overflow-auto p-6 lg:p-10">
            <div className="max-w-2xl mx-auto">
              {/* Question Card */}
              <div className={`rounded-3xl p-6 lg:p-8 mb-6 ${
                isDark
                  ? 'bg-gradient-to-br from-[#12192b] to-[#0d1321] border border-gray-800/50'
                  : 'bg-white shadow-xl shadow-gray-200/50 border border-gray-100'
              }`}>
                {/* Question Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className={`px-4 py-2 rounded-2xl text-sm font-bold ${
                    isDark
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  }`}>
                    {currentQuestionIndex + 1} / {totalQuestions}
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                    isDark
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                  }`}>
                    {currentQuestion?.subjectName}
                  </div>
                </div>

                {/* Question Text */}
                <div className={`text-lg lg:text-xl leading-relaxed ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                  <MathRenderer text={currentQuestion?.questionText || ''} />
                </div>
              </div>

              {/* Answers */}
              <div className="space-y-3">
                {currentQuestion?.userQuestionAnswers?.map((answer: DTMAnswer, idx: number) => {
                  const isSelected = selectedAnswers.get(currentQuestion.userQuestionId) === String(idx)
                  const letterColors = [
                    { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-500' },
                    { bg: 'from-violet-500 to-purple-600', light: 'bg-violet-500' },
                    { bg: 'from-emerald-500 to-green-600', light: 'bg-emerald-500' },
                    { bg: 'from-amber-500 to-orange-600', light: 'bg-amber-500' },
                  ]
                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleSelectAnswer(currentQuestion.userQuestionId, String(idx))}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full p-4 lg:p-5 rounded-2xl text-left flex items-center gap-4 transition-all duration-200 ${
                        isSelected
                          ? isDark
                            ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-2 border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-lg shadow-blue-100'
                          : isDark
                            ? 'bg-[#111827]/80 border border-gray-700/50 hover:border-gray-600 hover:bg-[#1a2332]'
                            : 'bg-white border-2 border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md'
                          : isDark
                            ? `bg-gradient-to-br ${letterColors[idx].bg} text-white/90`
                            : `${letterColors[idx].light} text-white shadow-sm`
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`flex-1 text-base ${
                        isSelected
                          ? isDark ? 'text-white font-medium' : 'text-blue-900 font-medium'
                          : isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <MathRenderer text={answer.answerText} />
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : isDark
                            ? 'border-gray-600'
                            : 'border-gray-300'
                      }`}>
                        {isSelected && <FiCheck className="text-white" size={14} />}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Navigation - Centered 3 buttons */}
        <div className={`flex items-center justify-center gap-4 px-6 py-4 border-t ${
          isDark ? 'bg-[#0d1321] border-gray-800/50' : 'bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg'
        }`}>
          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-[#1a2234] hover:bg-[#222d42] text-white border border-gray-700/50'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-md hover:shadow-lg'
            }`}
          >
            <FiChevronLeft size={20} />
            <span className="font-medium">Oldingi</span>
          </button>

          <button
            onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
              isDark
                ? 'bg-gray-600/50 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600/50'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 border border-gray-200 shadow-md'
            }`}
          >
            <span className="font-medium">O'tkazib yuborish</span>
          </button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleFinishTest}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
                isDark
                  ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-300'
              }`}
            >
              <FiCheck size={20} />
              Yakunlash
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                isDark
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-300'
              }`}
            >
              <span>Keyingi</span>
              <FiChevronRight size={20} />
            </button>
          )}
        </div>
      </div>,
      document.body
    )
  }

  // Subject selection UI
  return (
    <div className="p-4 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            DTM Test
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Davlat Test Markazi formati
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-[#111] border border-gray-800' : 'bg-white border border-gray-200'}`}>
          <FiClock className={isDark ? 'text-gray-400' : 'text-gray-500'} size={18} />
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>3:00</span>
          <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>soat</span>
        </div>
      </div>

      {/* DTM haqida ma'lumot */}
      <div className={`p-4 rounded-2xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <FiBookOpen className="text-blue-500" size={20} />
          </div>
          <div>
            <h3 className={`font-semibold mb-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>DTM testi haqida</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              DTM (Davlat Test Markazi) testi oliy ta'lim muassasalariga kirish uchun o'tkaziladigan rasmiy test hisoblanadi.
              Test 90 ta savoldan iborat: 2 ta asosiy fan (har biridan 30 ta savol) va 3 ta majburiy fan (har biridan 10 ta savol).
              Testni yechish uchun 3 soat vaqt beriladi.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#111] border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Jami savollar</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>90</p>
        </div>
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#111] border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Maksimal ball</p>
          <p className={`text-3xl font-bold text-green-500`}>189</p>
        </div>
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#111] border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Asosiy fanlar</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>2</p>
        </div>
        <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#111] border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Majburiy fanlar</p>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>3</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Ball tizimi */}
        <div className={`lg:col-span-1 rounded-2xl ${isDark ? 'bg-[#111] border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className={`px-5 py-4 border-b ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Ball tizimi</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* Asosiy fanlar */}
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                Asosiy fanlar
              </p>
              <div className="space-y-2">
                <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>1-fan × 30</span>
                  <span className="font-bold text-purple-500">3.1 ball</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>2-fan × 30</span>
                  <span className="font-bold text-purple-500">2.1 ball</span>
                </div>
              </div>
            </div>

            {/* Majburiy fanlar */}
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Majburiy fanlar
              </p>
              <div className="space-y-2">
                <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Ona tili × 10</span>
                  <span className="font-bold text-blue-500">1.1 ball</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Matematika × 10</span>
                  <span className="font-bold text-blue-500">1.1 ball</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Tarix × 10</span>
                  <span className="font-bold text-blue-500">1.1 ball</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className={`pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Jami ball:</span>
                <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>189</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Fan tanlash */}
        <div className={`lg:col-span-2 rounded-2xl ${isDark ? 'bg-[#111] border border-gray-800' : 'bg-white border border-gray-200 shadow-sm'}`}>
          <div className={`px-5 py-4 border-b flex items-center justify-between ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
            <div>
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Asosiy fanlarni tanlang</h2>
              <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>2 ta fan tanlang</p>
            </div>
            <div className={`px-4 py-2 rounded-xl font-bold ${
              selectedSubjects.length === 2
                ? 'bg-green-500/20 text-green-500'
                : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
            }`}>
              {selectedSubjects.length} / 2
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects
                .filter((s) => {
                  return !s.SubjectName.toLowerCase().startsWith('majburiy')
                })
                .map((subject) => {
                const isSelected = selectedSubjects.includes(subject.Id)
                const selectionIndex = selectedSubjects.indexOf(subject.Id)
                return (
                  <button
                    key={subject.Id}
                    onClick={() => toggleSubjectSelection(subject.Id)}
                    className={`relative p-4 rounded-xl text-left transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-purple-500/20 border-2 border-purple-500'
                          : 'bg-purple-50 border-2 border-purple-500'
                        : isDark
                          ? 'bg-[#0a0a0a] border border-gray-800 hover:border-gray-700'
                          : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                        {selectionIndex + 1}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-purple-500 text-white'
                          : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isSelected ? <FiCheck size={20} /> : <FiBookOpen size={18} />}
                      </div>
                      <div>
                        <p className={`font-medium ${isSelected ? 'text-purple-500' : isDark ? 'text-white' : 'text-gray-800'}`}>
                          {subject.SubjectName}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {isSelected ? `${selectionIndex === 0 ? '3.1' : '2.1'} ball / savol` : '30 savol'}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Selected subjects */}
            {selectedSubjects.length > 0 && (
              <div className={`mt-5 p-4 rounded-xl ${isDark ? 'bg-[#0a0a0a] border border-gray-800' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tanlangan:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map((id, index) => {
                    const subject = subjects.find((s) => s.Id === id)
                    return (
                      <span
                        key={id}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                          isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                        }`}
                      >
                        <span className="font-bold">{index + 1}.</span>
                        {subject?.SubjectName}
                        <span className={isDark ? 'text-purple-500' : 'text-purple-400'}>
                          ({index === 0 ? '3.1' : '2.1'})
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSubjectSelection(id)
                          }}
                          className="hover:text-red-400 ml-1"
                        >
                          <FiX size={14} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Start button */}
            <div className="mt-6">
              <button
                onClick={handleStartTest}
                disabled={isLoading || selectedSubjects.length !== 2}
                className={`w-full py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all ${
                  selectedSubjects.length === 2
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : isDark
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <>
                    <FiRefreshCw className="animate-spin" size={20} />
                    Yuklanmoqda...
                  </>
                ) : (
                  <>
                    <FiPlay size={20} />
                    Testni boshlash
                  </>
                )}
              </button>
              {selectedSubjects.length !== 2 && (
                <p className={`mt-3 text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  2 ta asosiy fan tanlang
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
