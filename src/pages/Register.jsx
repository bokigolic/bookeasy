import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('business')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { role, full_name: name } },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    // Create business record if registering as business
    if (role === 'business' && data.user) {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.random().toString(36).slice(2, 6)
      await supabase.from('businesses').insert({
        user_id: data.user.id,
        name,
        slug,
        working_hours: {
          mon: { open: '09:00', close: '17:00', enabled: true },
          tue: { open: '09:00', close: '17:00', enabled: true },
          wed: { open: '09:00', close: '17:00', enabled: true },
          thu: { open: '09:00', close: '17:00', enabled: true },
          fri: { open: '09:00', close: '17:00', enabled: true },
          sat: { open: '10:00', close: '14:00', enabled: false },
          sun: { open: '10:00', close: '14:00', enabled: false },
        },
      })
    }

    setLoading(false)
    navigate(role === 'client' ? '/my-bookings' : '/dashboard')
  }

  const RoleCard = ({ value, title, desc, icon }) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      className={`flex-1 p-4 rounded-xl border text-left transition-all ${
        role === value
          ? 'border-accent bg-accent/10'
          : 'border-border bg-bg hover:border-gray-600'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${role === value ? 'bg-accent/20 text-accent' : 'bg-white/5 text-gray-400'}`}>
        {icon}
      </div>
      <p className="font-heading font-semibold text-sm text-white">{title}</p>
      <p className="text-xs text-muted mt-0.5">{desc}</p>
    </button>
  )

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="font-heading font-bold text-xl">BookEasy</span>
        </Link>

        <div className="card">
          <h1 className="font-heading text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-muted text-sm mb-6">Get started in under 2 minutes</p>

          {/* Role selector */}
          <div className="mb-5">
            <p className="label mb-2">I am a…</p>
            <div className="flex gap-3">
              <RoleCard
                value="business"
                title="Business"
                desc="I offer services and take appointments"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                }
              />
              <RoleCard
                value="client"
                title="Client"
                desc="I want to book appointments"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">{role === 'business' ? 'Business name' : 'Full name'}</label>
              <input
                type="text"
                className="input"
                placeholder={role === 'business' ? 'Salon Luxe' : 'Jane Smith'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
