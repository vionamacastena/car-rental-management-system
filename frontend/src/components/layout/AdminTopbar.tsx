import { LogOut, User } from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import { useLogout } from '@/features/auth/useLogout'

export function AdminTopbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-line bg-cream/95 backdrop-blur px-6 lg:px-8">
      <div />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-cream">
            <User className="h-4 w-4" />
          </span>
          <span className="hidden sm:block">
            <span className="font-medium text-ink">{user?.name ?? 'Admin'}</span>
            <span className="ml-2 text-muted">{user?.email}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink/30 disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          Dil
        </button>
      </div>
    </header>
  )
}
