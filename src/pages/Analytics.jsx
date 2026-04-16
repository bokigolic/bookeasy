import { useEffect, useState } from 'react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/DashboardLayout'
import { Skeleton } from '../components/ui/Skeleton'

/* ── SVG helpers ──────────────────────────────────────────────── */
function polarToCartesian(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}
function arcPath(cx, cy, r, startDeg, endDeg) {
  if (Math.abs(endDeg - startDeg) >= 360) endDeg = startDeg + 359.99
  const s = polarToCartesian(cx, cy, r, endDeg)
  const e = polarToCartesian(cx, cy, r, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`
}

/* ── Revenue bar chart ────────────────────────────────────────── */
function RevenueChart({ data }) {
  const max = Math.max(...data.map(d => d.revenue), 1)
  const W = 560, H = 180
  const padL = 10, padR = 10, padT = 24, padB = 28
  const chartW = W - padL - padR
  const chartH = H - padT - padB
  const slotW = chartW / data.length
  const barW = slotW * 0.55

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        {data.map((_, i) => (
          <linearGradient key={i} id={`rev-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563ff" />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.4" />
          </linearGradient>
        ))}
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padT + chartH * (1 - pct)
        return <line key={pct} x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgba(26,26,58,0.6)" strokeWidth={1} />
      })}
      {data.map((d, i) => {
        const barH = Math.max(4, (d.revenue / max) * chartH)
        const x = padL + i * slotW + (slotW - barW) / 2
        const y = padT + chartH - barH
        return (
          <g key={d.month}>
            <rect x={x} y={y} width={barW} height={barH} rx={5} fill={`url(#rev-${i})`} />
            {d.revenue > 0 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={9} fontFamily="Figtree,sans-serif">
                €{d.revenue}
              </text>
            )}
            <text x={x + barW / 2} y={H - 6} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={10} fontFamily="Figtree,sans-serif">
              {d.month}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ── Donut chart ──────────────────────────────────────────────── */
function DonutChart({ confirmed, pending, cancelled }) {
  const total = confirmed + pending + cancelled
  if (total === 0) return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[160px]">
      <circle cx={100} cy={100} r={64} fill="none" stroke="rgba(26,26,58,0.8)" strokeWidth={22} />
      <text x={100} y={96} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={13} fontFamily="Figtree,sans-serif">No data</text>
    </svg>
  )
  const segs = [
    { value: confirmed, color: '#00e87a', label: 'Confirmed' },
    { value: pending,   color: '#f59e0b', label: 'Pending' },
    { value: cancelled, color: '#ef4444', label: 'Cancelled' },
  ]
  let angle = 0
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[160px]">
      <circle cx={100} cy={100} r={64} fill="none" stroke="rgba(26,26,58,0.8)" strokeWidth={22} />
      {segs.map((s, i) => {
        if (s.value === 0) return null
        const span = (s.value / total) * 360
        const d = arcPath(100, 100, 64, angle, angle + span)
        angle += span
        return <path key={i} d={d} fill="none" stroke={s.color} strokeWidth={20} strokeLinecap="butt" />
      })}
      <text x={100} y={94} textAnchor="middle" fill="white" fontSize={26} fontWeight="bold" fontFamily="Syne,sans-serif">{total}</text>
      <text x={100} y={114} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={11} fontFamily="Figtree,sans-serif">bookings</text>
    </svg>
  )
}

/* ── Heatmap ──────────────────────────────────────────────────── */
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const SLOTS = ['Morning','Afternoon','Evening']
const slotHour = (slot) => slot === 'Morning' ? [6,12] : slot === 'Afternoon' ? [12,17] : [17,23]

function Heatmap({ bookings }) {
  const grid = {}
  DAYS.forEach(d => { grid[d] = {}; SLOTS.forEach(s => { grid[d][s] = 0 }) })

  bookings.forEach(b => {
    const day = DAYS[new Date(b.date + 'T00:00:00').getDay() === 0 ? 6 : new Date(b.date + 'T00:00:00').getDay() - 1]
    const hour = parseInt(b.time?.slice(0, 2) || '0', 10)
    const slot = SLOTS.find(s => { const [lo, hi] = slotHour(s); return hour >= lo && hour < hi }) || 'Evening'
    if (day) grid[day][slot]++
  })

  const max = Math.max(...DAYS.flatMap(d => SLOTS.map(s => grid[d][s])), 1)

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[360px]">
        <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `56px repeat(${SLOTS.length}, 1fr)` }}>
          <div />
          {SLOTS.map(s => (
            <div key={s} className="text-center text-[10px] text-muted py-1">{s}</div>
          ))}
        </div>
        {DAYS.map(day => (
          <div key={day} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `56px repeat(${SLOTS.length}, 1fr)` }}>
            <div className="text-[11px] text-muted flex items-center">{day}</div>
            {SLOTS.map(slot => {
              const count = grid[day][slot]
              const intensity = count / max
              return (
                <div
                  key={slot}
                  className="h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-150"
                  style={{
                    background: count === 0
                      ? 'rgba(26,26,58,0.4)'
                      : `rgba(37,99,255,${0.12 + intensity * 0.65})`,
                    color: count === 0 ? 'transparent' : intensity > 0.5 ? '#fff' : 'rgba(255,255,255,0.7)',
                    border: `1px solid rgba(37,99,255,${intensity * 0.3})`,
                  }}
                  title={`${day} ${slot}: ${count} booking${count !== 1 ? 's' : ''}`}
                >
                  {count > 0 ? count : ''}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Analytics page ───────────────────────────────────────────── */
export default function Analytics() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('id').eq('user_id', user.id).single()
      if (!biz) { setLoading(false); return }
      const [bRes, sRes] = await Promise.all([
        supabase.from('bookings').select('*, services(name, price)').eq('business_id', biz.id),
        supabase.from('services').select('id, name').eq('business_id', biz.id),
      ])
      setBookings(bRes.data || [])
      setServices(sRes.data || [])
      setLoading(false)
    }
    load()
  }, [user])

  /* ── Derived data ── */
  const today = new Date()

  // Revenue last 6 months
  const revenueData = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(today, 5 - i)
    const start = format(startOfMonth(d), 'yyyy-MM-dd')
    const end   = format(endOfMonth(d),   'yyyy-MM-dd')
    const revenue = bookings
      .filter(b => b.date >= start && b.date <= end && b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.services?.price || 0), 0)
    return { month: format(d, 'MMM'), revenue }
  })

  // Status breakdown
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const pending   = bookings.filter(b => b.status === 'pending').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length

  // Top services
  const serviceCount = {}
  bookings.forEach(b => {
    const name = b.services?.name || 'Unknown'
    serviceCount[name] = (serviceCount[name] || 0) + 1
  })
  const topServices = Object.entries(serviceCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxSvc = topServices[0]?.[1] || 1

  // Average booking value
  const completedBookings = bookings.filter(b => b.status !== 'cancelled' && b.services?.price)
  const avgValue = completedBookings.length
    ? (completedBookings.reduce((s, b) => s + b.services.price, 0) / completedBookings.length).toFixed(0)
    : 0

  // Total revenue (all time, non-cancelled)
  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((s, b) => s + (b.services?.price || 0), 0)

  if (loading) return (
    <DashboardLayout>
      <div className="mb-6"><Skeleton className="h-8 w-32" /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="card space-y-2"><Skeleton className="h-7 w-16" /><Skeleton className="h-3 w-24" /></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><Skeleton className="h-5 w-32 mb-4" /><Skeleton className="h-40 w-full" /></div>
        <div className="card"><Skeleton className="h-5 w-32 mb-4" /><Skeleton className="h-40 w-full" /></div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <h1 className="font-heading text-2xl font-bold text-white mb-6">Analytics</h1>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total bookings', value: bookings.length, color: '#2563ff' },
          { label: 'Total revenue',  value: `€${totalRevenue}`, color: '#00e87a' },
          { label: 'Avg booking value', value: `€${avgValue}`, color: '#00d4ff' },
          { label: 'Cancellation rate',
            value: bookings.length ? `${Math.round((cancelled / bookings.length) * 100)}%` : '0%',
            color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card no-hover" style={{ borderTop: `2px solid ${color}` }}>
            <p className="font-heading text-2xl font-extrabold text-white">{value}</p>
            <p className="text-muted text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card no-hover">
          <h2 className="font-heading font-semibold text-white text-sm mb-4">Revenue — last 6 months</h2>
          <RevenueChart data={revenueData} />
        </div>

        {/* Donut + legend */}
        <div className="card no-hover flex flex-col items-center">
          <h2 className="font-heading font-semibold text-white text-sm mb-4 self-start">Booking status</h2>
          <DonutChart confirmed={confirmed} pending={pending} cancelled={cancelled} />
          <div className="mt-4 space-y-2 self-stretch">
            {[
              { label: 'Confirmed', count: confirmed, color: '#00e87a' },
              { label: 'Pending',   count: pending,   color: '#f59e0b' },
              { label: 'Cancelled', count: cancelled, color: '#ef4444' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-muted">{label}</span>
                </div>
                <span className="font-medium text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top services */}
        <div className="card no-hover">
          <h2 className="font-heading font-semibold text-white text-sm mb-4">Top services</h2>
          {topServices.length === 0 ? (
            <p className="text-muted text-sm text-center py-8">No booking data yet</p>
          ) : (
            <div className="space-y-3">
              {topServices.map(([name, count], i) => (
                <div key={name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white font-medium truncate flex-1 mr-3">{name}</span>
                    <span className="text-sm text-muted flex-shrink-0">{count} bookings</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(26,26,58,0.8)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(count / maxSvc) * 100}%`,
                        background: i === 0
                          ? 'linear-gradient(90deg,#2563ff,#00d4ff)'
                          : `rgba(37,99,255,${0.7 - i * 0.1})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Heatmap */}
        <div className="card no-hover">
          <h2 className="font-heading font-semibold text-white text-sm mb-4">Busiest times</h2>
          <Heatmap bookings={bookings} />
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] text-muted">Less</span>
            {[0.12, 0.3, 0.5, 0.7, 0.85].map((o, i) => (
              <div key={i} className="w-4 h-4 rounded" style={{ background: `rgba(37,99,255,${o})` }} />
            ))}
            <span className="text-[10px] text-muted">More</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
