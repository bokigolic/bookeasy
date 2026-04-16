import { useState } from 'react'
import { usePlan } from '../context/PlanContext'

export function UpgradeBanner() {
  const { nearBookingLimit, atBookingLimit, atServiceLimit, monthlyBookings, FREE_BOOKING_LIMIT } = usePlan()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null
  if (!nearBookingLimit && !atServiceLimit) return null

  const isHard = atBookingLimit || atServiceLimit
  const message = atBookingLimit
    ? `You've reached the free plan limit of ${FREE_BOOKING_LIMIT} bookings/month.`
    : atServiceLimit
    ? `You've reached the free plan limit of 3 services.`
    : `${monthlyBookings} / ${FREE_BOOKING_LIMIT} bookings used this month.`

  return (
    <div
      className="mx-4 md:mx-8 mt-4 rounded-xl px-4 py-3 flex items-center gap-3"
      style={{
        background: isHard ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.08)',
        border: `1px solid ${isHard ? 'rgba(239,68,68,0.25)' : 'rgba(245,158,11,0.2)'}`,
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"
        stroke={isHard ? '#f87171' : '#f59e0b'} strokeWidth={2}>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth={2.5} />
      </svg>
      <p className="text-sm flex-1" style={{ color: isHard ? '#f87171' : '#f59e0b' }}>
        {message}{' '}
        <a href="https://bookeasy.app/upgrade" target="_blank" rel="noopener noreferrer"
          className="font-semibold underline hover:no-underline">
          Upgrade to Pro →
        </a>
      </p>
      <button onClick={() => setDismissed(true)} className="text-muted hover:text-white transition-colors flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}
