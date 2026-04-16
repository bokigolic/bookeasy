import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    let channel = null

    const init = async () => {
      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!biz) return

      channel = supabase
        .channel(`bookings-${biz.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'bookings', filter: `business_id=eq.${biz.id}` },
          (payload) => {
            const b = payload.new
            const notif = {
              id: Date.now() + Math.random(),
              type: 'new_booking',
              message: `New booking from ${b.client_name}`,
              meta: { date: b.date, time: b.time?.slice(0, 5) },
              timestamp: new Date().toISOString(),
              read: false,
            }
            setNotifications(prev => [notif, ...prev].slice(0, 10))
            setUnreadCount(prev => prev + 1)
            showToast(`New booking from ${b.client_name}`, 'info')
          }
        )
        .subscribe()
    }

    init()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [user, showToast])

  const markAllRead = useCallback(() => setUnreadCount(0), [])

  const addNotification = useCallback((notif) => {
    setNotifications(prev =>
      [{ id: Date.now() + Math.random(), timestamp: new Date().toISOString(), read: false, ...notif }, ...prev].slice(0, 10)
    )
    setUnreadCount(prev => prev + 1)
  }, [])

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAllRead, addNotification }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>')
  return ctx
}
