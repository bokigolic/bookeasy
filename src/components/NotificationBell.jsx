import { useState, useRef, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useNotifications } from '../context/NotificationsContext'

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) markAllRead()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        className="relative p-2 rounded-xl transition-all duration-150"
        style={{ background: open ? 'rgba(37,99,255,0.15)' : 'transparent', color: 'rgba(255,255,255,0.5)' }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#2563ff,#00d4ff)', color: '#fff' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-80 step-enter overflow-hidden"
          style={{
            background: 'rgba(13,13,31,0.97)',
            border: '1px solid rgba(26,26,58,0.9)',
            borderRadius: '16px',
            boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,255,0.08)',
            backdropFilter: 'blur(20px)',
            zIndex: 100,
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(26,26,58,0.8)' }}>
            <h3 className="font-heading font-semibold text-white text-sm">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: 'rgba(37,99,255,0.08)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" style={{ color: '#2563ff' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
              </div>
              <p className="text-muted text-sm">No notifications yet</p>
              <p className="text-muted text-xs mt-0.5">New bookings will appear here</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: 'rgba(26,26,58,0.5)' }}>
              {notifications.map((n) => (
                <div key={n.id} className="flex gap-3 px-4 py-3 transition-colors" style={{ background: n.read ? 'transparent' : 'rgba(37,99,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'rgba(37,99,255,0.12)', color: '#2563ff' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white leading-snug">{n.message}</p>
                    {n.meta?.date && (
                      <p className="text-xs text-muted mt-0.5">{n.meta.date} at {n.meta.time}</p>
                    )}
                    <p className="text-[10px] text-muted mt-0.5">
                      {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
