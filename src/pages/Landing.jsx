import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'

/* ─── Data ────────────────────────────────────────────────────── */
const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: '24/7 Automatic Bookings',
    desc: 'Clients book while you sleep. No phone calls, no back-and-forth. Just a clean link that works.',
    color: '#2563ff',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    title: 'Automatic Reminders',
    desc: 'Email confirmations and reminders sent automatically — reduce no-shows without lifting a finger.',
    color: '#00d4ff',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Business Analytics',
    desc: 'See your weekly revenue, busiest days, and top services — all in one clean dashboard.',
    color: '#00e87a',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" strokeWidth={2.5} />
      </svg>
    ),
    title: 'Mobile First',
    desc: 'Manage appointments from any device. Your booking page works perfectly on mobile too.',
    color: '#a855f7',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Client Management',
    desc: 'Keep a complete history of every client, their visits, and preferences in one place.',
    color: '#f59e0b',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Secure & Reliable',
    desc: 'Built on Supabase with enterprise-grade security. Your data is always safe and backed up.',
    color: '#ec4899',
  },
]

const pricing = [
  {
    name: 'Free',
    price: '€0',
    period: 'forever',
    features: [
      'Up to 20 bookings / month',
      '1 service listing',
      'Basic booking page',
      'Email confirmations',
      'Client list',
    ],
    cta: 'Get started free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '€9',
    period: 'per month',
    features: [
      'Unlimited bookings',
      'Unlimited services',
      'Custom booking page',
      'SMS + email reminders',
      'Analytics dashboard',
      'Priority support',
    ],
    cta: 'Start Pro trial',
    highlighted: true,
  },
]

const brands = ['Salon Luxe', 'HealthFirst', 'Studio One', 'FitLife Pro', 'Beauté+', 'MindSpace']

/* ─── Feature card with 3-D tilt ──────────────────────────────── */
function FeatureCard({ f }) {
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const onMouseMove = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    setTilt({ x: y * 12, y: -x * 12 })
  }, [])

  const onMouseLeave = useCallback(() => setTilt({ x: 0, y: 0 }), [])

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 ? 'transform 0.55s cubic-bezier(0.16,1,0.3,1)' : 'transform 0.12s ease',
      }}
      className="glass-card reveal group cursor-default"
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ background: `${f.color}18`, color: f.color, boxShadow: `0 0 20px ${f.color}20` }}
      >
        {f.icon}
      </div>
      <h3 className="font-heading font-semibold text-white text-lg mb-2">{f.title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
    </div>
  )
}

/* ─── Landing ─────────────────────────────────────────────────── */
export default function Landing() {
  const heroRef = useRef(null)

  /* Scroll reveal via IntersectionObserver */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.reveal, .reveal-children').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-bg font-body overflow-x-hidden">

      {/* ── Navbar ───────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          background: 'rgba(5,5,15,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(26,26,58,0.6)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center animate-logo-pulse"
              style={{ background: 'linear-gradient(135deg,#2563ff,#00d4ff)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="font-heading font-bold text-lg text-gradient">BookEasy</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
              Log in
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      >
        {/* Floating orbs */}
        <div
          className="absolute pointer-events-none animate-orb-1"
          style={{
            width: 560, height: 560,
            top: '-10%', left: '-8%',
            background: 'radial-gradient(circle, rgba(37,99,255,0.18) 0%, transparent 70%)',
            filter: 'blur(80px)',
            borderRadius: '50%',
          }}
        />
        <div
          className="absolute pointer-events-none animate-orb-2"
          style={{
            width: 480, height: 480,
            top: '10%', right: '-6%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.14) 0%, transparent 70%)',
            filter: 'blur(80px)',
            borderRadius: '50%',
          }}
        />
        <div
          className="absolute pointer-events-none animate-orb-3"
          style={{
            width: 400, height: 400,
            bottom: '5%', left: '35%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
            borderRadius: '50%',
          }}
        />

        {/* Hero content */}
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7"
            style={{ background: 'rgba(37,99,255,0.12)', border: '1px solid rgba(37,99,255,0.25)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
            <span className="text-sm font-medium" style={{ color: '#00d4ff' }}>Now in public beta</span>
          </div>

          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] mb-7">
            <span className="text-gradient">Accept bookings</span>
            <br />
            <span className="text-white">24/7, automatically.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            BookEasy gives your business a beautiful booking page, automated reminders,
            and a dashboard to manage everything — in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base px-9 py-3.5">
              Start for free →
            </Link>
            <a
              href="#features"
              className="btn-secondary text-base px-9 py-3.5"
            >
              See how it works
            </a>
          </div>
          <p className="text-sm text-muted mt-4">No credit card required · Free plan available</p>

          {/* Social proof */}
          <div className="mt-14 pt-10 border-t" style={{ borderColor: 'rgba(26,26,58,0.8)' }}>
            <p className="text-xs text-muted uppercase tracking-[0.2em] mb-6">
              Trusted by 500+ businesses worldwide
            </p>
            <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
              {brands.map((b) => (
                <span
                  key={b}
                  className="font-heading font-bold text-sm transition-all duration-300 hover:scale-105"
                  style={{ color: 'rgba(255,255,255,0.18)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.18)')}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Browser mockup */}
        <div className="max-w-4xl w-full mx-auto mt-16 relative z-10">
          <div
            className="rounded-2xl p-[1px] reveal"
            style={{
              background: 'linear-gradient(135deg, rgba(37,99,255,0.3), rgba(0,212,255,0.15), rgba(26,26,58,0.3))',
              boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            <div className="bg-bg rounded-2xl overflow-hidden">
              <div
                className="flex items-center gap-1.5 px-4 py-3"
                style={{ borderBottom: '1px solid rgba(26,26,58,0.8)' }}
              >
                <span className="w-3 h-3 rounded-full bg-red-500/50" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <span className="w-3 h-3 rounded-full bg-green-500/50" />
                <span className="ml-4 text-xs text-muted">bookeasy.app/salon-lux</span>
              </div>
              <div className="grid grid-cols-3 gap-0 p-6 min-h-48">
                <div className="col-span-2 space-y-3 pr-6" style={{ borderRight: '1px solid rgba(26,26,58,0.8)' }}>
                  <div className="h-4 w-32 rounded" style={{ background: 'rgba(37,99,255,0.25)' }} />
                  <div className="h-3 w-48 bg-white/8 rounded" />
                  <div className="h-3 w-40 bg-white/8 rounded" />
                  <div className="mt-4 grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-7 rounded-lg text-[10px] flex items-center justify-center"
                        style={{
                          background: i === 14
                            ? 'linear-gradient(135deg,#2563ff,#00d4ff)'
                            : i % 7 === 0 || i % 7 === 6
                            ? 'rgba(255,255,255,0.03)'
                            : 'rgba(255,255,255,0.05)',
                          color: i === 14 ? '#fff' : i % 7 === 0 || i % 7 === 6 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)',
                        }}
                      >
                        {i + 1 <= 30 ? i + 1 : ''}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pl-6 space-y-2">
                  <div className="h-3 w-20 bg-white/8 rounded mb-3" />
                  {['9:00', '10:00', '11:00', '14:00', '15:00'].map((t) => (
                    <div
                      key={t}
                      className="h-8 rounded-lg text-xs flex items-center justify-center font-medium"
                      style={{ background: 'rgba(37,99,255,0.1)', border: '1px solid rgba(37,99,255,0.2)', color: '#00d4ff' }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-xs text-muted uppercase tracking-[0.2em] mb-3">Features</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need to{' '}
              <span className="text-gradient">run your business</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Built for salons, clinics, studios, coaches — any service business that takes appointments.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <FeatureCard key={f.title} f={f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section id="pricing" className="py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 reveal">
            <p className="text-xs text-muted uppercase tracking-[0.2em] mb-3">Pricing</p>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Simple,{' '}
              <span className="text-gradient">honest pricing</span>
            </h2>
            <p className="text-gray-400 text-lg">Start free. Upgrade when you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 reveal">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className="rounded-2xl p-8 relative overflow-hidden"
                style={
                  plan.highlighted
                    ? {
                        background: 'rgba(13,13,31,0.7)',
                        backdropFilter: 'blur(20px)',
                        animation: 'glowBorder 3s ease-in-out infinite',
                        border: '1px solid rgba(37,99,255,0.45)',
                      }
                    : {
                        background: 'rgba(13,13,31,0.5)',
                        border: '1px solid rgba(26,26,58,0.9)',
                      }
                }
              >
                {plan.highlighted && (
                  <>
                    {/* Corner glow */}
                    <div
                      className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                      style={{
                        background: 'radial-gradient(circle at top right, rgba(0,212,255,0.08) 0%, transparent 70%)',
                      }}
                    />
                    <div
                      className="absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'linear-gradient(135deg,#2563ff,#00d4ff)', color: '#fff' }}
                    >
                      Most popular
                    </div>
                  </>
                )}
                <div className="mb-6 relative">
                  <p className="text-muted text-sm font-medium mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span
                      className="font-heading text-5xl font-extrabold"
                      style={plan.highlighted ? { color: '#fff' } : { color: '#fff' }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-muted mb-2">/ {plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: plan.highlighted ? '#00e87a' : '#2563ff' }}
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-3.5 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? 'btn-primary'
                      : 'hover:bg-white/8 text-white'
                  }`}
                  style={!plan.highlighted ? {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(26,26,58,0.9)',
                  } : {}}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-28 px-4">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden reveal"
          style={{
            background: 'rgba(13,13,31,0.7)',
            border: '1px solid rgba(37,99,255,0.2)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,255,0.12) 0%, transparent 70%)',
            }}
          />
          <p className="text-xs text-muted uppercase tracking-[0.2em] mb-3 relative">Get started</p>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 relative">
            Ready to fill your{' '}
            <span className="text-gradient">calendar?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8 relative">
            Join hundreds of businesses already using BookEasy to automate their bookings.
          </p>
          <Link to="/register" className="btn-primary text-base px-10 py-4 relative inline-block">
            Create your free account →
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="py-12 px-4" style={{ borderTop: '1px solid rgba(26,26,58,0.8)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#2563ff,#00d4ff)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <span className="font-heading font-bold text-base text-gradient">BookEasy</span>
              </div>
              <p className="text-muted text-sm leading-relaxed max-w-xs">
                Accept bookings 24/7, automatically. Built for service businesses that want to grow without the admin work.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-white font-semibold text-sm mb-4">Product</p>
              <div className="space-y-3">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Book a demo', href: '/register' },
                ].map(({ label, href }) => (
                  <a key={label} href={href} className="block text-sm text-muted hover:text-white transition-colors">{label}</a>
                ))}
              </div>
            </div>

            {/* Legal & Social */}
            <div>
              <p className="text-white font-semibold text-sm mb-4">Company</p>
              <div className="space-y-3">
                {[
                  { label: 'Privacy policy', href: '/privacy' },
                  { label: 'Terms of service', href: '/terms' },
                  { label: 'GitHub', href: 'https://github.com/bokigolic/bookeasy' },
                  { label: 'Twitter / X', href: 'https://twitter.com/bookeasyapp' },
                ].map(({ label, href }) => (
                  <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block text-sm text-muted hover:text-white transition-colors">{label}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: '1px solid rgba(26,26,58,0.7)' }}>
            <p className="text-muted text-xs">© 2025 BookEasy. All rights reserved.</p>
            <p className="text-muted text-xs">Made with ♥ for service businesses everywhere</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
