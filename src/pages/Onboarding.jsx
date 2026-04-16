import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/ui/Spinner'

const STEPS = ['Business info', 'Add a service', 'Working hours']
const CATEGORIES = ['Salon', 'Barbershop', 'Spa & Wellness', 'Fitness & Gym', 'Medical', 'Dental', 'Consulting', 'Beauty', 'Photography', 'Other']

const DEFAULT_HOURS = {
  mon: { open: '09:00', close: '17:00', enabled: true },
  tue: { open: '09:00', close: '17:00', enabled: true },
  wed: { open: '09:00', close: '17:00', enabled: true },
  thu: { open: '09:00', close: '17:00', enabled: true },
  fri: { open: '09:00', close: '17:00', enabled: true },
  sat: { open: '10:00', close: '14:00', enabled: false },
  sun: { open: '10:00', close: '14:00', enabled: false },
}
const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

function ProgressBar({ step }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className="flex items-center gap-2 flex-shrink-0">
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
            <span className="text-xs font-medium hidden sm:block transition-colors duration-300"
              style={{ color: step >= i ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)' }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px relative overflow-hidden" style={{ background: 'rgba(26,26,58,0.9)' }}>
              <div className="absolute inset-y-0 left-0 transition-all duration-500"
                style={{ width: step > i ? '100%' : '0%', background: 'linear-gradient(90deg,#2563ff,#00d4ff)' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function Onboarding() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)

  const [bizForm, setBizForm] = useState({ name: '', category: '', phone: '', slug: '' })
  const [serviceForm, setServiceForm] = useState({ name: '', duration: 60, price: '' })
  const [hours, setHours] = useState(DEFAULT_HOURS)

  const setBiz = (field, val) => setBizForm(p => ({ ...p, [field]: val }))
  const setSvc = (field, val) => setServiceForm(p => ({ ...p, [field]: val }))
  const setDay = (key, field, val) => setHours(p => ({ ...p, [key]: { ...p[key], [field]: val } }))

  const handleFinish = async () => {
    if (!bizForm.name || !bizForm.slug) {
      showToast('Please fill in business name and URL slug', 'error')
      return
    }
    setSaving(true)
    try {
      // Upsert business
      const { data: biz, error: bizErr } = await supabase.from('businesses')
        .upsert({ user_id: user.id, name: bizForm.name, category: bizForm.category, phone: bizForm.phone, slug: bizForm.slug, working_hours: hours }, { onConflict: 'user_id' })
        .select().single()
      if (bizErr) throw bizErr

      // Add first service
      if (serviceForm.name && biz) {
        await supabase.from('services').insert({
          business_id: biz.id,
          name: serviceForm.name,
          duration: Number(serviceForm.duration),
          price: Number(serviceForm.price) || 0,
        })
      }

      localStorage.setItem(`be_onboarded_${user.id}`, '1')
      showToast('Welcome to BookEasy!', 'success')
      navigate('/dashboard')
    } catch (err) {
      showToast(err.message || 'Setup failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#05050f' }}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563ff,#00d4ff)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="font-heading font-bold text-xl text-gradient">BookEasy</span>
        </div>

        <div className="card no-hover step-enter">
          <h1 className="font-heading text-2xl font-bold text-white mb-1">Welcome to BookEasy!</h1>
          <p className="text-muted text-sm mb-6">Let's set up your business in {STEPS.length} quick steps</p>

          <ProgressBar step={step} />

          {/* Step 0 — Business info */}
          {step === 0 && (
            <div className="space-y-4 step-enter">
              <div>
                <label className="label">Business name *</label>
                <input className="input" placeholder="e.g. Salon Luxe" value={bizForm.name}
                  onChange={e => setBiz('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={bizForm.category} onChange={e => setBiz('category', e.target.value)}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input className="input" placeholder="+1 555 000 0000" value={bizForm.phone}
                  onChange={e => setBiz('phone', e.target.value)} />
              </div>
              <div>
                <label className="label">Booking URL slug *</label>
                <div className="flex items-center gap-0">
                  <span className="px-3 py-3 border border-r-0 rounded-l-xl text-muted text-sm flex-shrink-0"
                    style={{ background: 'rgba(26,26,58,0.5)', borderColor: 'rgba(26,26,58,0.9)' }}>
                    /book/
                  </span>
                  <input className="input rounded-l-none" placeholder="your-business" value={bizForm.slug}
                    onChange={e => setBiz('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Add a service */}
          {step === 1 && (
            <div className="space-y-4 step-enter">
              <p className="text-muted text-sm mb-2">Add your first service. You can add more later.</p>
              <div>
                <label className="label">Service name</label>
                <input className="input" placeholder="e.g. Haircut" value={serviceForm.name}
                  onChange={e => setSvc('name', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Duration (min)</label>
                  <input type="number" min="15" step="15" className="input" value={serviceForm.duration}
                    onChange={e => setSvc('duration', e.target.value)} />
                </div>
                <div>
                  <label className="label">Price (€)</label>
                  <input type="number" min="0" step="0.01" className="input" placeholder="0" value={serviceForm.price}
                    onChange={e => setSvc('price', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Working hours */}
          {step === 2 && (
            <div className="space-y-3 step-enter">
              {DAYS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <input type="checkbox" id={`ob-${key}`} checked={hours[key]?.enabled || false}
                    onChange={e => setDay(key, 'enabled', e.target.checked)} className="accent-accent w-4 h-4 flex-shrink-0" />
                  <label htmlFor={`ob-${key}`} className={`w-24 text-sm flex-shrink-0 ${hours[key]?.enabled ? 'text-white' : 'text-muted'}`}>{label}</label>
                  {hours[key]?.enabled ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" className="input text-sm py-2 flex-1" value={hours[key]?.open || '09:00'}
                        onChange={e => setDay(key, 'open', e.target.value)} />
                      <span className="text-muted text-xs">–</span>
                      <input type="time" className="input text-sm py-2 flex-1" value={hours[key]?.close || '17:00'}
                        onChange={e => setDay(key, 'close', e.target.value)} />
                    </div>
                  ) : (
                    <span className="text-muted text-sm">Closed</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button"
                onClick={() => {
                  if (step === 0 && (!bizForm.name || !bizForm.slug)) {
                    showToast('Please fill in business name and URL slug', 'error')
                    return
                  }
                  setStep(s => s + 1)
                }}
                className="btn-primary flex-1">
                Continue
              </button>
            ) : (
              <button type="button" onClick={handleFinish} disabled={saving} className="btn-primary flex-1">
                {saving ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" />Setting up…</span> : 'Go to dashboard →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
