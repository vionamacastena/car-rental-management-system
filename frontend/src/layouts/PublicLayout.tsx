import { Outlet } from 'react-router-dom'
import { PublicNavbar } from '@/components/layout/PublicNavbar'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line py-10 mt-20">
        <div className="mx-auto max-w-shell px-6 lg:px-10 text-center text-sm text-muted">
          © {new Date().getFullYear()} Driveway Rent-A-Car · Prishtina · Prizren · Peja
        </div>
      </footer>
    </div>
  )
}
