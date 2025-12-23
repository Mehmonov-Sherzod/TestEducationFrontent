import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUser,
  FiMail,
  FiPhone,
  FiEdit2,
  FiX,
  FiSave,
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

  const handleUpdateProfile = async () => {
    if (!token) {
      toast.error('You must be logged in to update profile')
      return
    }

    const fullName = profileForm.fullName.trim()

    try {
      const response = await userService.updateUser({
        fullName,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
      })

      if (response.Succeeded) {
        toast.success('Profil yangilandi!')
        setIsEditingProfile(false)
        const updatedUser = { ...user, fullName, email: profileForm.email, phoneNumber: profileForm.phoneNumber }
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

  const handleCancelEdit = () => {
    setProfileForm({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    })
    setIsEditingProfile(false)
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-xl p-6 sm:p-8 border',
            isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200 shadow-lg'
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className={cn(
                'text-xl sm:text-2xl font-bold mb-1',
                isDark ? 'text-white' : 'text-gray-800'
              )}>
                Profil tafsilotlari
              </h1>
              <p className={cn(
                'text-sm',
                isDark ? 'text-gray-400' : 'text-gray-500'
              )}>
                Shaxsiy ma'lumotlaringizni boshqaring
              </p>
            </div>

            {!isEditingProfile && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsEditingProfile(true)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm',
                  isDark
                    ? 'bg-[#1a1a1a] border border-gray-600/30 text-gray-300 hover:bg-[#252525]'
                    : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                )}
              >
                <FiEdit2 className="w-4 h-4" />
                Tahrirlash
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
                className="space-y-6"
              >
                {/* Full Name */}
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-2',
                    isDark ? 'text-white' : 'text-gray-700'
                  )}>
                    Ism
                  </label>
                  <div className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg border',
                    isDark
                      ? 'bg-[#1a1a1a] border-gray-600/30'
                      : 'bg-gray-50 border-gray-200'
                  )}>
                    <FiUser className={isDark ? 'text-gray-500' : 'text-gray-400'} size={18} />
                    <span className={cn(
                      'text-sm',
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      {profileForm.fullName || 'Ismingizni kiriting'}
                    </span>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-2',
                    isDark ? 'text-white' : 'text-gray-700'
                  )}>
                    Elektron pochta
                  </label>
                  <div className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg border',
                    isDark
                      ? 'bg-[#1a1a1a] border-gray-600/30'
                      : 'bg-gray-50 border-gray-200'
                  )}>
                    <FiMail className={isDark ? 'text-gray-500' : 'text-gray-400'} size={18} />
                    <span className={cn(
                      'text-sm',
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      {user?.email || 'Elektron pochtangizni kiriting'}
                    </span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-2',
                    isDark ? 'text-white' : 'text-gray-700'
                  )}>
                    Telefon raqami
                  </label>
                  <div className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg border',
                    isDark
                      ? 'bg-[#1a1a1a] border-gray-600/30'
                      : 'bg-gray-50 border-gray-200'
                  )}>
                    <FiPhone className={isDark ? 'text-gray-500' : 'text-gray-400'} size={18} />
                    <span className={cn(
                      'text-sm',
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    )}>
                      {user?.phoneNumber || 'Telefon raqamingizni kiriting'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Full Name */}
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-2',
                    isDark ? 'text-white' : 'text-gray-700'
                  )}>
                    Ism
                  </label>
                  <div className={cn(
                    'flex items-center gap-3 px-4 rounded-lg border transition-colors',
                    isDark
                      ? 'bg-[#1a1a1a] border-gray-600/30 focus-within:border-blue-500'
                      : 'bg-gray-50 border-gray-200 focus-within:border-blue-500'
                  )}>
                    <FiUser className={isDark ? 'text-gray-500' : 'text-gray-400'} size={18} />
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className={cn(
                        'flex-1 py-3 bg-transparent outline-none text-sm',
                        isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                      )}
                      placeholder="Ismingizni kiriting"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-2',
                    isDark ? 'text-white' : 'text-gray-700'
                  )}>
                    Elektron pochta
                  </label>
                  <div className={cn(
                    'flex items-center gap-3 px-4 rounded-lg border transition-colors',
                    isDark
                      ? 'bg-[#1a1a1a] border-gray-600/30 focus-within:border-blue-500'
                      : 'bg-gray-50 border-gray-200 focus-within:border-blue-500'
                  )}>
                    <FiMail className={isDark ? 'text-gray-500' : 'text-gray-400'} size={18} />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className={cn(
                        'flex-1 py-3 bg-transparent outline-none text-sm',
                        isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                      )}
                      placeholder="Elektron pochtangizni kiriting"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={cn(
                    'block text-sm font-medium mb-2',
                    isDark ? 'text-white' : 'text-gray-700'
                  )}>
                    Telefon raqami
                  </label>
                  <div className={cn(
                    'flex items-center gap-3 px-4 rounded-lg border transition-colors',
                    isDark
                      ? 'bg-[#1a1a1a] border-gray-600/30 focus-within:border-blue-500'
                      : 'bg-gray-50 border-gray-200 focus-within:border-blue-500'
                  )}>
                    <FiPhone className={isDark ? 'text-gray-500' : 'text-gray-400'} size={18} />
                    <input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      className={cn(
                        'flex-1 py-3 bg-transparent outline-none text-sm',
                        isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                      )}
                      placeholder="Telefon raqamingizni kiriting"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCancelEdit}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors text-sm',
                      isDark
                        ? 'bg-[#1a1a1a] border border-gray-600/30 text-gray-300 hover:bg-[#252525]'
                        : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    <FiX className="w-4 h-4" />
                    Bekor qilish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateProfile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors text-sm"
                  >
                    <FiSave className="w-4 h-4" />
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
