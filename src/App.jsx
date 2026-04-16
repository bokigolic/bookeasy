import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Spinner } from './components/ui/Spinner'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Services from './pages/Services'
import Clients from './pages/Clients'
import Settings from './pages/Settings'
import BookingPage from './pages/BookingPage'
import MyBookings from './pages/MyBookings'

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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/book/:slug" element={<BookingPage />} />

      {/* Business routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute role="business"><Dashboard /></ProtectedRoute>
      } />
      <Route path="/appointments" element={
        <ProtectedRoute role="business"><Appointments /></ProtectedRoute>
      } />
      <Route path="/services" element={
        <ProtectedRoute role="business"><Services /></ProtectedRoute>
      } />
      <Route path="/clients" element={
        <ProtectedRoute role="business"><Clients /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute role="business"><Settings /></ProtectedRoute>
      } />

      {/* Client routes */}
      <Route path="/my-bookings" element={
        <ProtectedRoute role="client"><MyBookings /></ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
