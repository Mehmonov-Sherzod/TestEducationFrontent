import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiUsers,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiX,
  FiSave,
  FiMail,
  FiPhone,
  FiLock,
  FiChevronLeft,
  FiChevronRight,
  FiShield,
  FiKey,
} from 'react-icons/fi'
import { useAuthStore } from '@store/authStore'
import { useTheme } from '@contexts/ThemeContext'
import toast from 'react-hot-toast'

interface User {
  Id: number
  FullName: string
  Email: string
  PhoneNumber: string
  Password?: string
}

interface PaginationResult {
  Values: User[]
  PageNumber: number
  PageSize: number
  TotalCount: number
  HasPrevious: boolean
  HasNext: boolean
}

export const UsersPage = () => {
  const { token, user } = useAuthStore()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [hasNext, setHasNext] = useState(false)

  // Check user role and permissions
  // SuperAdmin has: ALL permissions (ManageUsers, ManageAdmins, SystemSettings, etc.)
  const isSuperAdmin = user?.permissions?.includes('ManageAdmins') ||
    user?.permissions?.includes('ManageUsers') ||
    user?.permissions?.includes('SystemSettings')

  // Admin has: ManageUsersStudent, ManageTests, ManageSubjects, ManageQuestions, ViewResults, etc.
  // Note: SuperAdmin also has ManageUsersStudent, so we check isSuperAdmin first
  const isAdmin = user?.permissions?.includes('ManageUsersStudent') && !isSuperAdmin

  const canAccessUsers = isSuperAdmin || isAdmin

  // Create user form state (for SuperAdmin)
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    roleIds: [3], // Default: Student role (RoleId=3)
  })

  // Redirect if no access
  if (!canAccessUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">
            You don't have permission to access this page.
          </p>
          <p className="text-gray-400 text-sm">Required: ManageUsers, ManageAdmins, or ManageUsersStudent permission</p>
        </div>
      </div>
    )
  }

  // Fetch users with pagination (All roles use this)
  const fetchUsers = async () => {
    console.log('=== Fetching Users (Paginated) ===')
    console.log('Using proxy for API calls')
    console.log('Current page:', currentPage)
    console.log('Page size:', pageSize)
    console.log('Search query:', searchQuery)
    console.log('Token:', token ? `${token.substring(0, 20)}...` : 'null')

    try {
      setIsLoading(true)

      const url = `/api/User/get-all-page`
      const requestBody = {
        PageNumber: currentPage,
        PageSize: pageSize,
        Search: searchQuery,
      }

      console.log('URL:', url)
      console.log('Request body:', requestBody)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('=== Response Error ===')
        console.error('Status:', response.status)
        console.error('Error text:', errorText)
        toast.error(`Failed to fetch users. Status: ${response.status}`)
        return
      }

      const data = await response.json()
      console.log('=== Response Data ===', data)

      // Backend returns PascalCase: Succeeded, Result, Errors
      if (data.Succeeded && data.Result) {
        const pagination: PaginationResult = data.Result
        console.log('Pagination data:', pagination)
        console.log('Users count:', pagination.Values?.length)

        // Backend PaginationResult also uses PascalCase
        setUsers(pagination.Values || [])
        setTotalCount(pagination.TotalCount || 0)
        setHasPrevious(pagination.HasPrevious || false)
        setHasNext(pagination.HasNext || false)
      } else {
        console.error('Response not successful:', data)
        const errorMessage = data.Errors?.join(', ') || data.message || 'Failed to fetch users'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('=== Fetch Users Exception ===', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  // This function is no longer used - all roles use pagination now

  useEffect(() => {
    console.log('=== Users Page useEffect ===')
    console.log('isSuperAdmin:', isSuperAdmin)
    console.log('isAdmin:', isAdmin)
    console.log('canAccessUsers:', canAccessUsers)
    console.log('User permissions:', user?.permissions)

    if (canAccessUsers) {
      console.log('Fetching paginated users')
      fetchUsers() // All roles use pagination
    } else {
      console.log('No permissions to fetch users')
      setIsLoading(false)
    }
  }, [currentPage, searchQuery])

  // Create user (SuperAdmin only - ManageAdmins)
  const handleCreateUser = async () => {
    if (!isSuperAdmin) {
      toast.error('Only SuperAdmin can create users')
      return
    }

    if (!createForm.fullName || !createForm.email || !createForm.password) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      // Transform to PascalCase for backend
      const requestBody = {
        FullName: createForm.fullName,
        Email: createForm.email,
        Password: createForm.password,
        PhoneNumber: createForm.phoneNumber,
        RoleIds: createForm.roleIds,
      }

      console.log('=== Creating User ===')
      console.log('Request body:', requestBody)

      const response = await fetch(`/api/User/Create`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'Accept-Language': 'en-US',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log('=== Create User Response ===', data)

      if (data.Succeeded) {
        toast.success('User created successfully!')
        setIsCreating(false)
        setCreateForm({
          fullName: '',
          email: '',
          password: '',
          phoneNumber: '',
          roleIds: [3], // Default to Student role
        })
        fetchUsers()
      } else {
        const errorMessage = data.Errors?.join(', ') || 'Failed to create user'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Failed to create user:', error)
      toast.error('An error occurred while creating user')
    }
  }

  // Delete user
  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!canAccessUsers) {
      toast.error('No permission to delete users')
      return
    }

    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/User/${userId}`, {
        method: 'DELETE',
        headers: {
          'accept': '*/*',
          'Accept-Language': 'en-US',
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      console.log('=== Delete User Response ===', data)

      if (data.Succeeded) {
        toast.success('User deleted successfully!')
        fetchUsers() // Refresh list
      } else {
        const errorMessage = data.Errors?.join(', ') || 'Failed to delete user'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast.error('An error occurred while deleting user')
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="py-4 sm:py-8 px-2 sm:px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3 flex-wrap ${isDark ? 'text-white' : 'text-gray-800'}`}>
            <FiUsers className={`w-6 h-6 sm:w-8 sm:h-8 ${isDark ? 'text-blue-400' : 'text-gray-600'}`} />
            <span className="hidden sm:inline">User Management</span>
            <span className="sm:hidden">Foydalanuvchilar</span>
            {isSuperAdmin && (
              <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-500/20 text-purple-300 rounded-full font-normal flex items-center gap-1">
                <FiShield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                SuperAdmin
              </span>
            )}
            {isAdmin && !isSuperAdmin && (
              <span className="text-[10px] sm:text-xs px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500/20 text-blue-300 rounded-full font-normal flex items-center gap-1">
                <FiKey className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                Admin
              </span>
            )}
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {isSuperAdmin ? 'Full system user management' : 'Manage student users'}
          </p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setIsCreating(true)}
            className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base w-full sm:w-auto ${
              isDark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Create User</span>
            <span className="sm:hidden">Yangi foydalanuvchi</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative w-full sm:max-w-md">
          <FiSearch className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Qidirish..."
            className={`w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-[#151515] border-gray-600/30 text-white placeholder-gray-500 focus:ring-blue-500/50 focus:border-blue-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className={`rounded-xl sm:rounded-2xl overflow-hidden border ${isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200 shadow-lg'}`}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center">
              <div className={`w-10 h-10 sm:w-16 sm:h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4 ${isDark ? 'border-blue-500' : 'border-gray-400'}`}></div>
              <p className={`text-sm sm:text-lg ${isDark ? 'text-blue-400' : 'text-gray-600'}`}>Yuklanmoqda...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center px-4">
              <FiUsers className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-sm sm:text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Foydalanuvchilar topilmadi</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className={`border-b ${isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-gray-50 border-gray-200'}`}>
                  <tr>
                    <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-gray-600'}`}>
                      #
                    </th>
                    <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-gray-600'}`}>
                      Full Name
                    </th>
                    <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-gray-600'}`}>
                      Email
                    </th>
                    <th className={`px-4 lg:px-6 py-3 lg:py-4 text-left text-xs lg:text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-gray-600'}`}>
                      Phone
                    </th>
                    <th className={`px-4 lg:px-6 py-3 lg:py-4 text-right text-xs lg:text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-gray-600'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-600/20' : 'divide-gray-100'}`}>
                  {users.map((u, index) => (
                    <motion.tr
                      key={u.Id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`transition-colors ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50'}`}
                    >
                      <td className={`px-4 lg:px-6 py-3 lg:py-4 text-sm ${isDark ? 'text-white' : 'text-gray-700'}`}>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td className={`px-4 lg:px-6 py-3 lg:py-4 font-medium text-sm ${isDark ? 'text-white' : 'text-gray-700'}`}>
                        {u.FullName}
                      </td>
                      <td className={`px-4 lg:px-6 py-3 lg:py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{u.Email}</td>
                      <td className={`px-4 lg:px-6 py-3 lg:py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {u.PhoneNumber || 'N/A'}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.Id, u.FullName)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${isDark ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className={`sm:hidden divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {users.map((u, index) => (
                <motion.div
                  key={u.Id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-3 ${isDark ? 'hover:bg-[#1a1a1a]/50' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${isDark ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                          #{(currentPage - 1) * pageSize + index + 1}
                        </span>
                        <h3 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {u.FullName}
                        </h3>
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <FiMail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{u.Email}</span>
                        </p>
                        <p className={`text-xs flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <FiPhone className="w-3 h-3 flex-shrink-0" />
                          <span>{u.PhoneNumber || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUser(u.Id, u.FullName)}
                      className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isDark ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination (All users) */}
            {totalPages > 1 && (
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 border-t ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} / {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={!hasPrevious}
                    className={`p-1.5 sm:p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <FiChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <span className={`text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={!hasNext}
                    className={`p-1.5 sm:p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${isDark ? 'bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create User Modal (SuperAdmin only) */}
      <AnimatePresence>
        {isCreating && isSuperAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-xl sm:rounded-2xl shadow-2xl border p-4 sm:p-6 lg:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-[#151515] border-gray-600/30' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <FiShield className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-blue-400' : 'text-purple-600'}`} />
                  <span className="hidden sm:inline">Create New User</span>
                  <span className="sm:hidden">Yangi foydalanuvchi</span>
                </h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                >
                  <FiX className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>To'liq ism *</label>
                  <input
                    type="text"
                    value={createForm.fullName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, fullName: e.target.value })
                    }
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white placeholder-gray-500 focus:ring-teal-500/50 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
                    placeholder="To'liq ismni kiriting"
                  />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <FiMail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Email *
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white placeholder-gray-500 focus:ring-teal-500/50 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <FiLock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Parol *
                  </label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white placeholder-gray-500 focus:ring-teal-500/50 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
                    placeholder="Parolni kiriting"
                  />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <FiPhone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Telefon raqam
                  </label>
                  <input
                    type="tel"
                    value={createForm.phoneNumber}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phoneNumber: e.target.value })
                    }
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white placeholder-gray-500 focus:ring-teal-500/50 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500'}`}
                    placeholder="+998 XX XXX XX XX"
                  />
                </div>

                <div>
                  <label className={`block text-xs sm:text-sm mb-1.5 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Rol</label>
                  <select
                    value={createForm.roleIds[0]}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, roleIds: [parseInt(e.target.value)] })
                    }
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border focus:outline-none focus:ring-2 text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] border-gray-600/30 text-white focus:ring-teal-500/50 focus:border-blue-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-blue-500'}`}
                  >
                    <option value={3} className={isDark ? 'bg-[#151515]' : 'bg-white'}>Student</option>
                    <option value={2} className={isDark ? 'bg-[#151515]' : 'bg-white'}>Admin</option>
                    <option value={1} className={isDark ? 'bg-[#151515]' : 'bg-white'}>SuperAdmin</option>
                  </select>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    onClick={() => setIsCreating(false)}
                    className={`py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-colors text-sm sm:text-base ${isDark ? 'bg-[#1a1a1a] text-gray-200 hover:bg-[#252525] border border-gray-600/30' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleCreateUser}
                    className={`flex-1 py-2.5 sm:py-3 px-4 sm:px-6 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                      isDark ? 'bg-blue-500 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FiSave className="w-4 h-4 sm:w-5 sm:h-5" />
                    Yaratish
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
