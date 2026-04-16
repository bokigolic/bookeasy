import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { Badge } from './ui/Badge'
import { Spinner } from './ui/Spinner'

const LS_KEY = 'bookeasy_recent_searches'
const MAX_RECENT = 5

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ bookings: [], clients: [], services: [] })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(false)
  const [businessId, setBusinessId] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // Load business id
  useEffect(() => {
    if (!user) return
    supabase.from('businesses').select('id').eq('user_id', user.id).single()
      .then(({ data }) => { if (data) setBusinessId(data.id) })
  }, [user])

  // Load recent searches from localStorage
  useEffect(() => {
    try { setRecent(JSON.parse(localStorage.getItem(LS_KEY) || '[]')) } catch {}
  }, [])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQuery(''); setResults({ bookings: [], clients: [], services: [] }) }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (!query.trim() || !businessId) {
      setResults({ bookings: [], clients: [], services: [] })
      return
    }
    const t = setTimeout(async () => {
      setLoading(true)
      const q = query.trim()
      const [bRes, cRes, sRes] = await Promise.all([
        supabase.from('bookings').select('id,client_name,date,time,status,services(name)').eq('business_id', businessId).ilike('client_name', `%${q}%`).limit(4),
        supabase.from('clients').select('id,name,email,tag').eq('business_id', businessId).or(`name.ilike.%${q}%,email.ilike.%${q}%`).limit(4),
        supabase.from('services').select('id,name,price,duration').eq('business_id', businessId).ilike('name', `%${q}%`).limit(4),
      ])
      setResults({ bookings: bRes.data || [], clients: cRes.data || [], services: sRes.data || [] })
      setLoading(false)
    }, 220)
    return () => clearTimeout(t)
  }, [query, businessId])

  const saveRecent = useCallback((q) => {
    if (!q.trim()) return
    const updated = [q, ...recent.filter(r => r !== q)].slice(0, MAX_RECENT)
    setRecent(updated)
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
  }, [recent])

  const go = (path) => {
    saveRecent(query)
    navigate(path)
    setOpen(false)
  }

  const hasResults = results.bookings.length + results.clients.length + results.services.length > 0

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all duration-150"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(26,26,58,0.8)',
          color: 'rgba(255,255,255,0.35)',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(37,99,255,0.3)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(26,26,58,0.8)')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-md font-mono" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>/</kbd>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-start justify-center pt-[10vh] px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="w-full max-w-lg step-enter"
            style={{
              background: 'rgba(13,13,31,0.98)',
              border: '1px solid rgba(37,99,255,0.2)',
              borderRadius: '20px',
              boxShadow: '0 0 60px rgba(37,99,255,0.12), 0 32px 64px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid rgba(26,26,58,0.8)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search bookings, clients, services…"
                className="flex-1 bg-transparent text-white placeholder-muted text-sm outline-none"
              />
              {loading && <Spinner size="sm" />}
              <button onClick={() => setOpen(false)} className="text-muted hover:text-white transition-colors">
                <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>Esc</kbd>
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {/* Recent searches */}
              {!query && recent.length > 0 && (
                <div className="px-4 pt-3 pb-2">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Recent</p>
                  {recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQuery(r)}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm text-left transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-muted flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 101.5-6.1L1 10" />
                      </svg>
                      <span className="text-gray-300">{r}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {query && !loading && !hasResults && (
                <div className="px-4 py-10 text-center">
                  <p className="text-muted text-sm">No results for &ldquo;{query}&rdquo;</p>
                </div>
              )}

              {/* Bookings */}
              {results.bookings.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Bookings</p>
                  {results.bookings.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => go('/appointments')}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,255,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,99,255,0.12)', color: '#2563ff' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{b.client_name}</p>
                        <p className="text-xs text-muted">{b.services?.name} · {b.date} {b.time?.slice(0,5)}</p>
                      </div>
                      <Badge status={b.status} />
                    </button>
                  ))}
                </div>
              )}

              {/* Clients */}
              {results.clients.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Clients</p>
                  {results.clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => go('/clients')}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,255,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}
                      >
                        {c.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{c.name}</p>
                        <p className="text-xs text-muted truncate">{c.email}</p>
                      </div>
                      {c.tag && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={tagStyle(c.tag)}>{c.tag}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Services */}
              {results.services.length > 0 && (
                <div className="px-4 pt-3 pb-4">
                  <p className="text-[10px] text-muted uppercase tracking-wider mb-2">Services</p>
                  {results.services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => go('/services')}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37,99,255,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,232,122,0.1)', color: '#00e87a' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">{s.name}</p>
                        <p className="text-xs text-muted">{s.duration} min · €{s.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function tagStyle(tag) {
  if (tag === 'VIP')     return { background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }
  if (tag === 'Regular') return { background: 'rgba(37,99,255,0.12)',  color: '#60a5fa', border: '1px solid rgba(37,99,255,0.25)' }
  return { background: 'rgba(0,232,122,0.1)', color: '#00e87a', border: '1px solid rgba(0,232,122,0.2)' }
}
