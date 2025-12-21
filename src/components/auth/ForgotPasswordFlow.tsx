import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiCheckCircle, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Input } from '@components/shared/Input'
import { Button } from '@components/shared/Button'
import { OTPInput } from './OTPInput'
import { useCountdown } from '@hooks/useCountdown'
import { userService } from '@api/user.service'
import { handleApiError } from '@api/axios.config'
import {
  forgotPasswordEmailSchema,
  ForgotPasswordEmailData,
  resetPasswordSchema,
  ResetPasswordFormData,
  getPasswordStrength,
} from '@utils/validation'
import { VALIDATION, MESSAGES } from '@utils/constants'

type Step = 'email' | 'otp' | 'password' | 'success'

interface ForgotPasswordFlowProps {
  onBack: () => void
}

export const ForgotPasswordFlow = ({ onBack }: ForgotPasswordFlowProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpError, setOtpError] = useState(false)

  const countdown = useCountdown({
    initialSeconds: VALIDATION.OTP_EXPIRY_SECONDS,
    onComplete: () => {
      toast.error(MESSAGES.ERROR.OTP_EXPIRED)
    },
  })

  const emailForm = useForm<ForgotPasswordEmailData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
  })

  const passwordForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  // Step 1: Send OTP
  const handleSendOTP = async (data: ForgotPasswordEmailData) => {
    setIsLoading(true)
    try {
      const response = await userService.sendOTP({ email: data.email })

      if (response.Succeeded) {
        setEmail(data.email)
        setCurrentStep('otp')
        countdown.start()
        toast.success(MESSAGES.SUCCESS.OTP_SENT)
      } else {
        toast.error(response.Errors?.join(', ') || MESSAGES.ERROR.GENERIC)
      }
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: OTP entered - just move to password step
  const handleOTPComplete = (code: string) => {
    setOtpCode(code)
    setCurrentStep('password')
    countdown.stop()
  }

  // Step 3: Reset Password
  const handleResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    try {
      const response = await userService.forgotPassword({
        otpCode,
        email,
        newPassword: data.newPassword,
      })

      if (response.Succeeded) {
        setCurrentStep('success')
        toast.success(MESSAGES.SUCCESS.PASSWORD_RESET)

        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          onBack()
        }, 3000)
      } else {
        toast.error(response.Errors?.join(', ') || MESSAGES.ERROR.GENERIC)
      }
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP
  const handleResendOTP = async () => {
    setOtpCode('')
    setOtpError(false)
    countdown.reset()

    setIsLoading(true)
    try {
      const response = await userService.sendOTP({ email })

      if (response.Succeeded) {
        countdown.start()
        toast.success('OTP resent successfully')
      } else {
        toast.error(response.Errors?.join(', ') || MESSAGES.ERROR.GENERIC)
      }
    } catch (error) {
      toast.error(handleApiError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const slideVariants = {
    enter: { x: 300, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
  }

  const passwordStrength = passwordForm.watch('newPassword')
    ? getPasswordStrength(passwordForm.watch('newPassword'))
    : null

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {currentStep !== 'success' && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <FiArrowLeft />
          <span className="text-sm">Back to Login</span>
        </button>
      )}

      {/* Progress Indicator */}
      {currentStep !== 'success' && (
        <div className="flex gap-2">
          {['email', 'otp', 'password'].map((step, index) => (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                currentStep === step
                  ? 'bg-white'
                  : ['email', 'otp', 'password'].indexOf(currentStep) > index
                  ? 'bg-gray-200'
                  : 'bg-dark-700'
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Email Input */}
        {currentStep === 'email' && (
          <motion.div
            key="email"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-2">Forgot Password?</h2>
            <p className="text-gray-400 mb-6">
              Enter your email address and we'll send you an OTP to reset your
              password.
            </p>

            <form
              onSubmit={emailForm.handleSubmit(handleSendOTP)}
              className="space-y-4"
            >
              <Input
                label="Email Address"
                type="email"
                icon={<FiMail />}
                error={emailForm.formState.errors.email?.message}
                {...emailForm.register('email')}
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Send OTP
              </Button>
            </form>
          </motion.div>
        )}

        {/* Step 2: OTP Verification */}
        {currentStep === 'otp' && (
          <motion.div
            key="otp"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-2">Enter OTP</h2>
            <p className="text-gray-400 mb-6">
              We've sent a {VALIDATION.OTP_LENGTH}-digit code to{' '}
              <span className="text-gray-100">{email}</span>
            </p>

            <div className="space-y-6">
              <OTPInput
                length={VALIDATION.OTP_LENGTH}
                value={otpCode}
                onChange={setOtpCode}
                onComplete={handleOTPComplete}
                error={otpError}
                disabled={isLoading}
              />

              {/* Countdown Timer */}
              <div className="text-center">
                {countdown.isRunning ? (
                  <p className="text-sm text-gray-400">
                    Resend OTP in{' '}
                    <span className="text-gray-100 font-semibold">
                      {countdown.seconds}s
                    </span>
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-white hover:text-gray-100 transition-colors disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                onClick={() => setCurrentStep('email')}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors"
              >
                Change email address
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: New Password */}
        {currentStep === 'password' && (
          <motion.div
            key="password"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
            <p className="text-gray-400 mb-6">
              Create a new strong password for your account.
            </p>

            <form
              onSubmit={passwordForm.handleSubmit(handleResetPassword)}
              className="space-y-4"
            >
              <div>
                <Input
                  label="New Password"
                  type="password"
                  icon={<FiLock />}
                  error={passwordForm.formState.errors.newPassword?.message}
                  {...passwordForm.register('newPassword')}
                />

                {/* Password Strength Meter */}
                {passwordStrength && passwordForm.watch('newPassword') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 space-y-2"
                  >
                    <div className="flex gap-1 h-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength.score
                              ? 'bg-white'
                              : 'bg-dark-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className="text-xs"
                      style={{ color: passwordStrength.color }}
                    >
                      Password Strength: {passwordStrength.label}
                    </p>
                  </motion.div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type="password"
                icon={<FiLock />}
                error={
                  passwordForm.formState.errors.confirmPassword?.message
                }
                {...passwordForm.register('confirmPassword')}
              />

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Reset Password
              </Button>
            </form>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {currentStep === 'success' && (
          <motion.div
            key="success"
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.3 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.2,
              }}
              className="inline-block"
            >
              <FiCheckCircle className="w-20 h-20 text-white mx-auto mb-4" />
            </motion.div>

            <h2 className="text-2xl font-bold mb-2">Password Reset!</h2>
            <p className="text-gray-400 mb-6">
              Your password has been successfully reset. Redirecting to login...
            </p>

            <Button onClick={onBack} className="mx-auto">
              Back to Login
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
