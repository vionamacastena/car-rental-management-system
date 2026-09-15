import { cn } from '@/lib/cn'
import type { ContractStatusValue } from '@/types/contract'

const STYLES: Record<ContractStatusValue, { bg: string; label: string }> = {
  draft:             { bg: 'bg-gray-100 text-gray-700',   label: 'Draft' },
  pending_signature: { bg: 'bg-amber-100 text-amber-800', label: 'Pending Signature' },
  signed:            { bg: 'bg-green-100 text-green-800', label: 'Signed' },
  cancelled:         { bg: 'bg-red-100 text-red-800',     label: 'Cancelled' },
}

export function ContractStatusBadge({ status }: { status: ContractStatusValue }) {
  const cfg = STYLES[status] ?? { bg: 'bg-gray-100 text-gray-700', label: status }
  return (
    <span className={cn('inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', cfg.bg)}>
      {cfg.label}
    </span>
  )
}

export const CONTRACT_STATUS_OPTIONS: { value: ContractStatusValue; label: string }[] = [
  { value: 'draft',             label: 'Draft' },
  { value: 'pending_signature', label: 'Pending Signature' },
  { value: 'signed',            label: 'Signed' },
  { value: 'cancelled',         label: 'Cancelled' },
]
