import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NotFound() {
  const { user, role } = useAuth()
  const homeLink = user ? (role === 'business' ? '/dashboard' : '/my-bookings') : '/'

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: '#05050f',
        backgroundImage: 'linear-gradient(rgba(37,99,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,255,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    >
      <div className="text-center max-w-lg">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <p
            className="font-heading font-extrabold select-none"
            style={{
              fontSize: 'clamp(96px, 20vw, 160px)',
              lineHeight: 1,
              background: 'linear-gradient(135deg, rgba(37,99,255,0.15) 0%, rgba(0,212,255,0.1) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'pageEnter 0.6s cubic-bezier(0.4,0,0.2,1) both',
            }}
          >
            404
          </p>
          {/* Glow behind */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(37,99,255,0.12) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
        </div>

        <div style={{ animation: 'pageEnter 0.6s cubic-bezier(0.4,0,0.2,1) 100ms both' }}>
          <h1 className="font-heading text-2xl font-bold text-white mb-3">
            Page not found
          </h1>
          <p className="text-muted text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={homeLink} className="btn-primary">
              ← Back to home
            </Link>
            <Link to="/book" className="btn-secondary">
              View booking page
            </Link>
          </div>
        </div>

        {/* Floating dots decoration */}
        <div className="mt-12 flex justify-center gap-2" style={{ animation: 'pageEnter 0.6s cubic-bezier(0.4,0,0.2,1) 200ms both' }}>
          {['#2563ff', '#00d4ff', '#00e87a', '#a855f7'].map((color, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 6 + i * 2,
                height: 6 + i * 2,
                background: color,
                opacity: 0.4 + i * 0.1,
                animation: `bookingDotPulse ${1.5 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
