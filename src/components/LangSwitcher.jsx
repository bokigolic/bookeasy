import { useState, useRef, useEffect } from 'react'
import { useLang } from '../context/LangContext'

const LANGS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'bs', label: 'BS', full: 'Bosanski' },
  { code: 'sr', label: 'SR', full: 'Srpski' },
]

export function LangSwitcher() {
  const { lang, changeLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGS.find(l => l.code === lang) || LANGS[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={{
          background: open ? 'rgba(37,99,255,0.15)' : 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(26,26,58,0.9)',
          color: 'rgba(255,255,255,0.7)',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.background = open ? 'rgba(37,99,255,0.15)' : 'rgba(255,255,255,0.05)')}
      >
        {current.label}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute bottom-full mb-2 right-0 step-enter"
          style={{
            background: 'rgba(13,13,31,0.98)',
            border: '1px solid rgba(26,26,58,0.9)',
            borderRadius: '12px',
            padding: '4px',
            minWidth: '120px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            zIndex: 100,
          }}
        >
          {LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => { changeLang(l.code); setOpen(false) }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                background: lang === l.code ? 'rgba(37,99,255,0.15)' : 'transparent',
                color: lang === l.code ? '#60a5fa' : 'rgba(255,255,255,0.7)',
              }}
              onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = 'transparent' }}
            >
              <span className="font-semibold text-xs w-5">{l.label}</span>
              <span>{l.full}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
