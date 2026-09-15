import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { AdminTopbar } from '@/components/layout/AdminTopbar'

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-cream">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminTopbar />
        <main className="flex-1 px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
