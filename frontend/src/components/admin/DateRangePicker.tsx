import { Calendar } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface DateRange {
  from: string
  to: string
}

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

const PRESETS = [
  { label: '7 ditë', days: 7 },
  { label: '30 ditë', days: 30 },
  { label: '90 ditë', days: 90 },
  { label: '1 vit', days: 365 },
]

export function DateRangePicker({ value, onChange }: Props) {
  function applyPreset(days: number) {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - (days - 1))

    onChange({
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
    })
  }

  const activePreset = PRESETS.find((p) => {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - (p.days - 1))
    return (
      value.from === from.toISOString().slice(0, 10) &&
      value.to === to.toISOString().slice(0, 10)
    )
  })

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-white p-3">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted" />
        <input
          type="date"
          value={value.from}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="rounded-lg border border-line bg-cream px-2.5 py-1.5 text-sm focus:border-ink/30 focus:outline-none"
        />
        <span className="text-muted">→</span>
        <input
          type="date"
          value={value.to}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="rounded-lg border border-line bg-cream px-2.5 py-1.5 text-sm focus:border-ink/30 focus:outline-none"
        />
      </div>

      <div className="flex gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p.days)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              activePreset?.label === p.label
                ? 'bg-ink text-cream'
                : 'border border-line text-ink hover:bg-ink/5',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
