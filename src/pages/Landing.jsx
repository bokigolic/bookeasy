import { Link } from 'react-router-dom'

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: '24/7 Automatic Bookings',
    desc: 'Clients book while you sleep. No phone calls, no back-and-forth. Just a clean link that works.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    title: 'Automatic Reminders',
    desc: 'Email confirmations and reminders sent automatically — reduce no-shows without lifting a finger.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: 'Business Analytics',
    desc: 'See your weekly revenue, busiest days, and top services — all in one clean dashboard.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth={2.5} />
      </svg>
    ),
    title: 'Mobile First',
    desc: 'Manage appointments from any device. Your booking page works perfectly on mobile too.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Client Management',
    desc: 'Keep a complete history of every client, their visits, and preferences in one place.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Secure & Reliable',
    desc: 'Built on Supabase with enterprise-grade security. Your data is always safe and backed up.',
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

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg font-body">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-bg/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="font-heading font-bold text-lg">BookEasy</span>
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

      {/* Hero */}
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-accent font-medium">Now in public beta</span>
          </div>
          <h1 className="font-heading text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Accept bookings{' '}
            <span className="text-accent">24/7</span>,
            <br />automatically.
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            BookEasy gives your business a beautiful booking page, automated reminders,
            and a dashboard to manage everything — in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5">
              Start for free →
            </Link>
            <a href="#features" className="btn-secondary text-base px-8 py-3.5">
              See how it works
            </a>
          </div>
          <p className="text-sm text-muted mt-4">No credit card required · Free plan available</p>
        </div>

        {/* Hero mockup */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-surface border border-border rounded-2xl p-1 shadow-2xl shadow-black/50">
            <div className="bg-bg rounded-xl overflow-hidden">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="ml-4 text-xs text-muted">bookeasy.app/salon-lux</span>
              </div>
              <div className="grid grid-cols-3 gap-0 p-6 min-h-48">
                <div className="col-span-2 space-y-3 pr-6 border-r border-border">
                  <div className="h-4 w-32 bg-accent/20 rounded" />
                  <div className="h-3 w-48 bg-white/10 rounded" />
                  <div className="h-3 w-40 bg-white/10 rounded" />
                  <div className="mt-4 grid grid-cols-7 gap-1">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-7 rounded-lg text-[10px] flex items-center justify-center ${
                          i === 14
                            ? 'bg-accent text-white'
                            : i % 7 === 0 || i % 7 === 6
                            ? 'bg-white/3 text-muted'
                            : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {i + 1 <= 30 ? i + 1 : ''}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pl-6 space-y-2">
                  <div className="h-3 w-20 bg-white/10 rounded mb-3" />
                  {['9:00', '10:00', '11:00', '14:00', '15:00'].map((t) => (
                    <div key={t} className="h-8 rounded-lg bg-accent/10 border border-accent/20 text-xs text-accent flex items-center justify-center">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">
              Everything you need to run your business
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Built for salons, clinics, studios, coaches — any service business that takes appointments.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card group hover:border-accent/30 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4 group-hover:bg-accent/15 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-heading font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-bold text-white mb-4">Simple, honest pricing</h2>
            <p className="text-gray-400 text-lg">Start free. Upgrade when you grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 border ${
                  plan.highlighted
                    ? 'bg-accent/10 border-accent/40 relative overflow-hidden'
                    : 'bg-surface border-border'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-muted text-sm font-medium mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="font-heading text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-muted mb-2">/ {plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center py-3 rounded-xl font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-accent hover:bg-accent-hover text-white'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-border'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-4xl font-bold text-white mb-4">
            Ready to fill your calendar?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join hundreds of businesses already using BookEasy to automate their bookings.
          </p>
          <Link to="/register" className="btn-primary text-base px-10 py-4">
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <span className="font-heading font-bold text-sm text-white">BookEasy</span>
          </div>
          <p className="text-muted text-sm">© 2025 BookEasy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
