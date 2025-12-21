import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiLock } from 'react-icons/fi'
import { Input } from '@components/shared/Input'
import { Button } from '@components/shared/Button'
import { useAuth } from '@hooks/useAuth'
import { loginSchema, LoginFormData } from '@utils/validation'
import { ROUTES } from '@utils/constants'
import { useTheme } from '@contexts/ThemeContext'

interface LoginFormProps {
  onForgotPassword: () => void
  onSwitchToRegister: () => void
}

export const LoginForm = ({ onForgotPassword, onSwitchToRegister }: LoginFormProps) => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data)
    if (success) {
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD)
      }, 500)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <motion.div variants={itemVariants}>
        <Input
          label="Email"
          type="email"
          icon={<FiMail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label="Password"
          type="password"
          icon={<FiLock size={18} />}
          error={errors.password?.message}
          {...register('password')}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className={`peer w-4 h-4 rounded border appearance-none cursor-pointer
                       focus:outline-none focus:ring-2 transition-all duration-200
                       checked:bg-blue-500 checked:border-blue-500 focus:ring-blue-500/20
                       ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
            />
            <svg
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className={`text-sm transition-colors select-none ${
            isDark ? 'text-gray-400 group-hover:text-white' : 'text-gray-600 group-hover:text-black'
          }`}>
            Remember me
          </span>
        </label>

        <button
          type="button"
          onClick={onForgotPassword}
          className={`text-sm transition-colors ${
            isDark ? 'text-gray-400 hover:text-cyan-400' : 'text-gray-500 hover:text-blue-500'
          }`}
        >
          Forgot password?
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-2">
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Sign In
        </Button>
      </motion.div>

      {/* Sign Up Link */}
      <motion.div variants={itemVariants} className="pt-4 text-center">
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className={`font-semibold transition-colors ${
              isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-500 hover:text-blue-600'
            }`}
          >
            Sign up
          </button>
        </p>
      </motion.div>
    </motion.form>
  )
}
