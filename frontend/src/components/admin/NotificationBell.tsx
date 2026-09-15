import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell, X, Check, CheckCheck, Calendar, AlertTriangle,
  Wrench, Wallet, Trash2,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/hooks/admin/useNotifications'
import type { AppNotification, NotificationType } from '@/types/notification'

const ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  new_reservation: Calendar,
  reservation_overdue: AlertTriangle,
  maintenance_due: Wrench,
  payment_received: Wallet,
}

const COLORS: Record<NotificationType, string> = {
  new_reservation: 'bg-blue-100 text-blue-700',
  reservation_overdue: 'bg-red-100 text-red-700',
  maintenance_due: 'bg-amber-100 text-amber-700',
  payment_received: 'bg-emerald-100 text-emerald-700',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'all' | 'unread'>('unread')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: unreadData } = useUnreadCount()
  const { data, isLoading } = useNotifications({
    unread_only: tab === 'unread',
    per_page: 15,
  })
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllRead()
  const remove = useDeleteNotification()

  const unreadCount = unreadData ?? 0

  // Close on click outside
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  function handleNotificationClick(n: AppNotification) {
    if (!n.is_read) {
      markRead.mutate(n.id)
    }
    // Navigation bëhet nga Link-u rrethues
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
          open ? 'bg-ink text-cream' : 'text-ink hover:bg-ink/5',
        )}
        title="Njoftimet"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <h3 className="font-display text-sm font-bold text-ink">Njoftimet</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-muted">{unreadCount} të palexuara</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Lexo të gjitha
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-line">
            <button
              type="button"
              onClick={() => setTab('unread')}
              className={cn(
                'flex-1 py-2.5 text-xs font-medium transition-colors',
                tab === 'unread'
                  ? 'border-b-2 border-gold text-ink'
                  : 'text-muted hover:text-ink',
              )}
            >
              Të palexuara
            </button>
            <button
              type="button"
              onClick={() => setTab('all')}
              className={cn(
                'flex-1 py-2.5 text-xs font-medium transition-colors',
                tab === 'all'
                  ? 'border-b-2 border-gold text-ink'
                  : 'text-muted hover:text-ink',
              )}
            >
              Të gjitha
            </button>
          </div>

          {/* Lista */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="space-y-2 p-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-line/40" />
                ))}
              </div>
            )}

            {data && data.data.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted" />
                <p className="mt-3 text-sm text-muted">
                  {tab === 'unread' ? 'Nuk ka njoftime të palexuara.' : 'Nuk ka njoftime.'}
                </p>
              </div>
            )}

            {data && data.data.length > 0 && (
              <ul className="divide-y divide-line">
                {data.data.map((n) => {
                  const Icon = ICONS[n.type] ?? Bell
                  const color = COLORS[n.type] ?? 'bg-gray-100 text-gray-700'
                  const Wrapper = n.url ? Link : 'div'
                  const wrapperProps = n.url
                    ? { to: n.url, onClick: () => { handleNotificationClick(n); setOpen(false) } }
                    : { onClick: () => handleNotificationClick(n) }

                  return (
                    <li key={n.id} className="group relative">
                      <Wrapper
                        {...(wrapperProps as any)}
                        className={cn(
                          'flex gap-3 px-4 py-3 transition-colors cursor-pointer',
                          n.is_read ? 'hover:bg-cream/40' : 'bg-gold/5 hover:bg-gold/10',
                        )}
                      >
                        <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', color)}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn(
                              'text-sm font-medium text-ink',
                              !n.is_read && 'font-semibold',
                            )}>
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" />
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted line-clamp-2">
                            {n.message}
                          </p>
                          <p className="mt-1 text-[10px] text-muted">{n.human_time}</p>
                        </div>
                      </Wrapper>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          remove.mutate(n.id)
                        }}
                        className="absolute right-2 top-2 rounded-lg p-1 text-muted opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        title="Fshij"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-line px-4 py-2.5 text-center">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
              Mbyll
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
