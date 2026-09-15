import { Link, NavLink } from 'react-router-dom'
import { Car, Lock } from 'lucide-react'
import { cn } from '@/lib/cn'

const navItems = [
  { to: '/', label: 'Kryefaqja', end: true },
  { to: '/fleet', label: 'Flota' },
]

export function PublicNavbar() {
  return (
    <header className="border-b border-line bg-cream/95 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto max-w-shell px-6 lg:px-10">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <Car className="h-7 w-7 text-ink transition-transform group-hover:-translate-x-0.5" strokeWidth={2} />
            <span className="font-display text-xl font-bold tracking-tight uppercase text-ink">
              Driveway Rent-A-Car
            </span>
          </Link>

          {/* Right side */}
          <nav className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-8">
              {navItems.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'text-sm font-medium transition-colors',
                      isActive ? 'text-ink' : 'text-muted hover:text-ink',
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>

            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 rounded-lg border border-ink/20 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              <Lock className="h-4 w-4" strokeWidth={2} />
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
