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

export const LoginForm = ({ onForgotPassword: _onForgotPassword, onSwitchToRegister }: LoginFormProps) => {
  // Note: _onForgotPassword kept for future use
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
      className="space-y-4"
    >
      <motion.div variants={itemVariants}>
        <Input
          label="Elektron pochta manzili"
          type="email"
          placeholder="name@example.com"
          icon={<FiMail size={18} />}
          error={errors.email?.message}
          {...register('email')}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label="Parol"
          type="password"
          placeholder="Parolingizni kiriting"
          icon={<FiLock size={18} />}
          error={errors.password?.message}
          {...register('password')}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="pt-1">
        <Button type="submit" className="w-full py-3" isLoading={isLoading}>
          Kirish
        </Button>
      </motion.div>

      {/* Sign Up Link */}
      <motion.div variants={itemVariants} className="text-center">
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Akkauntingiz yo'qmi?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className={`font-semibold transition-colors ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'
            }`}
          >
            Akkaunt yaratish
          </button>
        </p>
      </motion.div>
    </motion.form>
  )
}
