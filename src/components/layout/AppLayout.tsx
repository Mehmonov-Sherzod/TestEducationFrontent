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
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f9fafb]'}`}>

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <motion.div
        className="relative z-10"
        animate={{ marginLeft: isSidebarCollapsed ? 80 : 256 }}
        transition={{ duration: 0 }}
      >
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto p-8"
        >
          <Outlet />
        </motion.main>
      </motion.div>
    </div>
  )
}
