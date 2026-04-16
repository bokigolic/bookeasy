import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'

export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />
      <main className="flex-1 md:ml-60 pb-24 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
