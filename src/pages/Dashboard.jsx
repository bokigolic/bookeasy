import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/DashboardLayout'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'

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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Good {today.getHours() < 12 ? 'morning' : today.getHours() < 18 ? 'afternoon' : 'evening'} 👋
          </h1>
          <p className="text-muted text-sm mt-0.5">{format(today, 'EEEE, MMMM d')}</p>
        </div>
        <Link to="/appointments" className="btn-primary text-sm">
          + New appointment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Today's bookings", value: todayBookings.length, icon: '📅' },
          { label: 'This week', value: weekBookings.length, icon: '📊' },
          { label: 'Week revenue', value: `€${weekRevenue}`, icon: '💰' },
          { label: 'Total bookings', value: bookings.length, icon: '✅' },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <p className="font-heading text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-muted text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's appointments */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-white">Today&apos;s appointments</h2>
            <Link to="/appointments" className="text-xs text-accent hover:underline">View all</Link>
          </div>
          {todayBookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted text-sm">No appointments today</p>
              <Link to="/appointments" className="text-accent text-sm hover:underline mt-1 inline-block">
                Create one →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-4 p-3 bg-bg rounded-xl border border-border">
                  <div className="w-12 text-center">
                    <p className="text-xs text-muted">time</p>
                    <p className="text-sm font-semibold text-white">{b.time?.slice(0, 5)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{b.client_name}</p>
                    <p className="text-xs text-muted">{b.services?.name || 'Service'}</p>
                  </div>
                  <Badge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mini Calendar */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-white">
              {format(selectedDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors text-muted hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs text-muted py-1">{d}</div>
            ))}
          </div>
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
                  className={`relative h-8 w-full rounded-lg text-xs flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-accent text-white'
                      : isTodayDay
                      ? 'bg-accent/20 text-accent'
                      : isCurrentMonth
                      ? 'text-gray-300 hover:bg-white/10'
                      : 'text-gray-600'
                  }`}
                >
                  {format(day, 'd')}
                  {hasBooking && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Week summary */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted mb-2">This week</p>
            <div className="flex gap-1">
              {weekDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd')
                const count = bookings.filter(b => b.date === dateStr).length
                return (
                  <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-[9px] text-muted">{format(day, 'EEE')[0]}</p>
                    <div
                      className={`w-6 rounded-md ${count > 0 ? 'bg-accent/40' : 'bg-white/5'}`}
                      style={{ height: `${Math.max(8, count * 12)}px` }}
                    />
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
