import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider, useTheme } from '@contexts/ThemeContext'
import { AuthPage } from '@pages/AuthPage'
import { EnhancedDashboard } from '@pages/EnhancedDashboard'
import { SubjectsPage } from '@pages/SubjectsPage'
import { QuestionsPage } from '@pages/QuestionsPage'
import { TestsPage } from '@pages/TestsPage'
import { ResultsPage } from '@pages/ResultsPage'
import { UsersPage } from '@pages/UsersPage'
import { ProfilePage } from '@pages/ProfilePage'
import { TopicsPage } from '@pages/TopicsPage'
import { LibraryPage } from '@pages/LibraryPage'
import { UserBalancesPage } from '@pages/UserBalancesPage'
import { BalanceSettingsPage } from '@pages/BalanceSettingsPage'
import { ChangePasswordPage } from '@pages/ChangePasswordPage'
import { MyBalancePage } from '@pages/MyBalancePage'
import { AppLayout } from '@components/layout/AppLayout'
import { ProtectedRoute } from '@components/layout/ProtectedRoute'
import { PublicRoute } from '@components/layout/PublicRoute'
import { ROUTES } from '@utils/constants'

const ToasterWithTheme = () => {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{
        top: 20,
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          color: isDark ? '#ffffff' : '#000000',
          backdropFilter: 'blur(10px)',
          border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: isDark
            ? '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(239, 68, 68, 0.1)'
            : '0 10px 40px rgba(0, 0, 0, 0.1), 0 0 20px rgba(220, 38, 38, 0.1)',
          fontSize: '14px',
          fontWeight: '500',
        },
        success: {
          iconTheme: {
            primary: '#16a34a',
            secondary: '#fff',
          },
          style: {
            border: '1px solid rgba(22, 163, 74, 0.4)',
          },
        },
        error: {
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fff',
          },
          style: {
            border: '1px solid rgba(220, 38, 38, 0.4)',
          },
        },
        loading: {
          iconTheme: {
            primary: '#dc2626',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}

function AppContent() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <Routes>
        {/* Public Route - Auth Page */}
        <Route
          path={ROUTES.AUTH}
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<EnhancedDashboard />} />
          <Route path={ROUTES.SUBJECTS} element={<SubjectsPage />} />
          <Route path={ROUTES.QUESTIONS} element={<QuestionsPage />} />
          <Route path={ROUTES.TESTS} element={<TestsPage />} />
          <Route path={ROUTES.RESULTS} element={<ResultsPage />} />
          <Route path={ROUTES.USERS} element={<UsersPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.TOPICS} element={<TopicsPage />} />
          <Route path={ROUTES.LIBRARY} element={<LibraryPage />} />
          <Route path={ROUTES.USER_BALANCES} element={<UserBalancesPage />} />
          <Route path={ROUTES.BALANCE_SETTINGS} element={<BalanceSettingsPage />} />
          <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
          <Route path={ROUTES.MY_BALANCE} element={<MyBalancePage />} />
        </Route>

        {/* Redirect any unknown routes to auth */}
        <Route path="*" element={<Navigate to={ROUTES.AUTH} replace />} />
      </Routes>

      {/* Toast Notifications */}
      <ToasterWithTheme />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  )
}

export default App
