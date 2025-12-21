import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUser, FiMail, FiPhone, FiLock, FiEdit2, FiSave, FiX,
  FiCamera, FiCheckCircle, FiPlus, FiCreditCard, FiCopy
} from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa'
import { useAuthStore } from '@store/authStore'
import { useTheme } from '@contexts/ThemeContext'
import toast from 'react-hot-toast'
import { userService } from '@api/user.service'

export const ProfilePage = () => {
  const { user: authUser, token } = useAuthStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [user, setUser] = useState<any>(authUser)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [avatarHover, setAvatarHover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [balance, setBalance] = useState<{ amount: number; balanceCode: string } | null>(null)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [topUpInfo, setTopUpInfo] = useState<{
    cardNumber: string
    userAdmin: string
    fullName: string
  } | null>(null)
  const [isLoadingTopUp, setIsLoadingTopUp] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: authUser?.fullName || '',
    email: authUser?.email || '',
    phoneNumber: authUser?.phoneNumber || '',
  })

  // Initialize user data and fetch phone number
  useEffect(() => {
    const initializeProfile = async () => {
      console.log('=== Initializing Profile Page ===')
      console.log('Auth User:', authUser)
      console.log('Token:', token ? 'present' : 'missing')

      if (!token) {
        console.error('No token available!')
        toast.error('Please login again.')
        setIsLoading(false)
        return
      }

      if (!authUser) {
        console.error('No user data available')
        toast.error('User data not found. Please login again.')
        setIsLoading(false)
        return
      }

      // Start with auth user data
      let userData = { ...authUser }

      // Try to fetch full user data including phone number
      if (authUser.id) {
        try {
          console.log('Fetching user details for ID:', authUser.id)
          const response = await userService.getUserById(authUser.id)
          console.log('User details response:', response)

          if (response.Succeeded && response.Result) {
            const result = response.Result as any // Backend returns PascalCase
            userData = {
              ...userData,
              fullName: result.FullName || result.fullName || userData.fullName,
              email: result.Email || result.email || userData.email,
              phoneNumber: result.PhoneNumber || result.phoneNumber || '',
            }
            console.log('Updated user data with phone:', userData)
          }
        } catch (error) {
          console.log('Could not fetch user details (permission may be required):', error)
          // Continue with authUser data - phone will show as empty
        }
      }

      setUser(userData)
      setProfileForm({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
      })

      // Update auth store if we got new data
      useAuthStore.getState().setUser(userData)
      setIsLoading(false)
    }

    initializeProfile()
  }, [token, authUser?.id])

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!token) return

      try {
        const response = await fetch('https://localhost:5001/api/UserBalance', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })

        const data = await response.json()
        console.log('Balance response:', data)

        if (data.Succeeded && data.Result) {
          setBalance({
            amount: data.Result.Amout || data.Result.Amount || 0,
            balanceCode: data.Result.BalanceCode || '',
          })
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error)
      }
    }

    fetchBalance()
  }, [token])

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }

    let strength = 0
    if (password.length >= 8) strength++
    if (password.length >= 12) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++

    if (strength <= 2) return { strength: 33, label: 'Weak', color: '#ef4444' }
    if (strength <= 3) return { strength: 66, label: 'Medium', color: '#eab308' }
    return { strength: 100, label: 'Strong', color: '#22c55e' }
  }

  const passwordStrength = getPasswordStrength(passwordForm.newPassword)

  // Fetch top-up info
  const fetchTopUpInfo = async () => {
    if (!token) return

    setIsLoadingTopUp(true)
    try {
      const response = await fetch('https://localhost:5001/api/BalanceTransaction', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      console.log('TopUp info response:', data)

      if (data.Succeeded && data.Result) {
        setTopUpInfo({
          cardNumber: data.Result.CardNumber || '',
          userAdmin: data.Result.UserAdmin || '',
          fullName: data.Result.FullName || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch top-up info:', error)
      toast.error('Ma\'lumotlarni yuklashda xatolik')
    } finally {
      setIsLoadingTopUp(false)
    }
  }

  const handleOpenTopUpModal = () => {
    setIsTopUpModalOpen(true)
    fetchTopUpInfo()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''))
    toast.success('Karta raqami nusxalandi!')
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Here you would upload the file to your backend
      toast.success('Avatar upload feature coming soon!')
      console.log('Selected file:', file)
    }
  }

  const handleUpdateProfile = async () => {
    console.log('=== Update Profile Started ===')

    if (!token) {
      toast.error('You must be logged in to update profile')
      return
    }

    console.log('Updating profile with:', profileForm)

    try {
      const response = await userService.updateUser({
        fullName: profileForm.fullName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
      })

      console.log('=== Update Response ===', response)

      // Backend returns PascalCase: Succeeded, Errors
      if (response.Succeeded) {
        toast.success('Profile updated successfully!')
        setIsEditingProfile(false)
        const updatedUser = { ...user, ...profileForm }
        setUser(updatedUser)
        // Update auth store as well
        useAuthStore.getState().setUser(updatedUser)
      } else {
        const errorMessage = response.Errors?.join(', ') || 'Failed to update profile'
        toast.error(errorMessage)
      }
    } catch (error: any) {
      console.error('=== Profile update exception ===', error)
      console.error('Error response data:', error.response?.data)

      // Extract error message - handle multiple formats
      let errorMsg = 'An error occurred while updating profile'

      const responseData = error.response?.data
      if (responseData) {
        // Format 1: ApiResult format { Errors: ["msg1", "msg2"] }
        if (responseData.Errors && Array.isArray(responseData.Errors)) {
          errorMsg = responseData.Errors.join(', ')
        }
        // Format 2: FluentValidation format { errors: { FieldName: ["msg1"] } }
        else if (responseData.errors && typeof responseData.errors === 'object') {
          const validationErrors = Object.values(responseData.errors).flat() as string[]
          errorMsg = validationErrors.join(', ')
        }
        // Format 3: Simple message
        else if (responseData.message) {
          errorMsg = responseData.message
        }
        // Format 4: Title from validation
        else if (responseData.title) {
          errorMsg = responseData.title
        }
      } else if (error.message) {
        errorMsg = error.message
      }

      toast.error(errorMsg)
    }
  }

  const handleResetPassword = async () => {
    console.log('=== Reset Password Started ===')
    console.log('Current user object:', user)
    console.log('User ID:', user?.id)

    // Only check if passwords match (UX requirement)
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match!')
      return
    }

    if (!token) {
      toast.error('You must be logged in to change password')
      return
    }

    if (!user?.id) {
      console.error('=== User ID missing ===')
      console.error('User object:', user)
      console.error('Auth user:', authUser)
      toast.error('User ID not found. Please refresh the page and try again.')
      return
    }

    console.log('Changing password for user:', user.id)

    try {
      const response = await userService.updatePassword(user.id, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })

      console.log('=== Password Change Response ===', response)

      // Backend returns PascalCase: Succeeded, Errors
      if (response.Succeeded) {
        toast.success('Password changed successfully!')
        setIsChangingPassword(false)
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const errorMessage = response.Errors?.join(', ') || 'Failed to change password'
        toast.error(errorMessage)
      }
    } catch (error: any) {
      console.error('=== Password reset exception ===', error)
      console.error('Error response data:', error.response?.data)

      // Extract error message - handle multiple formats
      let errorMsg = 'An error occurred while changing password'

      const responseData = error.response?.data
      if (responseData) {
        // Format 1: ApiResult format { Errors: ["msg1", "msg2"] }
        if (responseData.Errors && Array.isArray(responseData.Errors)) {
          errorMsg = responseData.Errors.join(', ')
        }
        // Format 2: FluentValidation format { errors: { FieldName: ["msg1"] } }
        else if (responseData.errors && typeof responseData.errors === 'object') {
          const validationErrors = Object.values(responseData.errors).flat() as string[]
          errorMsg = validationErrors.join(', ')
        }
        // Format 3: Simple message
        else if (responseData.message) {
          errorMsg = responseData.message
        }
        // Format 4: Title from validation
        else if (responseData.title) {
          errorMsg = responseData.title
        }
      } else if (error.message) {
        errorMsg = error.message
      }

      toast.error(errorMsg)
    }
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-200 text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Failed to load user data</p>
          <p className="text-gray-400 text-sm">Please check your connection and try again</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-16 px-8 min-h-screen max-w-6xl mx-auto"
    >
      {/* Header with Avatar */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          {/* Avatar with Upload */}
          <div className="relative inline-block">
            <motion.div
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-300 flex items-center justify-center shadow-2xl border-4 border-gray-300 cursor-pointer relative overflow-hidden"
              onHoverStart={() => setAvatarHover(true)}
              onHoverEnd={() => setAvatarHover(false)}
              onClick={handleAvatarClick}
              animate={{
                boxShadow: [
                  '0 0 20px rgba(200, 200, 200, 0.3)',
                  '0 0 40px rgba(200, 200, 200, 0.5)',
                  '0 0 20px rgba(200, 200, 200, 0.3)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <FiUser className="w-16 h-16 text-gray-700" />

              {/* Hover Overlay */}
              <AnimatePresence>
                {avatarHover && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1"
                  >
                    <FiCamera className="w-8 h-8 text-white" />
                    <span className="text-white text-xs font-semibold">Change Photo</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
        </motion.div>

        <h1 className={`text-5xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Profile Settings</h1>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage your account information</p>
      </div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 max-w-md"
      >
        <motion.div
          whileHover={{ y: -3, scale: 1.02 }}
          className={`relative overflow-hidden rounded-xl p-5 transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600'
              : 'bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500'
          } shadow-lg`}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>

          <div className="relative">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-white/70 text-sm font-medium mb-1">Balans</p>
                <p className="text-white text-3xl font-bold">
                  {balance ? balance.amount.toLocaleString() : '0'}
                  <span className="text-base ml-1 font-normal">so'm</span>
                </p>
                {balance?.balanceCode && (
                  <p className="text-white/60 text-sm mt-2">
                    ID: {balance.balanceCode}
                  </p>
                )}
              </div>

              {/* Wallet Icon */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
            </div>

            {/* Top Up Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenTopUpModal}
              className="w-full py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              Balansni to'ldirish
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Information Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{
            y: -5,
            boxShadow: '0 12px 40px rgba(180, 180, 180, 0.3)'
          }}
          className={`rounded-2xl p-8 border transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FiUser className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
              Profile Information
            </h2>
            {!isEditingProfile && (
              <motion.button
                whileHover={{ rotate: 15, scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditingProfile(true)}
                className={`p-2 rounded-lg transition-all duration-300 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
              >
                <FiEdit2 className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {!isEditingProfile ? (
              <motion.div
                key="view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Full Name */}
                <div className={`p-4 rounded-lg transition-colors ${isDark ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <FiUser className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</p>
                  </div>
                  <p className={`text-lg font-semibold ml-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.fullName || 'Not set'}
                  </p>
                </div>

                {/* Email */}
                <div className={`p-4 rounded-lg transition-colors ${isDark ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <FiMail className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</p>
                    <FiCheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} title="Verified" />
                  </div>
                  <p className={`text-lg font-semibold ml-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.email || 'Not set'}
                  </p>
                </div>

                {/* Phone */}
                <div className={`p-4 rounded-lg transition-colors ${isDark ? 'bg-gray-900 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <FiPhone className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone Number</p>
                  </div>
                  <p className={`text-lg font-semibold ml-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {user?.phoneNumber || 'Telefon raqami kiritilmagan'}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div>
                  <label className={`block text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <FiUser className="w-4 h-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, fullName: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-cyan-500/50 focus:border-cyan-500 bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'focus:ring-blue-500 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <FiMail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-cyan-500/50 focus:border-cyan-500 bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'focus:ring-blue-500 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className={`block text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <FiPhone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phoneNumber}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phoneNumber: e.target.value })
                    }
                    className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-cyan-500/50 focus:border-cyan-500 bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'focus:ring-blue-500 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    placeholder="+998 XX XXX XX XX"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleUpdateProfile}
                    className={`flex-1 py-2.5 px-5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'}`}
                  >
                    <FiSave className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="py-2.5 px-5 bg-gray-400/10 text-gray-200 rounded-lg font-semibold hover:bg-gray-400/20 transition-colors flex items-center gap-2"
                  >
                    <FiX className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Change Password Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{
            y: -5,
            boxShadow: '0 12px 40px rgba(180, 180, 180, 0.3)'
          }}
          className={`rounded-2xl p-8 border transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FiLock className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
              Change Password
            </h2>
          </div>

          {!isChangingPassword ? (
            <div className="text-center py-8">
              <FiLock className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Keep your account secure by updating your password regularly
              </p>
              <button
                onClick={() => setIsChangingPassword(true)}
                className={`py-2.5 px-6 rounded-lg font-semibold transition-all ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                Change Password
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Old Password</label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-cyan-500/50 focus:border-cyan-500 bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'focus:ring-blue-500 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  placeholder="Enter old password"
                />
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-cyan-500/50 focus:border-cyan-500 bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'focus:ring-blue-500 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  placeholder="Enter new password"
                />

                {/* Password Strength Indicator */}
                {passwordForm.newPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3"
                  >
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.strength}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(to right, #ef4444, #eab308, #22c55e)`,
                          width: `${passwordStrength.strength}%`
                        }}
                      />
                    </div>
                    <p
                      className="text-xs mt-1 font-semibold"
                      style={{ color: passwordStrength.color }}
                    >
                      Password strength: {passwordStrength.label}
                    </p>
                  </motion.div>
                )}
              </div>

              <div>
                <label className={`block text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'focus:ring-cyan-500/50 focus:border-cyan-500 bg-gray-900 border-gray-700 text-white placeholder-gray-500' : 'focus:ring-blue-500 bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleResetPassword}
                  className={`flex-1 py-2.5 px-5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${isDark ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'}`}
                >
                  <FiLock className="w-4 h-4" />
                  Update Password
                </button>
                <button
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                  className="py-2.5 px-5 bg-gray-400/10 text-gray-200 rounded-lg font-semibold hover:bg-gray-400/20 transition-colors flex items-center gap-2"
                >
                  <FiX className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Top Up Modal */}
      <AnimatePresence>
        {isTopUpModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsTopUpModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl p-6 border shadow-xl ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiCreditCard className={isDark ? 'text-cyan-400' : 'text-blue-600'} />
                  Balansni to'ldirish
                </h2>
                <button
                  onClick={() => setIsTopUpModalOpen(false)}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {isLoadingTopUp ? (
                <div className="flex items-center justify-center py-12">
                  <div className={`w-10 h-10 border-4 rounded-full animate-spin ${
                    isDark ? 'border-cyan-500 border-t-transparent' : 'border-blue-500 border-t-transparent'
                  }`} />
                </div>
              ) : topUpInfo ? (
                <div className="space-y-4">
                  {/* Info Text */}
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Balansni to'ldirish uchun quyidagi karta raqamiga pul o'tkazing va admin bilan bog'laning.
                  </p>

                  {/* Card Number */}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Karta raqami
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xl font-mono font-bold tracking-wider ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {topUpInfo.cardNumber}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(topUpInfo.cardNumber)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'bg-gray-800 hover:bg-gray-700 text-cyan-400' : 'bg-gray-200 hover:bg-gray-300 text-blue-600'
                        }`}
                      >
                        <FiCopy className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {topUpInfo.fullName}
                    </p>
                  </div>

                  {/* Admin Info */}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Admin ma'lumotlari
                    </p>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <FaTelegram className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {topUpInfo.fullName}
                        </p>
                        <a
                          href={`https://t.me/${topUpInfo.userAdmin.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-sm ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          {topUpInfo.userAdmin}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Telegram Button */}
                  <a
                    href={`https://t.me/${topUpInfo.userAdmin.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                      isDark
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                    }`}
                  >
                    <FaTelegram className="w-5 h-5" />
                    Telegram orqali bog'lanish
                  </a>

                  {/* Note */}
                  <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    To'lov chekini adminga yuboring
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ma'lumotlarni yuklashda xatolik yuz berdi
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
