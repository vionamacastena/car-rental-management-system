import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

interface Props {
  current: number
  steps: string[]
}

export function StepIndicator({ current, steps }: Props) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {steps.map((label, i) => {
        const index = i + 1
        const isDone = index < current
        const isActive = index === current

        return (
          <div key={label} className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isDone && 'bg-gold text-ink',
                  isActive && 'bg-ink text-cream',
                  !isActive && !isDone && 'border border-line bg-white text-muted',
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : index}
              </span>
              <span
                className={cn(
                  'hidden text-sm font-medium sm:block',
                  isActive ? 'text-ink' : 'text-muted',
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-px w-8 sm:w-12',
                  isDone ? 'bg-gold' : 'bg-line',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
