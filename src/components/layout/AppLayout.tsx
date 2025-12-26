import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { useTheme } from '@contexts/ThemeContext'

export const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100'}`}>

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <motion.div
        className={`relative z-10 min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100'}`}
        animate={{ marginLeft: isSidebarCollapsed ? 96 : 272 }}
        transition={{ duration: 0 }}
      >
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4"
        >
          <Outlet />
        </motion.main>
      </motion.div>
    </div>
  )
}
