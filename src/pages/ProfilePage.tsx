import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX,
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

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-2xl p-8 shadow-lg',
            isDark ? 'bg-gray-800' : 'bg-white'
          )}
        >
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <motion.div
              onHoverStart={() => setAvatarHover(true)}
              onHoverEnd={() => setAvatarHover(false)}
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center cursor-pointer relative overflow-hidden shadow-lg"
            >
              <span className="text-3xl font-bold text-white">
                {getInitials(user?.fullName)}
              </span>

              <AnimatePresence>
                {avatarHover && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  >
                    <FiCamera className="w-6 h-6 text-white" />
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
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className={cn(
              'text-2xl font-bold',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              {user?.fullName || 'Foydalanuvchi'}
            </h1>
            <p className={cn(
              'text-sm mt-1',
              isDark ? 'text-gray-400' : 'text-gray-500'
            )}>
              {user?.role || 'User'}
            </p>
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
                {/* Email Field */}
                <div className={cn(
                  'flex items-center gap-3 px-4 py-4 rounded-xl',
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                )}>
                  <FiMail className={isDark ? 'text-gray-400' : 'text-gray-400'} size={20} />
                  <span className={cn(
                    'flex-1',
                    isDark ? 'text-white' : 'text-gray-700'
                  )}>
                    {user?.email || 'Email kiritilmagan'}
                  </span>
                </div>

                {/* Phone Field */}
                <div className={cn(
                  'flex items-center gap-3 px-4 py-4 rounded-xl',
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                )}>
                  <FiPhone className={isDark ? 'text-gray-400' : 'text-gray-400'} size={20} />
                  <span className={cn(
                    'flex-1',
                    isDark ? 'text-white' : 'text-gray-700'
                  )}>
                    {user?.phoneNumber || 'Telefon kiritilmagan'}
                  </span>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full py-4 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-2 mt-6"
                >
                  <FiEdit2 size={18} />
                  Tahrirlash
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {/* Full Name Input */}
                <div className={cn(
                  'flex items-center gap-3 px-4 py-4 rounded-xl',
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                )}>
                  <FiUser className={isDark ? 'text-gray-400' : 'text-gray-400'} size={20} />
                  <input
                    type="text"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className={cn(
                      'flex-1 bg-transparent outline-none',
                      isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'
                    )}
                    placeholder="To'liq ismingiz"
                  />
                </div>

                {/* Email Input */}
                <div className={cn(
                  'flex items-center gap-3 px-4 py-4 rounded-xl',
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                )}>
                  <FiMail className={isDark ? 'text-gray-400' : 'text-gray-400'} size={20} />
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className={cn(
                      'flex-1 bg-transparent outline-none',
                      isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'
                    )}
                    placeholder="Email manzilingiz"
                  />
                </div>

                {/* Phone Input */}
                <div className={cn(
                  'flex items-center gap-3 px-4 py-4 rounded-xl',
                  isDark ? 'bg-gray-700/50' : 'bg-gray-50'
                )}>
                  <FiPhone className={isDark ? 'text-gray-400' : 'text-gray-400'} size={20} />
                  <input
                    type="tel"
                    value={profileForm.phoneNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    className={cn(
                      'flex-1 bg-transparent outline-none',
                      isDark ? 'text-white placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'
                    )}
                    placeholder="+998 XX XXX XX XX"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="w-full py-4 rounded-xl font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <FiSave size={18} />
                    Saqlash
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false)
                      setProfileForm({
                        fullName: user?.fullName || '',
                        email: user?.email || '',
                        phoneNumber: user?.phoneNumber || '',
                      })
                    }}
                    className={cn(
                      'w-full py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2',
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    )}
                  >
                    <FiX size={18} />
                    Bekor qilish
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
