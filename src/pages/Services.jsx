import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/DashboardLayout'
import { Spinner } from '../components/ui/Spinner'

const EMPTY_FORM = { name: '', duration: '', price: '', description: '' }

export default function Services() {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      if (biz) {
        const { data } = await supabase.from('services').select('*').eq('business_id', biz.id).order('created_at')
        setServices(data || [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, duration: s.duration, price: s.price, description: s.description || '' }); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!business) return
    setSaving(true)
    const payload = { ...form, duration: Number(form.duration), price: Number(form.price), business_id: business.id }
    if (editing) {
      const { data } = await supabase.from('services').update(payload).eq('id', editing.id).select().single()
      setServices(prev => prev.map(s => s.id === editing.id ? data : s))
    } else {
      const { data } = await supabase.from('services').insert(payload).select().single()
      setServices(prev => [...prev, data])
    }
    setSaving(false)
    closeForm()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    setDeleting(id)
    await supabase.from('services').delete().eq('id', id)
    setServices(prev => prev.filter(s => s.id !== id))
    setDeleting(null)
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Spinner /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Services</h1>
        <button onClick={openAdd} className="btn-primary text-sm">+ Add service</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md card">
            <h2 className="font-heading font-bold text-lg text-white mb-4">
              {editing ? 'Edit service' : 'New service'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Service name</label>
                <input className="input" placeholder="e.g. Haircut" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Duration (min)</label>
                  <input type="number" min="1" className="input" placeholder="60" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Price (€)</label>
                  <input type="number" min="0" step="0.01" className="input" placeholder="25" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Description (optional)</label>
                <textarea className="input resize-none" rows={2} placeholder="Short description…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Add service'}
                </button>
                <button type="button" onClick={closeForm} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          <p className="text-muted mb-3">No services yet</p>
          <button onClick={openAdd} className="btn-primary text-sm">Add your first service</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.id} className="card group hover:border-accent/20 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-white text-base truncate">{s.name}</h3>
                  {s.description && <p className="text-muted text-xs mt-0.5 line-clamp-2">{s.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center gap-1 text-sm text-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {s.duration} min
                </span>
                <span className="text-accent font-semibold">€{s.price}</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(s)} className="flex-1 text-xs py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-all">Edit</button>
                <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} className="flex-1 text-xs py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all">
                  {deleting === s.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
