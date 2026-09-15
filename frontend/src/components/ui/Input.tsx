import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm text-ink placeholder:text-muted',
        'focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
