import { useEffect, useState } from 'react'
import { format, isToday, isThisWeek, startOfWeek, endOfWeek, eachDayOfInterval, isBefore, startOfDay } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { DashboardLayout } from '../components/DashboardLayout'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { SkeletonRow, Skeleton } from '../components/ui/Skeleton'
import { generateSlots } from '../lib/slots'
import { sendEmail, bookingConfirmationEmail, bookingReminderEmail } from '../lib/sendEmail'

const FILTERS = ['All', 'Today', 'This week']

/* ── Overlay modal wrapper ──────────────────────────────────── */
function Modal({ onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} card no-hover step-enter overflow-y-auto`}
        style={{ maxHeight: '90vh', boxShadow: '0 0 60px rgba(37,99,255,0.15),0 32px 64px rgba(0,0,0,0.6)' }}
      >
        {children}
      </div>
    </div>
  )
}

/* ── Mini calendar for reschedule ───────────────────────────── */
function RescheduleCalendar({ business, booking, onConfirm, onClose }) {
  const [month, setMonth] = useState(new Date())
  const [date, setDate] = useState(null)
  const [slots, setSlots] = useState([])
  const [time, setTime] = useState(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const calStart = startOfWeek(new Date(month.getFullYear(), month.getMonth(), 1), { weekStartsOn: 1 })
  const calEnd   = endOfWeek(new Date(month.getFullYear(), month.getMonth() + 1, 0), { weekStartsOn: 1 })
  const calDays  = eachDayOfInterval({ start: calStart, end: calEnd })

  const isDayAvail = (day) => {
    if (isBefore(startOfDay(day), startOfDay(new Date()))) return false
    const daysOff = business?.availability?.days_off || []
    if (daysOff.includes(format(day, 'yyyy-MM-dd'))) return false
    const key = format(day, 'EEE').toLowerCase()
    return business?.working_hours?.[key]?.enabled
  }

  useEffect(() => {
    if (!date || !business) return
    const load = async () => {
      setSlotsLoading(true)
      setTime(null)
      const key = format(date, 'EEE').toLowerCase()
      const hrs = business.working_hours?.[key]
      if (!hrs?.enabled) { setSlots([]); setSlotsLoading(false); return }
      const { data: booked } = await supabase.from('bookings').select('time').eq('business_id', business.id)
        .eq('date', format(date, 'yyyy-MM-dd')).neq('status', 'cancelled').neq('id', booking.id)
      const bookedTimes = (booked || []).map(b => b.time?.slice(0, 5))
      setSlots(generateSlots(hrs.open, hrs.close, booking.services?.duration || 60, bookedTimes, business.availability || {}))
      setSlotsLoading(false)
    }
    load()
  }, [date, business, booking])

  const handleConfirm = async () => {
    if (!date || !time) return
    setSaving(true)
    await onConfirm(booking.id, format(date, 'yyyy-MM-dd'), time + ':00')
    setSaving(false)
  }

  return (
    <Modal onClose={onClose} wide>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-bold text-lg text-white">Reschedule booking</h2>
        <button onClick={onClose} className="text-muted hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>
      <p className="text-muted text-sm mb-5">
        Rescheduling <span className="text-white font-medium">{booking.client_name}</span> — {booking.services?.name}
      </p>

      {/* Calendar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-1.5 rounded-lg text-muted hover:text-white transition-colors" onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.06)')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <h3 className="font-heading font-semibold text-white text-sm">{format(month, 'MMMM yyyy')}</h3>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-1.5 rounded-lg text-muted hover:text-white transition-colors" onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.06)')} onMouseLeave={e=>(e.currentTarget.style.background='transparent')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <div key={d} className="text-center text-xs text-muted py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calDays.map(day => {
            const avail = isDayAvail(day)
            const sel = date && format(day, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            const inMonth = day.getMonth() === month.getMonth()
            return (
              <button key={format(day,'yyyy-MM-dd')} disabled={!avail} onClick={() => setDate(day)}
                className="cal-day h-9 rounded-xl text-sm"
                style={{
                  background: sel ? 'linear-gradient(135deg,#2563ff,#00d4ff)' : 'transparent',
                  color: sel ? '#fff' : avail && inMonth ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.18)',
                  cursor: avail ? 'pointer' : 'default',
                  boxShadow: sel ? '0 0 14px rgba(37,99,255,0.5)' : 'none',
                  fontWeight: sel ? 600 : 400,
                }}
                onMouseEnter={e => { if (avail && !sel) e.currentTarget.style.background = 'rgba(37,99,255,0.18)' }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}
              >
                {format(day,'d')}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {date && (
        <div className="mb-5">
          <p className="text-sm font-medium text-white mb-3">{format(date,'EEEE, MMMM d')}</p>
          {slotsLoading ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : slots.length === 0 ? (
            <p className="text-muted text-sm text-center py-4">No available slots this day</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map(slot => (
                <button key={slot} onClick={() => setTime(slot)}
                  className="py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{
                    background: time === slot ? 'linear-gradient(135deg,#2563ff,#00d4ff)' : 'rgba(13,13,31,0.8)',
                    border: time === slot ? 'none' : '1px solid rgba(26,26,58,0.9)',
                    color: time === slot ? '#fff' : 'rgba(255,255,255,0.7)',
                    boxShadow: time === slot ? '0 0 14px rgba(37,99,255,0.4)' : 'none',
                  }}
                  onMouseEnter={e => { if (time !== slot) { e.currentTarget.style.borderColor='rgba(37,99,255,0.4)'; e.currentTarget.style.color='#00d4ff' }}}
                  onMouseLeave={e => { if (time !== slot) { e.currentTarget.style.borderColor='rgba(26,26,58,0.9)'; e.currentTarget.style.color='rgba(255,255,255,0.7)' }}}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={handleConfirm} disabled={!date || !time || saving} className="btn-primary flex-1">
          {saving ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" /> Saving…</span> : 'Confirm reschedule'}
        </button>
        <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
      </div>
    </Modal>
  )
}

/* ── Booking detail modal ───────────────────────────────────── */
function DetailModal({ booking, business, onClose, onUpdateStatus, onSaveNotes, onRemind, onReschedule }) {
  const [notes, setNotes] = useState(booking.internal_notes || '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [sendingEmail, setSendingEmail] = useState(false)

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    await onSaveNotes(booking.id, notes)
    setSavingNotes(false)
  }

  const handleStatus = async (status) => {
    setActionLoading(status)
    await onUpdateStatus(booking.id, status)
    setActionLoading(null)
  }

  const handleRemind = async () => {
    setSendingEmail(true)
    await onRemind(booking)
    setSendingEmail(false)
  }

  const infoRow = (label, value) => value ? (
    <div className="flex justify-between text-sm py-2" style={{ borderBottom: '1px solid rgba(26,26,58,0.6)' }}>
      <span className="text-muted">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  ) : null

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-bold text-lg text-white">Booking details</h2>
        <button onClick={onClose} className="text-muted hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      {/* Client header */}
      <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{ background: 'rgba(37,99,255,0.06)', border: '1px solid rgba(37,99,255,0.12)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,rgba(37,99,255,0.3),rgba(0,212,255,0.2))', color: '#00d4ff' }}>
          {booking.client_name?.[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{booking.client_name}</p>
          <p className="text-sm text-muted truncate">{booking.client_email}</p>
        </div>
        <Badge status={booking.status} />
      </div>

      {/* Info */}
      <div className="mb-5">
        {infoRow('Service', booking.services?.name)}
        {infoRow('Duration', booking.services?.duration ? `${booking.services.duration} min` : null)}
        {infoRow('Price', booking.services?.price ? `€${booking.services.price}` : null)}
        {infoRow('Date', booking.date)}
        {infoRow('Time', booking.time?.slice(0, 5))}
        {infoRow('Phone', booking.client_phone)}
      </div>

      {/* Internal notes */}
      <div className="mb-5">
        <label className="label">Internal notes (staff only)</label>
        <textarea
          className="input resize-none"
          rows={3}
          placeholder="Add notes about this appointment…"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <button
          onClick={handleSaveNotes}
          disabled={savingNotes || notes === (booking.internal_notes || '')}
          className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
          style={{ background: 'rgba(37,99,255,0.12)', color: '#60a5fa', border: '1px solid rgba(37,99,255,0.2)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,255,0.22)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(37,99,255,0.12)')}
        >
          {savingNotes ? 'Saving…' : 'Save notes'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {booking.status === 'pending' && (
          <button onClick={() => handleStatus('confirmed')} disabled={actionLoading === 'confirmed'}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-1"
            style={{ background: 'rgba(0,232,122,0.12)', border: '1px solid rgba(0,232,122,0.25)', color: '#00e87a' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,232,122,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,232,122,0.12)')}>
            {actionLoading === 'confirmed' ? '…' : 'Confirm'}
          </button>
        )}
        {booking.status !== 'cancelled' && (
          <>
            <button onClick={() => onReschedule(booking)} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-1"
              style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.22)', color: '#60a5fa' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(37,99,255,0.1)')}>
              Reschedule
            </button>
            <button onClick={handleRemind} disabled={sendingEmail}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex-1"
              style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.22)', color: '#c084fc' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.1)')}>
              {sendingEmail ? '…' : 'Send reminder'}
            </button>
            <button onClick={() => handleStatus('cancelled')} disabled={actionLoading === 'cancelled'}
              className="btn-danger text-xs flex-1">
              {actionLoading === 'cancelled' ? '…' : 'Cancel'}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}

/* ── Main component ─────────────────────────────────────────── */
export default function Appointments() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [bookings, setBookings] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [actionLoading, setActionLoading] = useState(null)
  const [detailBooking, setDetailBooking] = useState(null)
  const [rescheduleBooking, setRescheduleBooking] = useState(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      if (biz) {
        const { data } = await supabase.from('bookings')
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
    if (detailBooking?.id === id) setDetailBooking(prev => ({ ...prev, status }))

    // Send confirmation email if API key configured
    if (status === 'confirmed' && business?.resend_api_key) {
      const booking = bookings.find(b => b.id === id)
      if (booking) {
        const { subject, html } = bookingConfirmationEmail({
          clientName: booking.client_name,
          businessName: business.name,
          serviceName: booking.services?.name,
          date: booking.date,
          time: booking.time?.slice(0, 5),
          address: business.address,
        })
        const result = await sendEmail({ to: booking.client_email, subject, html, apiKey: business.resend_api_key })
        if (result.success) showToast('Confirmation email sent', 'success')
      }
    }
    setActionLoading(null)
  }

  const handleSaveNotes = async (id, notes) => {
    await supabase.from('bookings').update({ internal_notes: notes }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, internal_notes: notes } : b))
    if (detailBooking?.id === id) setDetailBooking(prev => ({ ...prev, internal_notes: notes }))
    showToast('Notes saved', 'success')
  }

  const handleRemind = async (booking) => {
    if (business?.resend_api_key) {
      const { subject, html } = bookingReminderEmail({
        clientName: booking.client_name,
        businessName: business.name,
        serviceName: booking.services?.name,
        date: booking.date,
        time: booking.time?.slice(0, 5),
      })
      const result = await sendEmail({ to: booking.client_email, subject, html, apiKey: business.resend_api_key })
      if (result.success) showToast('Reminder sent!', 'success')
      else showToast(`Send failed: ${result.error}`, 'error')
    } else {
      // Fallback: mailto
      const subject = encodeURIComponent(`Reminder: Your appointment on ${booking.date}`)
      const body = encodeURIComponent(
        `Hi ${booking.client_name},\n\nReminder for your appointment:\nService: ${booking.services?.name}\nDate: ${booking.date}\nTime: ${booking.time?.slice(0, 5)}\n\nSee you soon!`
      )
      window.open(`mailto:${booking.client_email}?subject=${subject}&body=${body}`)
    }
  }

  const handleReschedule = async (id, date, time) => {
    await supabase.from('bookings').update({ date, time }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, date, time } : b))
    if (detailBooking?.id === id) setDetailBooking(prev => ({ ...prev, date, time }))
    setRescheduleBooking(null)
    setDetailBooking(null)
    showToast('Booking rescheduled', 'success')
  }

  const filtered = bookings.filter(b => {
    if (filter === 'Today') return isToday(new Date(b.date + 'T00:00:00'))
    if (filter === 'This week') return isThisWeek(new Date(b.date + 'T00:00:00'), { weekStartsOn: 1 })
    return true
  })

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-56" rounded="rounded-xl" />
      </div>
      <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Appointments</h1>
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(13,13,31,0.8)', border: '1px solid rgba(26,26,58,0.9)' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={filter === f
                ? { background: 'linear-gradient(135deg,#2563ff,#00d4ff)', color: '#fff', boxShadow: '0 0 12px rgba(37,99,255,0.3)' }
                : { color: 'rgba(255,255,255,0.4)' }}>
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
            <div key={b.id} className="card no-hover flex flex-col sm:flex-row sm:items-center gap-4 list-item-enter"
              style={{ animationDelay: `${idx * 50}ms` }}>
              {/* Date/Time */}
              <div className="flex-shrink-0 w-16 text-center">
                <p className="text-xs text-muted">{format(new Date(b.date + 'T00:00:00'), 'MMM d')}</p>
                <p className="text-lg font-heading font-bold text-white">{b.time?.slice(0, 5)}</p>
              </div>

              {/* Client info */}
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setDetailBooking(b)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-white hover:text-accent transition-colors">{b.client_name}</p>
                  <Badge status={b.status} />
                  {b.internal_notes && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc' }}>note</span>
                  )}
                </div>
                <p className="text-sm text-muted mt-0.5">{b.services?.name}{b.services?.duration && ` · ${b.services.duration} min`}{b.services?.price && ` · €${b.services.price}`}</p>
                <p className="text-xs text-muted mt-0.5">{b.client_email}{b.client_phone && ` · ${b.client_phone}`}</p>
              </div>

              {/* Quick actions */}
              {b.status !== 'cancelled' && (
                <div className="flex gap-2 flex-shrink-0">
                  {b.status === 'pending' && (
                    <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={actionLoading === b.id}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                      style={{ background: 'rgba(0,232,122,0.12)', border: '1px solid rgba(0,232,122,0.25)', color: '#00e87a' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,232,122,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,232,122,0.12)')}>
                      Confirm
                    </button>
                  )}
                  <button onClick={() => setDetailBooking(b)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                    Details
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detailBooking && (
        <DetailModal
          booking={detailBooking}
          business={business}
          onClose={() => setDetailBooking(null)}
          onUpdateStatus={updateStatus}
          onSaveNotes={handleSaveNotes}
          onRemind={handleRemind}
          onReschedule={(b) => { setRescheduleBooking(b); setDetailBooking(null) }}
        />
      )}

      {/* Reschedule modal */}
      {rescheduleBooking && (
        <RescheduleCalendar
          business={business}
          booking={rescheduleBooking}
          onConfirm={handleReschedule}
          onClose={() => setRescheduleBooking(null)}
        />
      )}
    </DashboardLayout>
  )
}
