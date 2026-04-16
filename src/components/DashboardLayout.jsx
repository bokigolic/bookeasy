import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { NotificationBell } from './NotificationBell'
import { GlobalSearch } from './GlobalSearch'

export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <main className="flex-1 md:ml-60 pb-24 md:pb-0">
        {/* Topbar */}
        <div
          className="sticky top-0 z-30 flex items-center justify-end gap-2 px-4 md:px-8 py-2.5"
          style={{
            background: 'rgba(5,5,15,0.9)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(26,26,58,0.6)',
          }}
        >
          <GlobalSearch />
          <NotificationBell />
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
