import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, addDays, startOfDay, isBefore, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { Spinner } from '../components/ui/Spinner'

function generateSlots(openTime, closeTime, durationMin, bookedTimes) {
  const slots = []
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  let current = oh * 60 + om
  const end = ch * 60 + cm
  while (current + durationMin <= end) {
    const h = String(Math.floor(current / 60)).padStart(2, '0')
    const m = String(current % 60).padStart(2, '0')
    const timeStr = `${h}:${m}`
    if (!bookedTimes.includes(timeStr)) slots.push(timeStr)
    current += durationMin
  }
  return slots
}

const STEPS = { SERVICE: 0, DATE: 1, TIME: 2, FORM: 3, CONFIRM: 4 }

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
      const { data: svcs } = await supabase.from('services').select('*').eq('business_id', biz.id).order('price')
      setServices(svcs || [])
      setLoading(false)
    }
    load()
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
      const available = generateSlots(hours.open, hours.close, selectedService.duration, bookedTimes)
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
      // Upsert client record
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
  const calEnd = endOfWeek(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0), { weekStartsOn: 1 })
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd })

  const isDayAvailable = (day) => {
    if (isBefore(startOfDay(day), startOfDay(new Date()))) return false
    const key = format(day, 'EEE').toLowerCase()
    return business?.working_hours?.[key]?.enabled
  }

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-heading text-3xl font-bold text-white mb-2">Business not found</h1>
        <p className="text-muted mb-6">The booking page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn-primary">Go home</Link>
      </div>
    </div>
  )

  if (step === STEPS.CONFIRM) return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full card text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <h2 className="font-heading text-2xl font-bold text-white mb-2">Booking confirmed!</h2>
        <p className="text-muted mb-4">
          Your appointment at <span className="text-white">{business.name}</span> is confirmed.
        </p>
        <div className="bg-bg border border-border rounded-xl p-4 text-left space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Service</span>
            <span className="text-white">{selectedService?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Date</span>
            <span className="text-white">{format(selectedDate, 'EEEE, MMMM d')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Time</span>
            <span className="text-white">{selectedTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Location</span>
            <span className="text-white">{business.address || 'Contact business'}</span>
          </div>
        </div>
        <p className="text-sm text-muted mb-4">A confirmation has been sent to <span className="text-white">{form.email}</span></p>
        <Link to="/" className="btn-secondary block text-center">Back to home</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Business header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-heading font-bold text-lg">
            {business.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="font-heading font-bold text-xl text-white">{business.name}</h1>
            {business.address && <p className="text-muted text-sm">{business.address}</p>}
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Service', 'Date', 'Time', 'Details'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 text-sm ${step >= i ? 'text-accent' : 'text-muted'}`}>
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${step > i ? 'bg-accent text-white' : step === i ? 'bg-accent/20 text-accent border border-accent/40' : 'bg-white/5'}`}>
                  {step > i ? '✓' : i + 1}
                </span>
                <span className="hidden sm:block">{s}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-px w-6 ${step > i ? 'bg-accent/40' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Service */}
        {step === STEPS.SERVICE && (
          <div>
            <h2 className="font-heading font-semibold text-white text-lg mb-4">Select a service</h2>
            <div className="space-y-3">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedService(s); setStep(STEPS.DATE) }}
                  className="w-full card hover:border-accent/40 text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white group-hover:text-accent transition-colors">{s.name}</p>
                      {s.description && <p className="text-sm text-muted mt-0.5">{s.description}</p>}
                      <p className="text-xs text-muted mt-1">{s.duration} min</p>
                    </div>
                    <span className="text-accent font-heading font-bold text-lg ml-4">€{s.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date */}
        {step === STEPS.DATE && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep(STEPS.SERVICE)} className="text-muted hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <h2 className="font-heading font-semibold text-white text-lg">Pick a date</h2>
            </div>
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <h3 className="font-heading font-semibold text-white">{format(calMonth, 'MMMM yyyy')}</h3>
                <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="p-1.5 hover:bg-white/10 rounded-lg text-muted hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                  <div key={d} className="text-center text-xs text-muted py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0.5">
                {calDays.map(day => {
                  const available = isDayAvailable(day)
                  const isSelected = selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  const isCurrentMonth = day.getMonth() === calMonth.getMonth()
                  return (
                    <button
                      key={format(day, 'yyyy-MM-dd')}
                      disabled={!available}
                      onClick={() => { setSelectedDate(day); setStep(STEPS.TIME) }}
                      className={`h-10 rounded-xl text-sm transition-all ${
                        isSelected ? 'bg-accent text-white font-semibold'
                        : available && isCurrentMonth ? 'hover:bg-accent/20 text-white'
                        : !isCurrentMonth ? 'text-gray-700 cursor-default'
                        : 'text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Time */}
        {step === STEPS.TIME && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep(STEPS.DATE)} className="text-muted hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <h2 className="font-heading font-semibold text-white text-lg">
                Available times — {format(selectedDate, 'EEE, MMM d')}
              </h2>
            </div>
            {slotsLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : slots.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-muted">No available slots for this day</p>
                <button onClick={() => setStep(STEPS.DATE)} className="text-accent text-sm hover:underline mt-2">Pick another date</button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => { setSelectedTime(slot); setStep(STEPS.FORM) }}
                    className="py-3 rounded-xl border border-border hover:border-accent bg-surface hover:bg-accent/10 text-sm font-medium text-white hover:text-accent transition-all"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Form */}
        {step === STEPS.FORM && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setStep(STEPS.TIME)} className="text-muted hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <h2 className="font-heading font-semibold text-white text-lg">Your details</h2>
            </div>

            {/* Summary */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-5 text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted">Service</span><span className="text-white">{selectedService.name}</span></div>
              <div className="flex justify-between"><span className="text-muted">Date</span><span className="text-white">{format(selectedDate, 'EEE, MMM d')}</span></div>
              <div className="flex justify-between"><span className="text-muted">Time</span><span className="text-white">{selectedTime}</span></div>
              <div className="flex justify-between"><span className="text-muted">Price</span><span className="text-accent font-semibold">€{selectedService.price}</span></div>
            </div>

            <form onSubmit={handleSubmit} className="card space-y-4">
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
                {submitting ? 'Booking…' : 'Confirm booking'}
              </button>
              <p className="text-xs text-center text-muted">By booking you agree to the cancellation policy</p>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
