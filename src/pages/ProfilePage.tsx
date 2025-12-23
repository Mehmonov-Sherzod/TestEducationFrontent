import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUser,
  FiCamera
} from 'react-icons/fi'
import { useAuthStore } from '@store/authStore'
import { useTheme } from '@contexts/ThemeContext'
import toast from 'react-hot-toast'
import { userService } from '@api/user.service'
import { cn } from '@utils/cn'

export const ProfilePage = () => {
  const { user: authUser, token } = useAuthStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [user, setUser] = useState<any>(authUser)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [avatarHover, setAvatarHover] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profileForm, setProfileForm] = useState({
    fullName: authUser?.fullName || '',
    email: authUser?.email || '',
    phoneNumber: authUser?.phoneNumber || '',
  })

  useEffect(() => {
    const initializeProfile = async () => {
      if (!token) {
        toast.error('Please login again.')
        setIsLoading(false)
        return
      }

      if (!authUser) {
        toast.error('User data not found. Please login again.')
        setIsLoading(false)
        return
      }

      let userData = { ...authUser }

      if (authUser.id) {
        try {
          const response = await userService.getUserById(authUser.id)
          if (response.Succeeded && response.Result) {
            const result = response.Result as any
            userData = {
              ...userData,
              fullName: result.FullName || result.fullName || userData.fullName,
              email: result.Email || result.email || userData.email,
              phoneNumber: result.PhoneNumber || result.phoneNumber || '',
            }
          }
        } catch (error) {
          console.log('Could not fetch user details:', error)
        }
      }

      setUser(userData)
      setProfileForm({
        fullName: userData.fullName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
      })
      useAuthStore.getState().setUser(userData)
      setIsLoading(false)
    }

    initializeProfile()
  }, [token, authUser?.id])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.success('Avatar upload feature coming soon!')
    }
  }

  const handleUpdateProfile = async () => {
    if (!token) {
      toast.error('You must be logged in to update profile')
      return
    }

    try {
      const response = await userService.updateUser({
        fullName: profileForm.fullName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
      })

      if (response.Succeeded) {
        toast.success('Profil yangilandi!')
        setIsEditingProfile(false)
        const updatedUser = { ...user, ...profileForm }
        setUser(updatedUser)
        useAuthStore.getState().setUser(updatedUser)
      } else {
        const errorMessage = response.Errors?.join(', ') || 'Failed to update profile'
        toast.error(errorMessage)
      }
    } catch (error: any) {
      let errorMsg = 'An error occurred while updating profile'
      const responseData = error.response?.data
      if (responseData) {
        if (responseData.Errors && Array.isArray(responseData.Errors)) {
          errorMsg = responseData.Errors.join(', ')
        } else if (responseData.errors && typeof responseData.errors === 'object') {
          const validationErrors = Object.values(responseData.errors).flat() as string[]
          errorMsg = validationErrors.join(', ')
        } else if (responseData.message) {
          errorMsg = responseData.message
        }
      }
      toast.error(errorMsg)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Failed to load user data</p>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="max-w-md mx-auto">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border',
            isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200 shadow-lg'
          )}
        >
          {/* Header with icon */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <motion.div
              onHoverStart={() => setAvatarHover(true)}
              onHoverEnd={() => setAvatarHover(false)}
              onClick={handleAvatarClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center cursor-pointer relative overflow-hidden',
                isDark ? 'bg-blue-600' : 'bg-blue-100'
              )}
            >
              <FiUser className={isDark ? 'text-white' : 'text-blue-600'} size={20} />
              <AnimatePresence>
                {avatarHover && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center"
                  >
                    <FiCamera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <div className="min-w-0 flex-1">
              <h1 className={cn(
                'text-lg sm:text-xl font-semibold truncate',
                isDark ? 'text-white' : 'text-gray-800'
              )}>
                {user?.fullName || 'Profil'}
              </h1>
              <p className={cn(
                'text-xs sm:text-sm',
                isDark ? 'text-gray-400' : 'text-gray-500'
              )}>
                {user?.role || 'Ma\'lumotlarni tahrirlash'}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isEditingProfile ? (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3 sm:space-y-5"
              >
                {/* Email Field */}
                <div>
                  <label className={cn(
                    'block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2',
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Email
                  </label>
                  <div className={cn(
                    'px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border',
                    isDark
                      ? 'bg-[#262626] border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  )}>
                    <p className={cn(
                      'text-xs sm:text-sm truncate',
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      {user?.email || 'Email kiritilmagan'}
                    </p>
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label className={cn(
                    'block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2',
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Telefon raqam
                  </label>
                  <div className={cn(
                    'px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border',
                    isDark
                      ? 'bg-[#262626] border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  )}>
                    <p className={cn(
                      'text-xs sm:text-sm',
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    )}>
                      {user?.phoneNumber || 'Telefon kiritilmagan'}
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all mt-2 text-sm sm:text-base"
                >
                  Tahrirlash
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3 sm:space-y-5"
              >
                {/* Full Name Input */}
                <div>
                  <label className={cn(
                    'block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2',
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    To'liq ism
                  </label>
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className={cn(
                      'w-full px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border outline-none transition-colors text-sm sm:text-base',
                      isDark
                        ? 'bg-[#262626] border-gray-700 text-white placeholder-gray-500 focus:border-teal-500'
                        : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400'
                    )}
                    placeholder="To'liq ismingiz"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <label className={cn(
                    'block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2',
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className={cn(
                      'w-full px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border outline-none transition-colors text-sm sm:text-base',
                      isDark
                        ? 'bg-[#262626] border-gray-700 text-white placeholder-gray-500 focus:border-teal-500'
                        : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400'
                    )}
                    placeholder="Email manzilingiz"
                  />
                </div>

                {/* Phone Input */}
                <div>
                  <label className={cn(
                    'block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2',
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  )}>
                    Telefon raqam
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    className={cn(
                      'w-full px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl border outline-none transition-colors text-sm sm:text-base',
                      isDark
                        ? 'bg-[#262626] border-gray-700 text-white placeholder-gray-500 focus:border-teal-500'
                        : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400'
                    )}
                    placeholder="+998 XX XXX XX XX"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsEditingProfile(false)
                      setProfileForm({
                        fullName: user?.fullName || '',
                        email: user?.email || '',
                        phoneNumber: user?.phoneNumber || '',
                      })
                    }}
                    className={cn(
                      'flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-colors text-sm sm:text-base',
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    )}
                  >
                    Bekor qilish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateProfile}
                    className="flex-1 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 transition-all text-sm sm:text-base"
                  >
                    Saqlash
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
