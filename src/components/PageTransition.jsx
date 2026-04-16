import { useLocation } from 'react-router-dom'

/**
 * Wraps page content in a fade + slide-up animation.
 * Uses location.key as the React key so the animation re-fires on every navigation.
 */
export function PageTransition({ children }) {
  const location = useLocation()
  return (
    <div key={location.key} className="page-enter">
      {children}
    </div>
  )
}
