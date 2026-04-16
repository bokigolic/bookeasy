import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { DashboardLayout } from '../components/DashboardLayout'
import { Spinner } from '../components/ui/Spinner'

export default function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('*').eq('user_id', user.id).single()
      setBusiness(biz)
      if (biz) {
        const { data } = await supabase
          .from('clients')
          .select('*')
          .eq('business_id', biz.id)
          .order('total_visits', { ascending: false })
        setClients(data || [])
      }
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  const avatarColor = (name) => {
    const colors = ['bg-blue-500/20 text-blue-400', 'bg-purple-500/20 text-purple-400', 'bg-green-500/20 text-green-400', 'bg-yellow-500/20 text-yellow-400', 'bg-pink-500/20 text-pink-400']
    const i = name?.charCodeAt(0) % colors.length || 0
    return colors[i]
  }

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64"><Spinner /></div></DashboardLayout>

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Clients</h1>
        <span className="text-muted text-sm">{clients.length} total</span>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="input pl-10"
          placeholder="Search clients by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <p className="text-muted">{search ? 'No clients match your search' : 'No clients yet'}</p>
          <p className="text-muted text-xs mt-1">Clients appear here after their first booking</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="divide-y divide-border">
            {filtered.map(c => (
              <div key={c.id} className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColor(c.name)}`}>
                  {initials(c.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{c.name}</p>
                  <p className="text-xs text-muted mt-0.5">{c.email}{c.phone && ` · ${c.phone}`}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold text-white">{c.total_visits}</p>
                  <p className="text-xs text-muted">{c.total_visits === 1 ? 'visit' : 'visits'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
