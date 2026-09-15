import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  color?: 'blue' | 'amber' | 'purple' | 'emerald' | 'red' | 'ink'
}

const COLORS = {
  blue: 'bg-blue-100 text-blue-700',
  amber: 'bg-amber-100 text-amber-700',
  purple: 'bg-purple-100 text-purple-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  ink: 'bg-cream text-ink',
}

export function KPICard({ icon, label, value, hint, color = 'ink' }: Props) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-start justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', COLORS[color])}>
          {icon}
        </span>
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
