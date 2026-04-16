import { useEffect, useState } from 'react'
import { format, isToday, isThisWeek } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/DashboardLayout'
import { Badge } from '../components/ui/Badge'
import { SkeletonRow, Skeleton } from '../components/ui/Skeleton'

const FILTERS = ['All', 'Today', 'This week']

export default function Appointments() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      if (biz) {
        const { data } = await supabase
          .from('bookings')
          .select('*, services(name, price, duration)')
          .eq('business_id', biz.id)
          .order('date', { ascending: false })
          .order('time', { ascending: true })
        setBookings(data || [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  const updateStatus = async (id, status) => {
    setActionLoading(id)
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    setActionLoading(null)
  }

  const filtered = bookings.filter(b => {
    if (filter === 'Today') return isToday(new Date(b.date + 'T00:00:00'))
    if (filter === 'This week') return isThisWeek(new Date(b.date + 'T00:00:00'), { weekStartsOn: 1 })
    return true
  })

  /* ── Skeleton loading ──────────────────────────────────────── */
  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-56" rounded="rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Appointments</h1>
        <div
          className="flex items-center gap-1 rounded-xl p-1"
          style={{ background: 'rgba(13,13,31,0.8)', border: '1px solid rgba(26,26,58,0.9)' }}
        >
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={
                filter === f
                  ? { background: 'linear-gradient(135deg,#2563ff,#00d4ff)', color: '#fff', boxShadow: '0 0 12px rgba(37,99,255,0.3)' }
                  : { color: 'rgba(255,255,255,0.4)' }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card no-hover text-center py-16">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(37,99,255,0.1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: '#2563ff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="text-muted">No appointments for this period</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, idx) => (
            <div
              key={b.id}
              className="card no-hover flex flex-col sm:flex-row sm:items-center gap-4 list-item-enter"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Date / Time */}
              <div className="flex-shrink-0 w-16 text-center">
                <p className="text-xs text-muted">{format(new Date(b.date + 'T00:00:00'), 'MMM d')}</p>
                <p className="text-lg font-heading font-bold text-white">{b.time?.slice(0, 5)}</p>
              </div>

              {/* Client info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-white">{b.client_name}</p>
                  <Badge status={b.status} />
                </div>
                <p className="text-sm text-muted mt-0.5">
                  {b.services?.name}
                  {b.services?.duration && ` · ${b.services.duration} min`}
                  {b.services?.price && ` · €${b.services.price}`}
                </p>
                <p className="text-xs text-muted mt-0.5">{b.client_email}{b.client_phone && ` · ${b.client_phone}`}</p>
              </div>

              {/* Actions */}
              {b.status !== 'cancelled' && (
                <div className="flex gap-2 flex-shrink-0">
                  {b.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(b.id, 'confirmed')}
                      disabled={actionLoading === b.id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                      style={{ background: 'rgba(0,232,122,0.12)', border: '1px solid rgba(0,232,122,0.25)', color: '#00e87a' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,232,122,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,232,122,0.12)')}
                    >
                      Confirm
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(b.id, 'cancelled')}
                    disabled={actionLoading === b.id}
                    className="btn-danger text-xs active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
