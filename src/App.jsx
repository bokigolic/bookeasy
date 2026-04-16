import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { PlanProvider } from './context/PlanContext'
import { LangProvider } from './context/LangContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { InstallBanner } from './components/InstallBanner'
import { Spinner } from './components/ui/Spinner'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Services from './pages/Services'
import Clients from './pages/Clients'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
import BookingPage from './pages/BookingPage'
import MyBookings from './pages/MyBookings'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'

function ProtectedRoute({ children, role }) {
  const { user, role: userRole, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (role && userRole !== role) {
    return <Navigate to={userRole === 'client' ? '/my-bookings' : '/dashboard'} replace />
  }
  return children
}

/* Keyboard shortcuts: N → appointments, C → clients, A → analytics */
function KeyboardShortcuts() {
  const navigate = useNavigate()
  const { user, role } = useAuth()

  useEffect(() => {
    if (!user || role !== 'business') return
    const handler = (e) => {
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'n') navigate('/appointments')
      if (e.key === 'c') navigate('/clients')
      if (e.key === 'a') navigate('/analytics')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [user, role, navigate])

  return null
}

function AppRoutes() {
  const location = useLocation()
  return (
    <>
      <KeyboardShortcuts />
      <div key={location.key} className="page-enter">
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/book/:slug" element={<BookingPage />} />
          <Route path="/onboarding" element={<ProtectedRoute role="business"><Onboarding /></ProtectedRoute>} />

          {/* Business routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="business"><Dashboard /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute role="business"><Appointments /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute role="business"><Services /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute role="business"><Clients /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute role="business"><Analytics /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute role="business"><Settings /></ProtectedRoute>} />

          {/* Client routes */}
          <Route path="/my-bookings" element={<ProtectedRoute role="client"><MyBookings /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <InstallBanner />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LangProvider>
          <AuthProvider>
            <ToastProvider>
              <NotificationsProvider>
                <PlanProvider>
                  <AppRoutes />
                </PlanProvider>
              </NotificationsProvider>
            </ToastProvider>
          </AuthProvider>
        </LangProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
