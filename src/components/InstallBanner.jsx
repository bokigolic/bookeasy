import { useEffect, useState } from 'react'

const DISMISS_KEY = 'be_install_dismissed'

export function InstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return
    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 step-enter"
      style={{
        background: 'rgba(13,13,31,0.95)',
        border: '1px solid rgba(37,99,255,0.3)',
        borderRadius: '16px',
        padding: '16px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 0 40px rgba(37,99,255,0.15), 0 16px 40px rgba(0,0,0,0.5)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#2563ff,#00d4ff)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">Install BookEasy</p>
          <p className="text-muted text-xs mt-0.5 leading-relaxed">Add to your home screen for quick access</p>
          <div className="flex gap-2 mt-3">
            <button onClick={handleInstall} className="btn-primary text-xs py-1.5 px-3">
              Install
            </button>
            <button onClick={handleDismiss} className="text-xs text-muted hover:text-white transition-colors px-2">
              Not now
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-muted hover:text-white transition-colors flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
