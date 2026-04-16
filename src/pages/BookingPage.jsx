import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, startOfDay, isBefore, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { Spinner } from '../components/ui/Spinner'
import { generateSlots } from '../lib/slots'

/* ─── Star rating ────────────────────────────────────────────── */
function Stars({ rating, size = 14, interactive = false, onRate }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width={size} height={size}
          viewBox="0 0 24 24"
          fill={(interactive ? hover || rating : rating) >= i ? '#f59e0b' : 'none'}
          stroke="#f59e0b"
          strokeWidth={1.8}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'fill 0.1s' }}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate && onRate(i)}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

/* ─── Reviews section ────────────────────────────────────────── */
function ReviewsSection({ businessId }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(10)
    setReviews(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [businessId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.rating) return
    setSubmitting(true)
    await supabase.from('reviews').insert({ business_id: businessId, reviewer_name: form.name, rating: form.rating, comment: form.comment })
    setForm({ name: '', rating: 5, comment: '' })
    setShowForm(false)
    await load()
    setSubmitting(false)
  }

  const avg = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null

  return (
    <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(26,26,58,0.8)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-heading font-semibold text-white">Reviews</h3>
          {avg && (
            <div className="flex items-center gap-1.5">
              <Stars rating={Math.round(Number(avg))} size={13} />
              <span className="text-sm font-semibold text-white">{avg}</span>
              <span className="text-muted text-xs">({reviews.length})</span>
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(v => !v)} className="text-xs font-medium px-3 py-1.5 rounded-xl transition-all"
          style={{ background: showForm ? 'rgba(37,99,255,0.2)' : 'rgba(37,99,255,0.08)', color: '#60a5fa', border: '1px solid rgba(37,99,255,0.2)' }}>
          {showForm ? 'Cancel' : '+ Leave a review'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card no-hover mb-4 space-y-3 step-enter">
          <div>
            <label className="label">Your name</label>
            <input className="input" placeholder="Jane Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Rating</label>
            <Stars rating={form.rating} size={20} interactive onRate={r => setForm(p => ({ ...p, rating: r }))} />
          </div>
          <div>
            <label className="label">Comment (optional)</label>
            <textarea className="input resize-none" rows={2} placeholder="Great experience…" value={form.comment} onChange={e => setForm(p => ({ ...p, comment: e.target.value }))} />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-4"><Spinner /></div>
      ) : reviews.length === 0 ? (
        <p className="text-muted text-sm">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="p-4 rounded-xl" style={{ background: 'rgba(5,5,15,0.6)', border: '1px solid rgba(26,26,58,0.7)' }}>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="font-medium text-white text-sm">{r.reviewer_name}</p>
                <Stars rating={r.rating} size={12} />
              </div>
              {r.comment && <p className="text-muted text-xs leading-relaxed">{r.comment}</p>}
              <p className="text-muted text-[10px] mt-1.5">{format(new Date(r.created_at), 'MMM d, yyyy')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const STEPS = { SERVICE: 0, DATE: 1, TIME: 2, FORM: 3, CONFIRM: 4 }

/* ─── Confetti burst (CSS only) ─────────────────────────────── */
const CONFETTI_COLORS = ['#2563ff', '#00d4ff', '#00e87a', '#a855f7', '#f59e0b', '#ffffff', '#ec4899']

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left:     Math.random() * 100,
      delay:    Math.random() * 0.9,
      duration: 1.4 + Math.random() * 1.2,
      width:    5 + Math.random() * 8,
      height:   3 + Math.random() * 4,
      color:    CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rStart:   Math.random() * 180 - 90,
      rEnd:     360 + Math.random() * 360,
    })),
  [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50" aria-hidden>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            background: p.color,
            '--r-start': `${p.rStart}deg`,
            '--r-end': `${p.rEnd}deg`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Animated checkmark SVG ─────────────────────────────────── */
function AnimatedCheck() {
  return (
    <svg
      viewBox="0 0 52 52"
      width="72"
      height="72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="check-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e87a" />
          <stop offset="100%" stopColor="#00d4ff" />
        </linearGradient>
      </defs>
      <circle
        className="check-circle"
        cx="26" cy="26" r="24"
        stroke="url(#check-grad)"
        strokeWidth="2"
      />
      <path
        className="check-mark"
        d="M14 27l8 8 16-16"
        stroke="url(#check-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ─── Step progress indicator ────────────────────────────────── */
function StepIndicator({ step }) {
  const labels = ['Service', 'Date', 'Time', 'Details']
  return (
    <div className="flex items-center mb-8">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center flex-1 last:flex-none">
          {/* Circle */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-full text-xs flex items-center justify-center font-semibold transition-all duration-400"
              style={
                step > i
                  ? { background: 'linear-gradient(135deg,#2563ff,#00d4ff)', color: '#fff', boxShadow: '0 0 10px rgba(37,99,255,0.5)' }
                  : step === i
                  ? { background: 'rgba(37,99,255,0.15)', color: '#2563ff', border: '1.5px solid rgba(37,99,255,0.45)' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.25)' }
              }
            >
              {step > i ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : i + 1}
            </div>
            <span
              className="text-xs font-medium hidden sm:block transition-colors duration-300"
              style={{ color: step >= i ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)' }}
            >
              {label}
            </span>
          </div>

          {/* Progress line */}
          {i < labels.length - 1 && (
            <div className="flex-1 h-px mx-3 relative overflow-hidden" style={{ background: 'rgba(26,26,58,0.9)' }}>
              <div
                className="absolute inset-y-0 left-0 transition-all duration-500 ease-out"
                style={{
                  width: step > i ? '100%' : '0%',
                  background: 'linear-gradient(90deg,#2563ff,#00d4ff)',
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── BookingPage ─────────────────────────────────────────────── */
export default function BookingPage() {
  const { slug } = useParams()
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [step, setStep] = useState(STEPS.SERVICE)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [calMonth, setCalMonth] = useState(new Date())

  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitting, setSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState(null)

  useEffect(() => {
    const load = async () => {
      const { data: biz, error } = await supabase.from('businesses').select('*').eq('slug', slug).single()
      if (error || !biz) { setNotFound(true); setLoading(false); return }
      setBusiness(biz)
      // Dynamic SEO
      document.title = `Book at ${biz.name} — BookEasy`
      const desc = document.querySelector('meta[name="description"]')
      if (desc) desc.setAttribute('content', `Book appointments at ${biz.name}. ${biz.address || ''}`)
      const { data: svcs } = await supabase.from('services').select('*').eq('business_id', biz.id).order('price')
      setServices(svcs || [])
      setLoading(false)
    }
    load()
    return () => { document.title = 'BookEasy — Accept Bookings 24/7' }
  }, [slug])

  useEffect(() => {
    if (!selectedDate || !selectedService || !business) return
    const loadSlots = async () => {
      setSlotsLoading(true)
      const dayKey = format(selectedDate, 'EEE').toLowerCase()
      const hours = business.working_hours?.[dayKey]
      if (!hours?.enabled) { setSlots([]); setSlotsLoading(false); return }
      const { data: booked } = await supabase
        .from('bookings')
        .select('time')
        .eq('business_id', business.id)
        .eq('date', format(selectedDate, 'yyyy-MM-dd'))
        .neq('status', 'cancelled')
      const bookedTimes = (booked || []).map(b => b.time?.slice(0, 5))
      const available = generateSlots(hours.open, hours.close, selectedService.duration, bookedTimes, business.availability || {})
      setSlots(available)
      setSlotsLoading(false)
    }
    loadSlots()
  }, [selectedDate, selectedService, business])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const { data, error } = await supabase.from('bookings').insert({
      business_id: business.id,
      service_id: selectedService.id,
      client_name: form.name,
      client_email: form.email,
      client_phone: form.phone,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime + ':00',
      status: 'pending',
    }).select().single()

    if (!error && data) {
      const { data: existing } = await supabase.from('clients').select('*').eq('business_id', business.id).eq('email', form.email).single()
      if (existing) {
        await supabase.from('clients').update({ total_visits: existing.total_visits + 1 }).eq('id', existing.id)
      } else {
        await supabase.from('clients').insert({ business_id: business.id, name: form.name, email: form.email, phone: form.phone, total_visits: 1 })
      }
      setBookingId(data.id)
      setStep(STEPS.CONFIRM)
    }
    setSubmitting(false)
  }

  const calStart = startOfWeek(new Date(calMonth.getFullYear(), calMonth.getMonth(), 1), { weekStartsOn: 1 })
  const calEnd   = endOfWeek(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0), { weekStartsOn: 1 })
  const calDays  = eachDayOfInterval({ start: calStart, end: calEnd })

  const isDayAvailable = (day) => {
    if (isBefore(startOfDay(day), startOfDay(new Date()))) return false
    const daysOff = business?.availability?.days_off || []
    if (daysOff.includes(format(day, 'yyyy-MM-dd'))) return false
    const key = format(day, 'EEE').toLowerCase()
    return business?.working_hours?.[key]?.enabled
  }

  /* Loading */
  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  /* Not found */
  if (notFound) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center step-enter">
        <h1 className="font-heading text-3xl font-bold text-white mb-2">Business not found</h1>
        <p className="text-muted mb-6">The booking page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn-primary">Go home</Link>
      </div>
    </div>
  )

  /* ── Confirmation screen ───────────────────────────────────── */
  if (step === STEPS.CONFIRM) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <Confetti />
      <div className="max-w-md w-full card no-hover text-center step-enter" style={{ boxShadow: '0 0 60px rgba(0,232,122,0.08), 0 32px 64px rgba(0,0,0,0.5)' }}>
        {/* Animated checkmark */}
        <div className="flex justify-center mb-5">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.2)' }}
          >
            <AnimatedCheck />
          </div>
        </div>

        <h2 className="font-heading text-2xl font-bold text-white mb-2">Booking confirmed!</h2>
        <p className="text-muted mb-5">
          Your appointment at <span className="text-white font-medium">{business.name}</span> is confirmed.
        </p>

        <div
          className="rounded-xl p-4 text-left space-y-2.5 mb-6"
          style={{ background: 'rgba(5,5,15,0.7)', border: '1px solid rgba(26,26,58,0.9)' }}
        >
          {[
            { label: 'Service',  value: selectedService?.name },
            { label: 'Date',     value: format(selectedDate, 'EEEE, MMMM d') },
            { label: 'Time',     value: selectedTime },
            { label: 'Location', value: business.address || 'Contact business' },
          ].map(row => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-muted">{row.label}</span>
              <span className="text-white font-medium">{row.value}</span>
            </div>
          ))}
        </div>

        <p className="text-sm text-muted mb-5">
          A confirmation has been sent to <span className="text-white">{form.email}</span>
        </p>
        <Link to="/" className="btn-secondary block text-center">Back to home</Link>
      </div>
    </div>
  )

  /* ── Main booking flow ─────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Business header */}
        <div className="flex items-start justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-heading font-bold text-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,rgba(37,99,255,0.3),rgba(0,212,255,0.2))', color: '#00d4ff' }}
            >
              {business.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="font-heading font-bold text-xl text-white">{business.name}</h1>
              {business.address && <p className="text-muted text-sm">{business.address}</p>}
              {business.phone && <p className="text-muted text-xs">{business.phone}</p>}
            </div>
          </div>
          <button
            onClick={async () => {
              const url = window.location.href
              if (navigator.share) {
                await navigator.share({ title: `Book at ${business.name}`, url })
              } else {
                await navigator.clipboard.writeText(url)
              }
            }}
            className="flex-shrink-0 p-2 rounded-xl text-muted hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(26,26,58,0.9)' }}
            title="Share booking page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
        </div>

        {/* Animated step indicator */}
        <StepIndicator step={step} />

        {/* ── Step 1: Service ─────────────────────────────── */}
        {step === STEPS.SERVICE && (
          <div key="service" className="step-enter">
            <h2 className="font-heading font-semibold text-white text-lg mb-4">Select a service</h2>
            <div className="space-y-3">
              {services.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep(STEPS.DATE) }}
                  className="w-full card text-left group list-item-enter"
                  style={{ animationDelay: `${i * 60}ms` }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(37,99,255,0.3)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '')}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white group-hover:text-accent transition-colors">{s.name}</p>
                      {s.description && <p className="text-sm text-muted mt-0.5">{s.description}</p>}
                      <p className="text-xs text-muted mt-1">{s.duration} min</p>
                    </div>
                    <span className="font-heading font-bold text-lg ml-4" style={{ color: '#2563ff' }}>€{s.price}</span>
                  </div>
                </button>
              ))}
            </div>
            <ReviewsSection businessId={business.id} />
          </div>
        )}

        {/* ── Step 2: Date ─────────────────────────────────── */}
        {step === STEPS.DATE && (
          <div key="date" className="step-enter">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep(STEPS.SERVICE)} className="text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <h2 className="font-heading font-semibold text-white text-lg">Pick a date</h2>
            </div>
            <div className="card no-hover">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg transition-colors text-muted hover:text-white"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h3 className="font-heading font-semibold text-white">{format(calMonth, 'MMMM yyyy')}</h3>
                <button
                  onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg transition-colors text-muted hover:text-white"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
                  <div key={d} className="text-center text-xs text-muted py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calDays.map(day => {
                  const available = isDayAvailable(day)
                  const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  const isCurrentMonth = day.getMonth() === calMonth.getMonth()
                  return (
                    <button
                      key={format(day, 'yyyy-MM-dd')}
                      disabled={!available}
                      onClick={() => { setSelectedDate(day); setStep(STEPS.TIME) }}
                      className="cal-day h-10 rounded-xl text-sm"
                      style={{
                        background: isSelected ? 'linear-gradient(135deg,#2563ff,#00d4ff)' : available && isCurrentMonth ? 'transparent' : 'transparent',
                        color: isSelected ? '#fff' : available && isCurrentMonth ? 'rgba(255,255,255,0.85)' : !isCurrentMonth ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.2)',
                        cursor: available ? 'pointer' : 'default',
                        boxShadow: isSelected ? '0 0 14px rgba(37,99,255,0.5)' : 'none',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                      onMouseEnter={e => { if (available && !isSelected) e.currentTarget.style.background = 'rgba(37,99,255,0.18)' }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Time ─────────────────────────────────── */}
        {step === STEPS.TIME && (
          <div key="time" className="step-enter">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep(STEPS.DATE)} className="text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <h2 className="font-heading font-semibold text-white text-lg">
                Available times — {format(selectedDate, 'EEE, MMM d')}
              </h2>
            </div>
            {slotsLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : slots.length === 0 ? (
              <div className="card no-hover text-center py-12">
                <p className="text-muted">No available slots for this day</p>
                <button onClick={() => setStep(STEPS.DATE)} className="mt-2 text-sm hover:underline" style={{ color: '#2563ff' }}>Pick another date</button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((slot, i) => (
                  <button
                    key={slot}
                    onClick={() => { setSelectedTime(slot); setStep(STEPS.FORM) }}
                    className="py-3 rounded-xl text-sm font-medium transition-all duration-150 active:scale-95 list-item-enter"
                    style={{
                      background: 'rgba(13,13,31,0.8)',
                      border: '1px solid rgba(26,26,58,0.9)',
                      color: 'rgba(255,255,255,0.8)',
                      animationDelay: `${i * 30}ms`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(37,99,255,0.5)'
                      e.currentTarget.style.background = 'rgba(37,99,255,0.1)'
                      e.currentTarget.style.color = '#00d4ff'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(26,26,58,0.9)'
                      e.currentTarget.style.background = 'rgba(13,13,31,0.8)'
                      e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Form ─────────────────────────────────── */}
        {step === STEPS.FORM && (
          <div key="form" className="step-enter">
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep(STEPS.TIME)} className="text-muted hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <h2 className="font-heading font-semibold text-white text-lg">Your details</h2>
            </div>

            {/* Summary */}
            <div
              className="rounded-xl p-4 mb-5 text-sm space-y-2"
              style={{ background: 'rgba(37,99,255,0.08)', border: '1px solid rgba(37,99,255,0.2)' }}
            >
              {[
                { label: 'Service', value: selectedService.name },
                { label: 'Date',    value: format(selectedDate, 'EEE, MMM d') },
                { label: 'Time',    value: selectedTime },
              ].map(r => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-muted">{r.label}</span>
                  <span className="text-white">{r.value}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-muted">Price</span>
                <span className="font-semibold" style={{ color: '#00e87a' }}>€{selectedService.price}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="card no-hover space-y-4">
              <div>
                <label className="label">Full name</label>
                <input className="input" placeholder="Jane Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Email address</label>
                <input type="email" className="input" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input type="tel" className="input" placeholder="+1 555 000 0000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" /> Booking…
                  </span>
                ) : 'Confirm booking'}
              </button>
              <p className="text-xs text-center text-muted">By booking you agree to the cancellation policy</p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
