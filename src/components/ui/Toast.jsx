import { useState, useEffect, useCallback } from 'react'

const COLORS = {
  success: {
    border: 'rgba(0,232,122,0.35)',
    glow: '0 0 24px rgba(0,232,122,0.18), 0 8px 32px rgba(0,0,0,0.45)',
    icon: '#00e87a',
    bar: 'linear-gradient(90deg,#00e87a,#00d4ff)',
  },
  error: {
    border: 'rgba(239,68,68,0.35)',
    glow: '0 0 24px rgba(239,68,68,0.18), 0 8px 32px rgba(0,0,0,0.45)',
    icon: '#ef4444',
    bar: 'linear-gradient(90deg,#ef4444,#f97316)',
  },
  info: {
    border: 'rgba(37,99,255,0.35)',
    glow: '0 0 24px rgba(37,99,255,0.18), 0 8px 32px rgba(0,0,0,0.45)',
    icon: '#2563ff',
    bar: 'linear-gradient(90deg,#2563ff,#00d4ff)',
  },
}

const ICONS = {
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
}

const DURATION = 4000

export function ToastItem({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false)
  const c = COLORS[toast.type] || COLORS.info

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onDismiss(toast.id), 320)
  }, [toast.id, onDismiss])

  useEffect(() => {
    const t = setTimeout(dismiss, DURATION - 320)
    return () => clearTimeout(t)
  }, [dismiss])

  return (
    <div
      className={exiting ? 'toast-exit' : 'toast-enter'}
      style={{
        pointerEvents: 'auto',
        background: 'rgba(13,13,31,0.96)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${c.border}`,
        boxShadow: c.glow,
        borderRadius: '14px',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minWidth: '280px',
        maxWidth: '380px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Icon */}
      <span style={{ color: c.icon }}>{ICONS[toast.type] || ICONS.info}</span>

      {/* Message */}
      <span className="text-sm text-white font-medium flex-1 leading-snug">{toast.message}</span>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        className="text-muted hover:text-white transition-colors ml-1 flex-shrink-0"
        style={{ lineHeight: 1 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] toast-progress"
        style={{ background: c.bar }}
      />
    </div>
  )
}
