import { useEffect, useState } from 'react'
import { format, isBefore, startOfDay } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { Link, useNavigate } from 'react-router-dom'

export default function MyBookings() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, businesses(name, address, phone), services(name, duration, price)')
        .eq('client_email', user.email)
        .order('date', { ascending: false })
      setBookings(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    setCancelling(null)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const today = startOfDay(new Date())
  const upcoming = bookings.filter(b => !isBefore(new Date(b.date + 'T00:00:00'), today) && b.status !== 'cancelled')
  const past = bookings.filter(b => isBefore(new Date(b.date + 'T00:00:00'), today) || b.status === 'cancelled')

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center"><Spinner size="lg" /></div>
  )

  const BookingCard = ({ b }) => (
    <div className="card flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-shrink-0 text-center w-14">
        <p className="text-xs text-muted">{format(new Date(b.date + 'T00:00:00'), 'MMM')}</p>
        <p className="font-heading text-2xl font-bold text-white leading-none">{format(new Date(b.date + 'T00:00:00'), 'd')}</p>
        <p className="text-xs text-muted">{b.time?.slice(0, 5)}</p>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <p className="font-medium text-white">{b.businesses?.name}</p>
          <Badge status={b.status} />
        </div>
        <p className="text-sm text-muted">{b.services?.name} · {b.services?.duration} min · €{b.services?.price}</p>
        {b.businesses?.address && <p className="text-xs text-muted mt-0.5">{b.businesses.address}</p>}
      </div>
      {b.status !== 'cancelled' && !isBefore(new Date(b.date + 'T00:00:00'), today) && (
        <button
          onClick={() => handleCancel(b.id)}
          disabled={cancelling === b.id}
          className="btn-danger text-xs flex-shrink-0"
        >
          {cancelling === b.id ? '…' : 'Cancel'}
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span className="font-heading font-bold text-lg">BookEasy</span>
            </Link>
          </div>
          <button onClick={handleSignOut} className="text-sm text-muted hover:text-red-400 transition-colors">Sign out</button>
        </div>

        <h1 className="font-heading text-2xl font-bold text-white mb-6">My bookings</h1>

        {/* Upcoming */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h2>
          {upcoming.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-muted text-sm">No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map(b => <BookingCard key={b.id} b={b} />)}
            </div>
          )}
        </div>

        {/* Past */}
        {past.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Past & cancelled</h2>
            <div className="space-y-3 opacity-60">
              {past.map(b => <BookingCard key={b.id} b={b} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
