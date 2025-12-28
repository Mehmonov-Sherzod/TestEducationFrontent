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
  FiSettings,
} from 'react-icons/fi'
import { useAuth } from '@hooks/useAuth'
import { ROUTES } from '@utils/constants'
import { cn } from '@utils/cn'
import { ThemeToggle } from '@components/shared/ThemeToggle'
import { useTheme } from '@contexts/ThemeContext'

interface NavSubItem {
  path?: string
  label: string
  action?: 'theme-toggle' | 'logout'
}

interface NavItem {
  path?: string
  label: string
  icon: React.ReactNode
  requiredPermissions?: string[]
  category?: string
  children?: NavSubItem[]
  dividerBefore?: boolean
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
      category: 'testing',
    },
    {
      path: ROUTES.RESULTS,
      label: 'Natijalar',
      icon: <FiBarChart2 size={20} />,
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
      dividerBefore: true,
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
        { path: ROUTES.MY_BALANCE, label: 'Balans' },
      ],
    },
    {
      path: ROUTES.SETTINGS,
      label: 'Sozlamalar',
      icon: <FiSettings size={20} />,
      category: 'settings',
    },
    {
      label: 'Collapse',
      icon: <FiChevronLeft size={20} />,
      category: 'collapse',
    },
  ]

  const filteredNavItems = navItems.filter((item) =>
    hasPermission(item.requiredPermissions)
  )

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 96 : 272 }}
      transition={{ duration: 0 }}
      className="fixed left-0 top-0 z-40 p-3 pb-6"
    >
      <div className={cn(
        'relative rounded-2xl border shadow-sm overflow-hidden',
        isDark
          ? 'bg-[#111111] border-gray-800'
          : 'bg-white border-gray-200'
      )}>
        <motion.div
          animate={{ width: isCollapsed ? 72 : 248 }}
          transition={{ duration: 0 }}
          className="flex flex-col"
        >
        {/* Logo Section */}
        <div className="p-4 m-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden">
          {/* Falling Snowflakes */}
          {[...Array(8)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute pointer-events-none select-none text-white/40"
              style={{
                left: `${5 + i * 12}%`,
                fontSize: `${8 + (i % 3) * 2}px`,
              }}
              initial={{ y: -10 }}
              animate={{ y: 80 }}
              transition={{
                duration: 3 + (i % 3),
                repeat: Infinity,
                delay: i * 0.3,
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
            <div
              className={cn(
                'flex items-center',
                isCollapsed ? 'justify-center' : 'gap-3'
              )}
            >
              {/* Logo */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm flex-shrink-0">
                <span className="text-white font-bold text-lg">P</span>
              </div>

              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white">
                    ProExam
                  </h1>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-white/70">
                    Test Platform
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 pb-3">
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
                  {/* Divider Line */}
                  {item.dividerBefore && (
                    <div className={cn(
                      'mb-3 mx-2',
                      isDark ? 'border-t border-gray-800' : 'border-t border-gray-200'
                    )} />
                  )}
                  {hasChildren ? (
                    // Dropdown menu item
                    <>
                      <button
                        onClick={() => setOpenDropdown(isDropdownOpen ? null : item.label)}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          'w-full group relative flex items-center rounded-xl transition-all duration-200',
                          isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                          (isActive || isDropdownOpen)
                            ? 'text-blue-500'
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
                              const isChildActive = child.path ? location.pathname === child.path : false

                              // Handle action items (theme-toggle, logout)
                              if (child.action === 'theme-toggle') {
                                return (
                                  <motion.li
                                    key="theme-toggle"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                  >
                                    <div className={cn(
                                      'flex items-center justify-between py-2 px-3 rounded-lg text-sm',
                                      isDark
                                        ? 'text-gray-400'
                                        : 'text-gray-600'
                                    )}>
                                      <div className="flex items-center gap-2">
                                        <span>{isDark ? '🌙' : '☀️'}</span>
                                        <span>{isDark ? 'Tungi' : 'Kunduzgi'} rejim</span>
                                      </div>
                                      <ThemeToggle size="sm" />
                                    </div>
                                  </motion.li>
                                )
                              }

                              if (child.action === 'logout') {
                                return (
                                  <motion.li
                                    key="logout"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                  >
                                    <button
                                      onClick={logout}
                                      className={cn(
                                        'w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors text-left',
                                        'text-red-500 hover:bg-red-500/10'
                                      )}
                                    >
                                      <FiLogOut size={14} />
                                      <span>Chiqish</span>
                                    </button>
                                  </motion.li>
                                )
                              }

                              // Regular link items
                              return (
                                <motion.li
                                  key={child.path}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                >
                                  <Link
                                    to={child.path!}
                                    className={cn(
                                      'block py-2 px-3 rounded-lg text-sm transition-colors',
                                      isChildActive
                                        ? isDark
                                          ? 'text-blue-400 bg-blue-500/10'
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
                  ) : item.category === 'collapse' ? (
                    // Collapse button
                    <button
                      onClick={onToggle}
                      title={isCollapsed ? 'Menyuni kengaytirish' : 'Menyuni yig\'ish'}
                      className={cn(
                        'w-full group relative flex items-center rounded-xl transition-all duration-200',
                        isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                        isDark
                          ? 'text-gray-400 hover:text-white hover:bg-white/5'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      {/* Icon */}
                      <span className={cn(
                        'relative transition-transform duration-200',
                        'group-hover:scale-110'
                      )}>
                        {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
                      </span>

                      {/* Label */}
                      {!isCollapsed && (
                        <span className="text-[15px] font-medium flex-1 text-left">
                          Collapse
                        </span>
                      )}
                    </button>
                  ) : (
                    // Regular menu item
                    <Link
                      to={item.path!}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        'group relative flex items-center rounded-xl transition-all duration-200',
                        isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3',
                        isActive
                          ? 'text-blue-500'
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
        <div className={cn('p-3', isCollapsed && 'px-2')}>
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
                    ? 'bg-blue-500 text-white'
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
                            ? 'bg-blue-500/20 text-blue-400'
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
        </div>
        </motion.div>
      </div>
    </motion.aside>
  )
}
