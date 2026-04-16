import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usePlan } from '../context/PlanContext'
import { DashboardLayout } from '../components/DashboardLayout'
import { Spinner } from '../components/ui/Spinner'

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

const DEFAULT_HOURS = {
  mon: { open: '09:00', close: '17:00', enabled: true },
  tue: { open: '09:00', close: '17:00', enabled: true },
  wed: { open: '09:00', close: '17:00', enabled: true },
  thu: { open: '09:00', close: '17:00', enabled: true },
  fri: { open: '09:00', close: '17:00', enabled: true },
  sat: { open: '10:00', close: '14:00', enabled: false },
  sun: { open: '10:00', close: '14:00', enabled: false },
}

const DEFAULT_AVAILABILITY = {
  break_start: '',
  break_end: '',
  buffer_minutes: 0,
  max_per_day: 0,
  days_off: [],
}

const BUFFER_OPTIONS = [
  { value: 0,  label: 'No buffer' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
]

export default function Settings() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { plan, isPro, monthlyBookings, serviceCount, FREE_BOOKING_LIMIT, FREE_SERVICE_LIMIT } = usePlan()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', phone: '', slug: '' })
  const [hours, setHours] = useState(DEFAULT_HOURS)
  const [availability, setAvailability] = useState(DEFAULT_AVAILABILITY)
  const [resendKey, setResendKey] = useState('')
  const [newDayOff, setNewDayOff] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      if (biz) {
        setBusiness(biz)
        setForm({ name: biz.name || '', address: biz.address || '', phone: biz.phone || '', slug: biz.slug || '' })
        setHours(biz.working_hours || DEFAULT_HOURS)
        setAvailability({ ...DEFAULT_AVAILABILITY, ...(biz.availability || {}) })
        setResendKey(biz.resend_api_key || '')
      }
      setLoading(false)
    }
    load()
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!business) return
    setSaving(true)
    const { error } = await supabase.from('businesses').update({
      name: form.name,
      address: form.address,
      phone: form.phone,
      slug: form.slug,
      working_hours: hours,
      availability,
      resend_api_key: resendKey,
    }).eq('id', business.id)
    setSaving(false)
    if (error) showToast('Save failed: ' + error.message, 'error')
    else showToast('Settings saved!', 'success')
  }

  const setDay = (key, field, value) => setHours(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  const setAvail = (field, value) => setAvailability(prev => ({ ...prev, [field]: value }))

  const addDayOff = () => {
    if (!newDayOff) return
    const existing = availability.days_off || []
    if (!existing.includes(newDayOff)) {
      setAvail('days_off', [...existing, newDayOff].sort())
    }
    setNewDayOff('')
  }
  const removeDayOff = (d) => setAvail('days_off', (availability.days_off || []).filter(x => x !== d))

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Spinner /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business profile */}
        <div className="card no-hover">
          <h2 className="font-heading font-semibold text-white mb-4">Business profile</h2>
          <div className="space-y-4">
            <div>
              <label className="label">Business name</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" placeholder="123 Main St, City" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+1 555 000 0000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label className="label">Booking URL slug</label>
              <div className="flex items-center gap-0">
                <span className="px-3 py-3 border border-r-0 rounded-l-xl text-muted text-sm" style={{ background: 'rgba(26,26,58,0.5)', borderColor: 'rgba(26,26,58,0.9)' }}>
                  bookeasy.app/
                </span>
                <input className="input rounded-l-none flex-1" placeholder="your-business" value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Working hours */}
        <div className="card no-hover">
          <h2 className="font-heading font-semibold text-white mb-4">Working hours</h2>
          <div className="space-y-3">
            {DAYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-7">
                  <input type="checkbox" id={`day-${key}`} checked={hours[key]?.enabled || false}
                    onChange={e => setDay(key, 'enabled', e.target.checked)} className="accent-accent w-4 h-4" />
                </div>
                <label htmlFor={`day-${key}`} className={`w-28 text-sm ${hours[key]?.enabled ? 'text-white' : 'text-muted'}`}>{label}</label>
                {hours[key]?.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={hours[key]?.open || '09:00'} onChange={e => setDay(key, 'open', e.target.value)} className="input text-sm py-2 flex-1" />
                    <span className="text-muted text-sm">–</span>
                    <input type="time" value={hours[key]?.close || '17:00'} onChange={e => setDay(key, 'close', e.target.value)} className="input text-sm py-2 flex-1" />
                  </div>
                ) : (
                  <span className="text-muted text-sm">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Availability rules */}
        <div className="card no-hover">
          <h2 className="font-heading font-semibold text-white mb-1">Availability rules</h2>
          <p className="text-muted text-xs mb-5">Breaks, buffer time, and blocked dates for your booking page</p>

          <div className="space-y-5">
            {/* Break time */}
            <div>
              <label className="label">Break / lunch time</label>
              <div className="flex items-center gap-3">
                <input type="time" className="input text-sm py-2 flex-1" placeholder="13:00"
                  value={availability.break_start}
                  onChange={e => setAvail('break_start', e.target.value)} />
                <span className="text-muted text-sm">to</span>
                <input type="time" className="input text-sm py-2 flex-1" placeholder="14:00"
                  value={availability.break_end}
                  onChange={e => setAvail('break_end', e.target.value)} />
              </div>
              <p className="text-muted text-xs mt-1.5">Bookings won&apos;t be offered during this window</p>
            </div>

            {/* Buffer */}
            <div>
              <label className="label">Buffer time between bookings</label>
              <div className="grid grid-cols-4 gap-2">
                {BUFFER_OPTIONS.map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setAvail('buffer_minutes', opt.value)}
                    className="py-2 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: availability.buffer_minutes === opt.value ? 'linear-gradient(135deg,#2563ff,#00d4ff)' : 'rgba(13,13,31,0.8)',
                      border: availability.buffer_minutes === opt.value ? 'none' : '1px solid rgba(26,26,58,0.9)',
                      color: availability.buffer_minutes === opt.value ? '#fff' : 'rgba(255,255,255,0.6)',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max per day */}
            <div>
              <label className="label">Max bookings per day</label>
              <input type="number" min="0" className="input text-sm py-2 w-32"
                placeholder="0 = unlimited"
                value={availability.max_per_day || ''}
                onChange={e => setAvail('max_per_day', Number(e.target.value))} />
              <p className="text-muted text-xs mt-1.5">Set 0 for no limit</p>
            </div>

            {/* Days off */}
            <div>
              <label className="label">Blocked dates (holidays / days off)</label>
              <div className="flex gap-2 mb-3">
                <input type="date" className="input text-sm py-2 flex-1"
                  value={newDayOff}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={e => setNewDayOff(e.target.value)} />
                <button type="button" onClick={addDayOff}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0"
                  style={{ background: 'rgba(37,99,255,0.12)', color: '#60a5fa', border: '1px solid rgba(37,99,255,0.2)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,255,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(37,99,255,0.12)')}>
                  Block date
                </button>
              </div>
              {(availability.days_off || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availability.days_off.map(d => (
                    <div key={d} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                      {d}
                      <button type="button" onClick={() => removeDayOff(d)} className="hover:text-white transition-colors ml-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-xs">No blocked dates</p>
              )}
            </div>
          </div>
        </div>

        {/* Email notifications */}
        <div className="card no-hover">
          <h2 className="font-heading font-semibold text-white mb-1">Email notifications</h2>
          <p className="text-muted text-xs mb-5">
            Configure your{' '}
            <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Resend</a>
            {' '}API key to send automated emails to clients
          </p>
          <div>
            <label className="label">Resend API key</label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                className="input flex-1"
                placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                value={resendKey}
                onChange={e => setResendKey(e.target.value)}
                autoComplete="off"
              />
              <button type="button" onClick={() => setShowKey(v => !v)}
                className="px-3 rounded-xl transition-all flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(26,26,58,0.9)', color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                {showKey ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
            <p className="text-muted text-xs mt-1.5">
              Emails are sent on booking confirmation and reminders. Get your key at <span className="text-accent">resend.com/api-keys</span>
            </p>
            {resendKey && (
              <p className="text-xs mt-1.5 flex items-center gap-1.5" style={{ color: '#00e87a' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
                API key configured
              </p>
            )}
          </div>
        </div>

        {/* Billing */}
        <div className="card no-hover">
          <h2 className="font-heading font-semibold text-white mb-1">Billing</h2>
          <p className="text-muted text-xs mb-5">Manage your plan and usage</p>

          <div className="flex items-center justify-between p-4 rounded-xl mb-4"
            style={{ background: isPro ? 'rgba(37,99,255,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isPro ? 'rgba(37,99,255,0.2)' : 'rgba(26,26,58,0.8)'}` }}>
            <div>
              <p className="font-semibold text-white">{isPro ? 'Pro plan' : 'Free plan'}</p>
              <p className="text-muted text-xs mt-0.5">{isPro ? 'Unlimited bookings & services' : `${monthlyBookings}/${FREE_BOOKING_LIMIT} bookings · ${serviceCount}/${FREE_SERVICE_LIMIT} services`}</p>
            </div>
            {isPro ? (
              <span className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(37,99,255,0.15)', color: '#60a5fa', border: '1px solid rgba(37,99,255,0.25)' }}>
                Pro
              </span>
            ) : (
              <span className="text-xs px-3 py-1 rounded-full font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Free
              </span>
            )}
          </div>

          {!isPro && (
            <div className="p-4 rounded-xl"
              style={{ background: 'linear-gradient(135deg,rgba(37,99,255,0.08) 0%,rgba(0,212,255,0.05) 100%)', border: '1px solid rgba(37,99,255,0.2)' }}>
              <p className="font-semibold text-white mb-1">Upgrade to Pro — €12/month</p>
              <ul className="text-muted text-xs space-y-1 mb-4">
                {['Unlimited bookings per month', 'Unlimited services', 'Priority support', 'Advanced analytics', 'Custom booking page branding'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" style={{ color: '#00e87a' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href="https://buy.stripe.com/bookeasy-pro" target="_blank" rel="noopener noreferrer"
                className="btn-primary inline-block text-sm py-2 px-4">
                Upgrade to Pro →
              </a>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full md:w-auto px-8">
          {saving ? <span className="flex items-center gap-2"><Spinner size="sm" /> Saving…</span> : 'Save settings'}
        </button>
      </form>
    </DashboardLayout>
  )
}
