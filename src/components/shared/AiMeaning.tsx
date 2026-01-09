import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiZap, FiLoader, FiAlertCircle, FiCheck, FiX, FiRefreshCw, FiArrowRight } from 'react-icons/fi'
import { useTheme } from '@contexts/ThemeContext'
import { aiService, AiQuestion } from '@api/ai.service'
import toast from 'react-hot-toast'

interface AiMeaningProps {
  className?: string
}

interface UserAnswer {
  questionId: number
  selectedIndex: number
  isCorrect: boolean
}

export const AiMeaning = ({ className = "" }: AiMeaningProps) => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [inputText, setInputText] = useState('')
  const [meaning, setMeaning] = useState('')
  const [questions, setQuestions] = useState<AiQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [step, setStep] = useState<'input' | 'questions' | 'results'>('input')
  const [showCorrect, setShowCorrect] = useState(false)

  const optionLabels = ['A', 'B', 'C', 'D']

  const isErrorMessage = (text: string): boolean => {
    const errorKeywords = ['xatolik', 'ulanib bo\'lmadi', 'serveriga', 'vaqti tugadi', 'Ollama']
    return errorKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))
  }

  const handleGenerateQuiz = async () => {
    if (!inputText.trim()) {
      toast.error("Matn kiriting")
      return
    }

    if (inputText.length > 3000) {
      toast.error("Matn 3000 belgidan oshmasligi kerak")
      return
    }

    setIsLoading(true)
    setIsError(false)

    try {
      const response = await aiService.generateQuiz(inputText, 10)
      if (response.Succeeded && response.Result) {
        setMeaning(response.Result.Meaning)
        setQuestions(response.Result.Questions)

        if (isErrorMessage(response.Result.Meaning)) {
          setIsError(true)
          toast.error("AI xizmati bilan muammo bor")
        } else if (response.Result.Questions.length > 0) {
          setStep('questions')
          setCurrentQuestionIndex(0)
          setAnswers([])
          setSelectedOption(null)
          setShowCorrect(false)
          toast.success(`${response.Result.Questions.length} ta savol yaratildi`)
        } else {
          toast.error("Savollar yaratilmadi")
        }
      } else {
        toast.error("Xatolik yuz berdi")
        setIsError(true)
      }
    } catch {
      toast.error("Server bilan aloqa yo'q")
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectOption = (index: number) => {
    if (showCorrect) return
    setSelectedOption(index)
  }

  const handleSubmitAnswer = () => {
    if (selectedOption === null) {
      toast.error("Javob tanlang")
      return
    }

    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = selectedOption === currentQuestion.CorrectIndex

    setAnswers(prev => [...prev, {
      questionId: currentQuestion.Id,
      selectedIndex: selectedOption,
      isCorrect
    }])

    setShowCorrect(true)

    if (isCorrect) {
      toast.success("To'g'ri!")
    } else {
      toast.error("Noto'g'ri!")
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowCorrect(false)
    } else {
      setStep('results')
    }
  }

  const handleReset = () => {
    setStep('input')
    setInputText('')
    setMeaning('')
    setQuestions([])
    setCurrentQuestionIndex(0)
    setSelectedOption(null)
    setAnswers([])
    setIsError(false)
    setShowCorrect(false)
  }

  const correctCount = answers.filter(a => a.isCorrect).length
  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className={`${className}`}>
      <div className={`rounded-2xl overflow-hidden ${
        isDark ? 'bg-[#111] border border-gray-800' : 'bg-white border border-gray-200 shadow-lg'
      }`}>
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-gray-800 bg-gradient-to-r from-purple-500/10 to-blue-500/10' : 'border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <FiZap className="text-purple-500" size={20} />
            </div>
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>AI Test</h3>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {step === 'input' && 'Matn kiriting va test oling'}
                {step === 'questions' && `Savol ${currentQuestionIndex + 1}/${questions.length}`}
                {step === 'results' && 'Natijalar'}
              </p>
            </div>
          </div>
          {step !== 'input' && (
            <button
              onClick={handleReset}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <FiRefreshCw size={14} />
              Qayta
            </button>
          )}
        </div>

        {/* Input Step */}
        {step === 'input' && (
          <div className="p-5">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Matn kiriting..."
              rows={5}
              className={`w-full p-4 rounded-xl resize-none transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#0a0a0a] border border-gray-800 text-white placeholder-gray-600 focus:ring-purple-500/50'
                  : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-purple-500/50'
              }`}
            />

            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                {inputText.length}/3000
              </span>
              <button
                onClick={handleGenerateQuiz}
                disabled={isLoading || !inputText.trim()}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white'
                    : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-md'
                }`}
              >
                {isLoading ? (
                  <>
                    <FiLoader className="animate-spin" size={18} />
                    <span>Test yaratilmoqda...</span>
                  </>
                ) : (
                  <>
                    <FiSend size={18} />
                    <span>Test yaratish</span>
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {meaning && isError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`mt-4 p-4 rounded-xl ${
                    isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-red-500 mb-2">
                    <FiAlertCircle size={16} />
                    <span className="font-medium">Xatolik</span>
                  </div>
                  <p className={isDark ? 'text-red-300' : 'text-red-700'}>{meaning}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Questions Step */}
        {step === 'questions' && currentQuestion && (
          <div className="p-5">
            {/* Meaning */}
            {meaning && !isErrorMessage(meaning) && (
              <div className={`p-4 rounded-xl mb-4 ${
                isDark ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-xs font-medium mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Matn ma'nosi:</p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{meaning}</p>
              </div>
            )}

            {/* Progress */}
            <div className="flex gap-1 mb-4">
              {questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    idx < currentQuestionIndex
                      ? answers[idx]?.isCorrect
                        ? 'bg-green-500'
                        : 'bg-red-500'
                      : idx === currentQuestionIndex
                        ? isDark ? 'bg-purple-500' : 'bg-purple-400'
                        : isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Question */}
            <div className={`p-4 rounded-xl mb-4 ${
              isDark ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-purple-50 border border-purple-200'
            }`}>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {currentQuestion.Question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-4">
              {currentQuestion.Options.map((option, idx) => {
                const isSelected = selectedOption === idx
                const isCorrectOption = idx === currentQuestion.CorrectIndex
                const showAsCorrect = showCorrect && isCorrectOption
                const showAsWrong = showCorrect && isSelected && !isCorrectOption

                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    whileHover={!showCorrect ? { scale: 1.01 } : {}}
                    whileTap={!showCorrect ? { scale: 0.99 } : {}}
                    disabled={showCorrect}
                    className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
                      showAsCorrect
                        ? isDark
                          ? 'bg-green-500/20 border-2 border-green-500'
                          : 'bg-green-50 border-2 border-green-500'
                        : showAsWrong
                          ? isDark
                            ? 'bg-red-500/20 border-2 border-red-500'
                            : 'bg-red-50 border-2 border-red-500'
                          : isSelected
                            ? isDark
                              ? 'bg-purple-500/20 border-2 border-purple-500'
                              : 'bg-purple-50 border-2 border-purple-500'
                            : isDark
                              ? 'bg-[#0a0a0a] border border-gray-800 hover:border-gray-600'
                              : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      showAsCorrect
                        ? 'bg-green-500 text-white'
                        : showAsWrong
                          ? 'bg-red-500 text-white'
                          : isSelected
                            ? 'bg-purple-500 text-white'
                            : isDark
                              ? 'bg-gray-800 text-gray-400'
                              : 'bg-gray-100 text-gray-600'
                    }`}>
                      {showAsCorrect ? <FiCheck size={18} /> : showAsWrong ? <FiX size={18} /> : optionLabels[idx]}
                    </div>
                    <span className={`flex-1 ${
                      showAsCorrect
                        ? 'text-green-600 font-medium'
                        : showAsWrong
                          ? 'text-red-600'
                          : isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {option}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {/* Action Button */}
            <div className="flex justify-end">
              {!showCorrect ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-md'
                  }`}
                >
                  <FiCheck size={18} />
                  Tekshirish
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md'
                  }`}
                >
                  {currentQuestionIndex < questions.length - 1 ? (
                    <>
                      Keyingi
                      <FiArrowRight size={18} />
                    </>
                  ) : (
                    <>
                      Natijalar
                      <FiArrowRight size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && (
          <div className="p-5">
            {/* Score */}
            <div className={`text-center p-6 rounded-xl mb-4 ${
              isDark ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20' : 'bg-gradient-to-r from-purple-50 to-blue-50'
            }`}>
              <p className={`text-6xl font-bold mb-2 ${
                correctCount >= 7 ? 'text-green-500' : correctCount >= 4 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {correctCount}/{questions.length}
              </p>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {correctCount >= 7 ? 'Ajoyib natija!' : correctCount >= 4 ? 'Yaxshi!' : 'Mashq qiling!'}
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {Math.round((correctCount / questions.length) * 100)}% to'g'ri
              </p>
            </div>

            {/* Answers List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {questions.map((q, idx) => {
                const answer = answers[idx]
                return (
                  <div
                    key={q.Id}
                    className={`p-3 rounded-xl ${
                      answer?.isCorrect
                        ? isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                        : isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${
                        answer?.isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {answer?.isCorrect ? <FiCheck size={12} className="text-white" /> : <FiX size={12} className="text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {idx + 1}. {q.Question}
                        </p>
                        <p className={`text-xs mt-1 ${answer?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {answer?.isCorrect
                            ? `To'g'ri: ${optionLabels[q.CorrectIndex]}) ${q.Options[q.CorrectIndex]}`
                            : `Siz: ${optionLabels[answer?.selectedIndex || 0]}) ${q.Options[answer?.selectedIndex || 0]} | To'g'ri: ${optionLabels[q.CorrectIndex]}) ${q.Options[q.CorrectIndex]}`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
