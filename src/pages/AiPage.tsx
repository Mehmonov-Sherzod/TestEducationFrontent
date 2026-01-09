import { useTheme } from '@contexts/ThemeContext'
import { AiMeaning } from '@components/shared/AiMeaning'
import { FiCpu } from 'react-icons/fi'

export const AiPage = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
          <FiCpu className="text-purple-500" size={28} />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            AI Test
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Matn kiriting, AI 10 ta test savoli yaratadi
          </p>
        </div>
      </div>

      {/* AI Component */}
      <AiMeaning />

      {/* Info */}
      <div className={`p-4 rounded-2xl ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-100'}`}>
        <h3 className={`font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Qanday ishlaydi?</h3>
        <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <li>1. Matn kiriting (max 3000 belgi)</li>
          <li>2. AI 10 ta test savoli yaratadi (har birida 4 variant)</li>
          <li>3. Har bir savolda to'g'ri javobni tanlang</li>
          <li>4. Oxirida natijalaringizni ko'ring</li>
        </ul>
      </div>
    </div>
  )
}
