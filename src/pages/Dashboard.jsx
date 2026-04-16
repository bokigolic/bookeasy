import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/DashboardLayout'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'

/* ─── Count-up hook ──────────────────────────────────────────── */
function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (typeof target !== 'number' || target === 0) {
      setValue(target)
      return
    }
    let raf
    const startTime = performance.now()
    const update = (now) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) raf = requestAnimationFrame(update)
      else setValue(target)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

/* ─── Stat card ──────────────────────────────────────────────── */
function StatCard({ label, rawValue, prefix = '', suffix = '', accentColor, icon, delay = 0 }) {
  const counted = useCountUp(typeof rawValue === 'number' ? rawValue : 0, 900)
  const display = typeof rawValue === 'number' ? `${prefix}${counted}${suffix}` : rawValue

  return (
    <div
      className="card animate-count-in relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
      style={{
        borderTop: `2px solid ${accentColor}`,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 left-0 right-0 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accentColor}18 0%, transparent 70%)`,
        }}
      />
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${accentColor}18`, color: accentColor }}
      >
        {icon}
      </div>
      <p className="font-heading text-2xl font-extrabold text-white">{display}</p>
      <p className="text-muted text-xs mt-0.5">{label}</p>
    </div>
  )
}

const statIcons = {
  today: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  week: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  revenue: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  total: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
}

/* ─── Dashboard ──────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      if (biz) {
        const { data: bks } = await supabase.from('bookings').select('*, services(name, price)').eq('business_id', biz.id).order('date', { ascending: true })
        setBookings(bks || [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  const todayBookings = bookings.filter(b => b.date === format(today, 'yyyy-MM-dd'))
  const weekBookings = bookings.filter(b => {
    const d = new Date(b.date)
    return d >= weekStart && d <= weekEnd
  })
  const weekRevenue = weekBookings.reduce((sum, b) => sum + (b.services?.price || 0), 0)
  const bookingDates = [...new Set(bookings.map(b => b.date))]

  const calendarStart = startOfWeek(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0), { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64"><Spinner /></div>
    </DashboardLayout>
  )

  const greeting = today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Good {greeting} 👋
          </h1>
          <p className="text-muted text-sm mt-0.5">{format(today, 'EEEE, MMMM d')}</p>
        </div>
        <Link to="/appointments" className="btn-primary text-sm">
          + New appointment
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Today's bookings"
          rawValue={todayBookings.length}
          accentColor="#2563ff"
          icon={statIcons.today}
          delay={0}
        />
        <StatCard
          label="This week"
          rawValue={weekBookings.length}
          accentColor="#00d4ff"
          icon={statIcons.week}
          delay={80}
        />
        <StatCard
          label="Week revenue"
          rawValue={weekRevenue}
          prefix="€"
          accentColor="#00e87a"
          icon={statIcons.revenue}
          delay={160}
        />
        <StatCard
          label="Total bookings"
          rawValue={bookings.length}
          accentColor="#a855f7"
          icon={statIcons.total}
          delay={240}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's appointments */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-white">Today&apos;s appointments</h2>
            <Link
              to="/appointments"
              className="text-xs font-medium transition-colors"
              style={{ color: '#00d4ff' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              View all →
            </Link>
          </div>
          {todayBookings.length === 0 ? (
            <div className="text-center py-12">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{ background: 'rgba(37,99,255,0.1)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: '#2563ff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-muted text-sm">No appointments today</p>
              <Link to="/appointments" className="text-sm hover:underline mt-1 inline-block" style={{ color: '#2563ff' }}>
                Create one →
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayBookings.map((b, i) => {
                const colors = ['#2563ff', '#00d4ff', '#00e87a', '#a855f7', '#f59e0b']
                const lineColor = colors[i % colors.length]
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-4 p-3 rounded-xl transition-colors"
                    style={{
                      background: 'rgba(5,5,15,0.6)',
                      border: '1px solid rgba(26,26,58,0.8)',
                      borderLeft: `3px solid ${lineColor}`,
                    }}
                  >
                    <div className="w-12 text-center flex-shrink-0">
                      <p className="text-[10px] text-muted uppercase tracking-wide">time</p>
                      <p className="text-sm font-semibold text-white font-heading">{b.time?.slice(0, 5)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{b.client_name}</p>
                      <p className="text-xs text-muted">{b.services?.name || 'Service'}</p>
                    </div>
                    <Badge status={b.status} />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Mini Calendar */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-white text-sm">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-0.5">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                className="p-1.5 rounded-lg transition-colors text-muted hover:text-white"
                style={{ ':hover': { background: 'rgba(255,255,255,0.06)' } }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                className="p-1.5 rounded-lg transition-colors text-muted hover:text-white"
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-muted py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const hasBooking = bookingDates.includes(dateStr)
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth()
              const isSelected = isSameDay(day, selectedDate)
              const isTodayDay = isToday(day)

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(day)}
                  className="relative h-8 w-full rounded-lg text-xs flex items-center justify-center transition-all duration-150"
                  style={{
                    background: isSelected
                      ? 'linear-gradient(135deg,#2563ff,#00d4ff)'
                      : isTodayDay
                      ? 'rgba(37,99,255,0.18)'
                      : hasBooking && isCurrentMonth
                      ? 'rgba(0,212,255,0.08)'
                      : 'transparent',
                    color: isSelected
                      ? '#fff'
                      : isTodayDay
                      ? '#00d4ff'
                      : isCurrentMonth
                      ? 'rgba(255,255,255,0.8)'
                      : 'rgba(255,255,255,0.18)',
                    boxShadow: isSelected ? '0 0 12px rgba(37,99,255,0.4)' : 'none',
                  }}
                >
                  {format(day, 'd')}
                  {/* Booking indicator: gradient pill */}
                  {hasBooking && !isSelected && isCurrentMonth && (
                    <span
                      className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-3 rounded-full"
                      style={{ background: 'linear-gradient(90deg,#2563ff,#00d4ff)' }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Week bar chart */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(26,26,58,0.8)' }}>
            <p className="text-[10px] text-muted uppercase tracking-wider mb-2.5">This week</p>
            <div className="flex items-end gap-1 h-10">
              {weekDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const count = bookings.filter(b => b.date === dateStr).length
                const isT = isToday(day)
                return (
                  <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-md transition-all duration-500"
                      style={{
                        height: `${Math.max(4, count * 14)}px`,
                        background: count > 0
                          ? isT
                            ? 'linear-gradient(180deg,#2563ff,#00d4ff)'
                            : 'rgba(37,99,255,0.3)'
                          : 'rgba(255,255,255,0.05)',
                        boxShadow: count > 0 && isT ? '0 0 8px rgba(37,99,255,0.4)' : 'none',
                      }}
                    />
                    <p className="text-[9px] text-muted">{format(day, 'EEE')[0]}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
