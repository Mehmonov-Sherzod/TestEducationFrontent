import { motion } from 'framer-motion'
import { FormType } from '@appTypes/auth.types'

interface AuthToggleProps {
  activeForm: FormType
  onToggle: (form: 'login' | 'register') => void
}

export const AuthToggle = ({ activeForm, onToggle }: AuthToggleProps) => {
  const tabs = [
    { id: 'login', label: 'Login' },
    { id: 'register', label: 'Register' },
  ] as const

  return (
    <div className="flex p-1.5 bg-slate-800/60 backdrop-blur-sm rounded-xl mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onToggle(tab.id)}
          className={`relative flex-1 py-3 px-6 rounded-lg font-semibold text-sm transition-colors duration-300 ${
            activeForm === tab.id
              ? 'text-gray-900'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          {activeForm === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 rounded-lg bg-white shadow-lg"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
