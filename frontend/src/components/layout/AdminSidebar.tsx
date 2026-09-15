import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Car, CalendarCheck, Users, Wallet,
  Wrench, MapPin, FileText, FileSignature, BarChart3, Settings, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/cn'


interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavSection {
  title: string
  items: NavItem[]
}

const sections: NavSection[] = [
  {
    title: 'Kryesore',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operacionet',
    items: [
      { to: '/admin/reservations', label: 'Rezervimet', icon: CalendarCheck },
      { to: '/admin/rentals', label: 'Rentals', icon: FileText },
      { to: '/admin/customers', label: 'Klientët', icon: Users },
    ],
  },
  {
    title: 'Flota',
    items: [
      { to: '/admin/vehicles', label: 'Automjetet', icon: Car },
      { to: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
      { to: '/admin/locations', label: 'Lokacionet', icon: MapPin },
    ],
  },
{
  title: 'Financa',
  items: [
    { to: '/admin/payments', label: 'Pagesat', icon: Wallet },
    { to: '/admin/invoices', label: 'Faturat', icon: FileText },
    { to: '/admin/contracts', label: 'Kontratat', icon: FileSignature },
  ],
},
  {
    title: 'Sistemi',
    items: [
      { to: '/admin/reports', label: 'Raporte', icon: BarChart3 },
      { to: '/admin/audit-log', label: 'Audit Log', icon: ShieldCheck },
      { to: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-ink-700/40 bg-ink h-screen sticky top-0">
      <div className="flex h-16 items-center gap-2.5 border-b border-ink-700/40 px-5">
        <Car className="h-6 w-6 text-gold" />
        <span className="font-display text-sm font-bold uppercase tracking-tight text-cream">
          CRMS Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-cream/40">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-ink-700 text-cream'
                            : 'text-cream/70 hover:bg-ink-700/50 hover:text-cream',
                        )
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-700/40 p-4 text-[10px] text-cream/40">
        v0.1.0 · Phase 5
      </div>
    </aside>
  )
}
