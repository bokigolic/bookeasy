import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const FREE_BOOKING_LIMIT = 50
const FREE_SERVICE_LIMIT = 3

const PlanContext = createContext(null)

export function PlanProvider({ children }) {
  const { user } = useAuth()
  const [plan, setPlan] = useState('free')
  const [monthlyBookings, setMonthlyBookings] = useState(0)
  const [serviceCount, setServiceCount] = useState(0)
  const [businessId, setBusinessId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    const load = async () => {
      const { data: biz } = await supabase.from('businesses').select('id, plan_type').eq('user_id', user.id).single()
      if (!biz) { setLoading(false); return }
      setBusinessId(biz.id)
      setPlan(biz.plan_type || 'free')

      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const [{ count: bCount }, { count: sCount }] = await Promise.all([
        supabase.from('bookings').select('id', { count: 'exact', head: true })
          .eq('business_id', biz.id)
          .gte('created_at', monthStart.toISOString()),
        supabase.from('services').select('id', { count: 'exact', head: true })
          .eq('business_id', biz.id),
      ])

      setMonthlyBookings(bCount || 0)
      setServiceCount(sCount || 0)
      setLoading(false)
    }
    load()
  }, [user])

  const isPro = plan === 'pro'
  const canAddBooking = isPro || monthlyBookings < FREE_BOOKING_LIMIT
  const canAddService = isPro || serviceCount < FREE_SERVICE_LIMIT
  const nearBookingLimit = !isPro && monthlyBookings >= FREE_BOOKING_LIMIT * 0.8
  const atBookingLimit = !isPro && monthlyBookings >= FREE_BOOKING_LIMIT
  const atServiceLimit = !isPro && serviceCount >= FREE_SERVICE_LIMIT

  return (
    <PlanContext.Provider value={{
      plan, isPro, loading,
      monthlyBookings, serviceCount,
      canAddBooking, canAddService,
      nearBookingLimit, atBookingLimit, atServiceLimit,
      FREE_BOOKING_LIMIT, FREE_SERVICE_LIMIT,
      businessId,
    }}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan must be inside PlanProvider')
  return ctx
}
