import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { DashboardLayout } from '../components/DashboardLayout'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'

const TAGS = ['', 'VIP', 'Regular', 'New']

function tagStyle(tag) {
  if (tag === 'VIP')     return { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }
  if (tag === 'Regular') return { background: 'rgba(37,99,255,0.12)',  color: '#60a5fa', border: '1px solid rgba(37,99,255,0.22)' }
  if (tag === 'New')     return { background: 'rgba(0,232,122,0.1)',   color: '#00e87a', border: '1px solid rgba(0,232,122,0.2)' }
  return null
}

const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
const AVATAR_COLORS = [
  'bg-blue-500/20 text-blue-400', 'bg-purple-500/20 text-purple-400',
  'bg-green-500/20 text-green-400', 'bg-yellow-500/20 text-yellow-400', 'bg-pink-500/20 text-pink-400',
]
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]

/* ── Client detail modal ──────────────────────────────────── */
function ClientModal({ client, businessId, onClose, onUpdate }) {
  const { showToast } = useToast()
  const [notes, setNotes]   = useState(client.notes || '')
  const [tag, setTag]       = useState(client.tag || '')
  const [bookings, setBookings] = useState([])
  const [loadingBk, setLoadingBk] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('bookings')
        .select('id, date, time, status, services(name)')
        .eq('business_id', businessId)
        .eq('client_email', client.email)
        .order('date', { ascending: false })
        .limit(5)
      setBookings(data || [])
      setLoadingBk(false)
    }
    load()
  }, [client.email, businessId])

  const handleSave = async () => {
    setSaving(true)
    await supabase.from('clients').update({ notes, tag }).eq('id', client.id)
    onUpdate(client.id, { notes, tag })
    setSaving(false)
    showToast('Client updated', 'success')
  }

  const lastVisit = bookings.find(b => b.status !== 'cancelled')
  const nextAppt  = bookings.find(b => b.status !== 'cancelled' && b.date >= format(new Date(), 'yyyy-MM-dd'))
  const ts = tagStyle(tag)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg card no-hover step-enter overflow-y-auto"
        style={{ maxHeight: '90vh', boxShadow: '0 0 60px rgba(37,99,255,0.15),0 32px 64px rgba(0,0,0,0.6)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 ${avatarColor(client.name)}`}>
              {initials(client.name)}
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg text-white">{client.name}</h2>
              <p className="text-sm text-muted">{client.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total visits',  value: client.total_visits || 0 },
            { label: 'Last visit',    value: lastVisit ? format(new Date(lastVisit.date + 'T00:00:00'), 'MMM d') : '—' },
            { label: 'Next appt',     value: nextAppt  ? format(new Date(nextAppt.date  + 'T00:00:00'), 'MMM d') : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-3 rounded-xl" style={{ background: 'rgba(5,5,15,0.7)', border: '1px solid rgba(26,26,58,0.8)' }}>
              <p className="font-heading font-bold text-white text-lg">{value}</p>
              <p className="text-muted text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tag */}
        <div className="mb-5">
          <label className="label">Client tag</label>
          <div className="flex gap-2 flex-wrap">
            {TAGS.map(t => (
              <button key={t || 'none'} type="button" onClick={() => setTag(t)}
                className="px-3 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={
                  tag === t
                    ? (tagStyle(t) || { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' })
                    : { background: 'rgba(13,13,31,0.8)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(26,26,58,0.9)' }
                }>
                {t || 'No tag'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="label">Notes & preferences</label>
          <textarea className="input resize-none" rows={3} placeholder="Allergies, preferences, special requests…"
            value={notes} onChange={e => setNotes(e.target.value)} />
        </div>

        {/* Recent bookings */}
        <div className="mb-5">
          <p className="label">Recent bookings</p>
          {loadingBk ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : bookings.length === 0 ? (
            <p className="text-muted text-sm">No bookings yet</p>
          ) : (
            <div className="space-y-2">
              {bookings.map(b => (
                <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                  style={{ background: 'rgba(5,5,15,0.6)', border: '1px solid rgba(26,26,58,0.7)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{b.services?.name || 'Service'}</p>
                    <p className="text-xs text-muted">{b.date} · {b.time?.slice(0,5)}</p>
                  </div>
                  <Badge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? <span className="flex items-center justify-center gap-2"><Spinner size="sm"/>Saving…</span> : 'Save changes'}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">Close</button>
        </div>
      </div>
    </div>
  )
}

/* ── Clients page ─────────────────────────────────────────── */
export default function Clients() {
  const { user } = useAuth()
  const [clients, setClients]   = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [detail, setDetail]     = useState(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      if (biz) {
        const { data } = await supabase.from('clients').select('*').eq('business_id', biz.id).order('total_visits', { ascending: false })
        setClients(data || [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  const handleUpdate = (id, updates) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
    if (detail?.id === id) setDetail(prev => ({ ...prev, ...updates }))
  }

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Spinner /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Clients</h1>
        <span className="text-muted text-sm">{clients.length} total</span>
      </div>

      <div className="relative mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input className="input pl-10" placeholder="Search clients by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card no-hover text-center py-16">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(37,99,255,0.1)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" style={{ color: '#2563ff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-muted">{search ? 'No clients match your search' : 'No clients yet'}</p>
          <p className="text-muted text-xs mt-1">Clients appear here after their first booking</p>
        </div>
      ) : (
        <div className="card no-hover overflow-hidden p-0">
          <div className="divide-y" style={{ borderColor: 'rgba(26,26,58,0.6)' }}>
            {filtered.map(c => {
              const ts = tagStyle(c.tag)
              return (
                <div key={c.id}
                  onClick={() => setDetail(c)}
                  className="flex items-center gap-4 p-4 cursor-pointer transition-colors"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColor(c.name)}`}>
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-white">{c.name}</p>
                      {ts && c.tag && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={ts}>{c.tag}</span>
                      )}
                      {c.notes && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(168,85,247,0.08)', color: '#c084fc' }}>note</span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">{c.email}{c.phone && ` · ${c.phone}`}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-white">{c.total_visits}</p>
                    <p className="text-xs text-muted">{c.total_visits === 1 ? 'visit' : 'visits'}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {detail && (
        <ClientModal
          client={detail}
          businessId={business?.id}
          onClose={() => setDetail(null)}
          onUpdate={handleUpdate}
        />
      )}
    </DashboardLayout>
  )
}
