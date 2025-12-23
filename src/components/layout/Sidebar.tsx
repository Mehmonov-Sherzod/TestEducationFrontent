import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiHome,
  FiBook,
  FiLayers,
  FiHelpCircle,
  FiClipboard,
  FiBarChart2,
  FiUsers,
  FiUser,
  FiLogOut,
  FiBookOpen,
  FiChevronRight,
  FiChevronLeft,
  FiChevronDown,
  FiDollarSign,
} from 'react-icons/fi'
import { useAuth } from '@hooks/useAuth'
import { ROUTES } from '@utils/constants'
import { cn } from '@utils/cn'
import { ThemeToggle } from '@components/shared/ThemeToggle'
import { useTheme } from '@contexts/ThemeContext'

interface NavSubItem {
  path: string
  label: string
}

interface NavItem {
  path?: string
  label: string
  icon: React.ReactNode
  requiredPermissions?: string[]
  category?: string
  children?: NavSubItem[]
}

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Check if user has any of the required permissions
  const hasPermission = (requiredPermissions?: string[]) => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true // No permissions required
    }

    return requiredPermissions.some(permission =>
      user?.permissions?.includes(permission)
    )
  }

  const navItems: NavItem[] = [
    {
      path: ROUTES.DASHBOARD,
      label: 'Dashboard',
      icon: <FiHome size={20} />,
      category: 'main',
    },
    {
      path: ROUTES.SUBJECTS,
      label: 'Fanlar',
      icon: <FiBook size={20} />,
      category: 'content',
    },
    {
      path: ROUTES.TOPICS,
      label: 'Mavzular',
      icon: <FiLayers size={20} />,
      category: 'content',
    },
    {
      path: ROUTES.QUESTIONS,
      label: 'Savollar',
      icon: <FiHelpCircle size={20} />,
      requiredPermissions: ['ManageQuestions'],
      category: 'content',
    },
    {
      path: ROUTES.TESTS,
      label: 'Testlar',
      icon: <FiClipboard size={20} />,
      requiredPermissions: ['ManageTests', 'TakeTest'],
      category: 'testing',
    },
    {
      path: ROUTES.RESULTS,
      label: 'Natijalar',
      icon: <FiBarChart2 size={20} />,
      requiredPermissions: ['ViewResults', 'ViewOwnResults'],
      category: 'testing',
    },
    {
      path: ROUTES.LIBRARY,
      label: 'Kutubxona',
      icon: <FiBookOpen size={20} />,
      category: 'resources',
    },
    {
      path: ROUTES.USERS,
      label: 'Foydalanuvchilar',
      icon: <FiUsers size={20} />,
      requiredPermissions: ['ManageUsersStudent', 'ManageUsers', 'ManageAdmins'],
      category: 'admin',
    },
    {
      label: 'Balans sozlamalari',
      icon: <FiDollarSign size={20} />,
      requiredPermissions: ['ManageAdmins'],
      category: 'admin',
      children: [
        { path: ROUTES.USER_BALANCES, label: 'Foydalanuvchi balanslari' },
        { path: ROUTES.BALANCE_SETTINGS, label: 'Tranzaksiya sozlamalari' },
      ],
    },
    {
      label: 'Profil sozlamalari',
      icon: <FiUser size={20} />,
      category: 'user',
      children: [
        { path: ROUTES.PROFILE, label: 'Profil' },
        { path: ROUTES.CHANGE_PASSWORD, label: 'Parolni o\'zgartirish' },
        { path: ROUTES.MY_BALANCE, label: 'Balans' },
      ],
    },
  ]

  const filteredNavItems = navItems.filter((item) =>
    hasPermission(item.requiredPermissions)
  )

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ duration: 0 }}
      className={cn(
        'fixed left-0 top-0 h-screen z-40',
        isDark
          ? 'bg-[#111111]'
          : 'bg-white'
      )}
    >

      {/* Border Line */}
      <div className={cn(
        'absolute right-0 top-0 h-full w-px',
        isDark
          ? 'bg-gradient-to-b from-transparent via-gray-700 to-transparent'
          : 'bg-gradient-to-b from-transparent via-gray-200 to-transparent'
      )} />

      <div className="relative flex flex-col h-full">
        {/* Logo Section with New Year Theme */}
        <div className="p-5 relative overflow-hidden">
          {/* Falling Snowflakes */}
          {[...Array(12)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute pointer-events-none select-none"
              style={{
                left: `${5 + i * 8}%`,
                fontSize: `${6 + (i % 4) * 2}px`,
                opacity: 0.7,
              }}
              initial={{ y: -10 }}
              animate={{ y: 100 }}
              transition={{
                duration: 4 + (i % 3),
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'linear',
              }}
            >
              ❄️
            </motion.span>
          ))}

          <div className={cn(
              'flex items-center relative z-10 w-full',
              isCollapsed ? 'justify-center' : 'gap-3'
            )}>
            <motion.div
              className={cn(
                'flex items-center',
                isCollapsed ? 'justify-center' : 'gap-3'
              )}
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {/* Logo */}
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0',
                isDark
                  ? 'bg-teal-600'
                  : 'bg-blue-600'
              )}>
                <span className="text-white font-bold text-lg">P</span>
              </div>

              {!isCollapsed && (
                <div>
                  <h1 className={cn(
                    'text-lg font-bold tracking-tight',
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>
                    ProExam
                  </h1>
                  <p className={cn(
                    'text-[10px] font-medium uppercase tracking-wider',
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  )}>
                    Test Platform
                  </p>
                </div>
              )}
            </motion.div>
          </div>


        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto scrollbar-thin">
          <ul className="space-y-1.5">
            {filteredNavItems.map((item, index) => {
              const isActive = item.path ? location.pathname === item.path :
                item.children?.some(child => location.pathname === child.path)
              const isDropdownOpen = openDropdown === item.label
              const hasChildren = item.children && item.children.length > 0

              return (
                <motion.li
                  key={item.path || item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {hasChildren ? (
                    // Dropdown menu item
                    <>
                      <button
                        onClick={() => setOpenDropdown(isDropdownOpen ? null : item.label)}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          'w-full group relative flex items-center rounded-xl transition-all duration-200',
                          isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                          isActive
                            ? isDark
                              ? 'bg-[#0d9488] text-white'
                              : 'bg-gray-100 text-gray-900'
                            : isDark
                              ? 'text-gray-400 hover:text-white hover:bg-white/5'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )}
                      >

                        {/* Icon */}
                        <span className={cn(
                          'relative transition-transform duration-200',
                          isActive ? 'scale-110' : 'group-hover:scale-110'
                        )}>
                          {item.icon}
                        </span>

                        {/* Label */}
                        {!isCollapsed && (
                          <span className={cn(
                            'text-[15px] font-medium flex-1 text-left',
                            isActive && 'font-semibold'
                          )}>
                            {item.label}
                          </span>
                        )}

                        {/* Dropdown Arrow */}
                        {!isCollapsed && (
                          <motion.span
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <FiChevronDown size={14} />
                          </motion.span>
                        )}
                      </button>

                      {/* Dropdown Children */}
                      <AnimatePresence>
                        {isDropdownOpen && !isCollapsed && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={cn(
                              'mt-1 ml-4 pl-4 border-l-2 space-y-1',
                              isDark ? 'border-gray-700/50' : 'border-gray-200'
                            )}
                          >
                            {item.children?.map((child) => {
                              const isChildActive = location.pathname === child.path
                              return (
                                <motion.li
                                  key={child.path}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <Link
                                    to={child.path}
                                    className={cn(
                                      'block py-2 px-3 rounded-lg text-sm transition-colors',
                                      isChildActive
                                        ? isDark
                                          ? 'text-teal-400 bg-teal-500/10'
                                          : 'text-gray-900 bg-gray-100'
                                        : isDark
                                          ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                    )}
                                  >
                                    {child.label}
                                  </Link>
                                </motion.li>
                              )
                            })}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    // Regular menu item
                    <Link
                      to={item.path!}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'group relative flex items-center rounded-xl transition-all duration-200',
                        isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                        isActive
                          ? isDark
                            ? 'bg-[#0d9488] text-white'
                            : 'bg-gray-100 text-gray-900'
                          : isDark
                            ? 'text-gray-400 hover:text-white hover:bg-white/5'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      {/* Icon */}
                      <span className={cn(
                        'relative transition-transform duration-200',
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      )}>
                        {item.icon}
                      </span>

                      {/* Label */}
                      {!isCollapsed && (
                        <span className={cn(
                          'text-[15px] font-medium flex-1',
                          isActive && 'font-semibold'
                        )}>
                          {item.label}
                        </span>
                      )}

                      {/* Arrow for Active */}
                      <AnimatePresence>
                        {isActive && !isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                          >
                            <FiChevronRight size={14} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  )}
                </motion.li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        <div className={cn('p-3 space-y-2', isCollapsed && 'px-2')}>
          {/* Theme Toggle Card */}
          <div className={cn(
            'rounded-xl p-3 transition-colors',
            isDark ? 'bg-white/5' : 'bg-gray-100/80',
            isCollapsed && 'p-2 flex justify-center'
          )}>
            {isCollapsed ? (
              <ThemeToggle size="sm" />
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    isDark ? 'bg-gray-700' : 'bg-white shadow-sm'
                  )}>
                    <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
                  </div>
                  <span className={cn(
                    'text-xs font-medium',
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    {isDark ? 'Tungi' : 'Kunduzgi'} rejim
                  </span>
                </div>
                <ThemeToggle size="sm" />
              </div>
            )}
          </div>

          {/* User Card */}
          <div className={cn(
            'rounded-xl p-3 transition-colors',
            isDark ? 'bg-white/5' : 'bg-gray-100/80',
            isCollapsed && 'p-2 flex justify-center'
          )}>
            <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
              {/* Avatar */}
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0',
                  isDark
                    ? 'bg-teal-600 text-white'
                    : 'bg-blue-600 text-white'
                )}
                title={isCollapsed ? user?.fullName : undefined}
              >
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    'text-sm font-semibold truncate',
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>
                    {user?.fullName || 'User'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {user?.roles?.slice(0, 1).map((role) => (
                      <span
                        key={role}
                        className={cn(
                          'text-[10px] font-medium px-1.5 py-0.5 rounded-md',
                          isDark
                            ? 'bg-teal-500/20 text-teal-400'
                            : 'bg-blue-100 text-blue-600'
                        )}
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Sidebar Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onToggle}
            title={isCollapsed ? 'Menyuni kengaytirish' : 'Menyuni yig\'ish'}
            className={cn(
              'w-full flex items-center justify-center rounded-xl font-medium transition-all',
              isDark
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200',
              isCollapsed ? 'p-2.5' : 'gap-2 px-4 py-2.5'
            )}
          >
            {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
            {!isCollapsed && <span className="text-sm">Collapse</span>}
          </motion.button>

          {/* Logout Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            title={isCollapsed ? 'Chiqish' : undefined}
            className={cn(
              'w-full flex items-center justify-center rounded-xl font-medium transition-all',
              'bg-red-500 hover:bg-red-600 text-white',
              isCollapsed ? 'p-2.5' : 'gap-2 px-4 py-2.5'
            )}
          >
            <FiLogOut size={16} />
            {!isCollapsed && <span className="text-sm">Chiqish</span>}
          </motion.button>
        </div>
      </div>
    </motion.aside>
  )
}
