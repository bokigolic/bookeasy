import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
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

export default function Settings() {
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', phone: '', slug: '' })
  const [hours, setHours] = useState(DEFAULT_HOURS)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      if (biz) {
        setBusiness(biz)
        setForm({ name: biz.name || '', address: biz.address || '', phone: biz.phone || '', slug: biz.slug || '' })
        setHours(biz.working_hours || DEFAULT_HOURS)
      }
      setLoading(false)
    }
    load()
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!business) return
    setSaving(true)
    await supabase.from('businesses').update({
      name: form.name,
      address: form.address,
      phone: form.phone,
      slug: form.slug,
      working_hours: hours,
    }).eq('id', business.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const setDay = (key, field, value) => {
    setHours(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Spinner /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>
        {saved && (
          <div className="flex items-center gap-1.5 text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12" /></svg>
            Saved
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business profile */}
        <div className="card">
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
                <span className="px-3 py-3 bg-border/50 border border-border border-r-0 rounded-l-xl text-muted text-sm">bookeasy.app/</span>
                <input
                  className="input rounded-l-none flex-1"
                  placeholder="your-business"
                  value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                />
              </div>
              {form.slug && (
                <p className="text-xs text-muted mt-1.5">
                  Your booking page: <span className="text-accent">bookeasy.app/{form.slug}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Working hours */}
        <div className="card">
          <h2 className="font-heading font-semibold text-white mb-4">Working hours</h2>
          <div className="space-y-3">
            {DAYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-7">
                  <input
                    type="checkbox"
                    id={`day-${key}`}
                    checked={hours[key]?.enabled || false}
                    onChange={e => setDay(key, 'enabled', e.target.checked)}
                    className="accent-accent w-4 h-4"
                  />
                </div>
                <label htmlFor={`day-${key}`} className={`w-28 text-sm ${hours[key]?.enabled ? 'text-white' : 'text-muted'}`}>
                  {label}
                </label>
                {hours[key]?.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={hours[key]?.open || '09:00'}
                      onChange={e => setDay(key, 'open', e.target.value)}
                      className="input text-sm py-2 flex-1"
                    />
                    <span className="text-muted text-sm">–</span>
                    <input
                      type="time"
                      value={hours[key]?.close || '17:00'}
                      onChange={e => setDay(key, 'close', e.target.value)}
                      className="input text-sm py-2 flex-1"
                    />
                  </div>
                ) : (
                  <span className="text-muted text-sm">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full md:w-auto px-8">
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </form>
    </DashboardLayout>
  )
}
