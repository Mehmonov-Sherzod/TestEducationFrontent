import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiPhone, FiLock } from 'react-icons/fi'
import { Input } from '@components/shared/Input'
import { Button } from '@components/shared/Button'
import { useAuth } from '@hooks/useAuth'
import { registerSchema, RegisterFormData, getPasswordStrength } from '@utils/validation'
import { useTheme } from '@contexts/ThemeContext'

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export const RegisterForm = ({ onSuccess, onSwitchToLogin }: RegisterFormProps) => {
  const { register: registerUser, isLoading } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  })

  const watchedPassword = watch('password')
  const passwordStrength = watchedPassword
    ? getPasswordStrength(watchedPassword)
    : null

  const onSubmit = async (data: RegisterFormData) => {
    const success = await registerUser(data)
    if (success) {
      setTimeout(() => {
        onSuccess()
      }, 1000)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
      className="space-y-4 sm:space-y-5"
    >
      <motion.div variants={itemVariants}>
        <Input
          label="Full Name"
          type="text"
          icon={<FiUser />}
          error={errors.fullName?.message}
          {...register('fullName')}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label="Email Address"
          type="email"
          icon={<FiMail />}
          error={errors.email?.message}
          {...register('email')}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label="Phone Number"
          type="tel"
          icon={<FiPhone />}
          placeholder="+1234567890"
          error={errors.phoneNumber?.message}
          {...register('phoneNumber')}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label="Password"
          type="password"
          icon={<FiLock />}
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Password Strength Meter */}
        {passwordStrength && watchedPassword && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 space-y-2"
          >
            {/* Strength Bar */}
            <div className="flex gap-1 h-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${
                    i <= passwordStrength.score
                      ? 'bg-blue-500'
                      : isDark ? 'bg-[#1a1a1a]' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* Strength Label */}
            <p
              className="text-xs"
              style={{ color: passwordStrength.color }}
            >
              Password Strength: {passwordStrength.label}
            </p>
          </motion.div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Input
          label="Confirm Password"
          type="password"
          icon={<FiLock />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="submit" className="w-full" isLoading={isLoading}>
          Create Account
        </Button>
      </motion.div>

      <motion.p
        variants={itemVariants}
        className={`text-[10px] sm:text-xs text-center mt-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
      >
        By signing up, you agree to our Terms & Conditions
      </motion.p>

      {/* Login Link */}
      <motion.div variants={itemVariants} className="pt-4 text-center">
        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className={`font-semibold transition-colors ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-600'
            }`}
          >
            Sign in
          </button>
        </p>
      </motion.div>
    </motion.form>
  )
}
