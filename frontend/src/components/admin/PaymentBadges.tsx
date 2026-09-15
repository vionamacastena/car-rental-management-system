import { cn } from '@/lib/cn'
import type { PaymentTypeValue, PaymentStatusValue, PaymentMethodValue } from '@/types/payment'
import type { InvoiceStatusValue } from '@/types/invoice'

const TYPE_STYLES: Record<PaymentTypeValue, { bg: string; label: string }> = {
  rental_payment: { bg: 'bg-emerald-100 text-emerald-800', label: 'Rental Payment' },
  deposit_received: { bg: 'bg-blue-100 text-blue-800',     label: 'Deposit Received' },
  deposit_refund:   { bg: 'bg-orange-100 text-orange-800', label: 'Deposit Refund' },
  extra_charge:     { bg: 'bg-rose-100 text-rose-800',     label: 'Extra Charge' },
  refund:           { bg: 'bg-amber-100 text-amber-800',   label: 'Refund' },
}

const STATUS_STYLES: Record<PaymentStatusValue, { bg: string; label: string }> = {
  pending:             { bg: 'bg-gray-100 text-gray-700',    label: 'Pending' },
  completed:           { bg: 'bg-green-100 text-green-800',  label: 'Completed' },
  failed:              { bg: 'bg-red-100 text-red-800',      label: 'Failed' },
  refunded:            { bg: 'bg-orange-100 text-orange-800', label: 'Refunded' },
  partially_refunded:  { bg: 'bg-amber-100 text-amber-800',  label: 'Partially Refunded' },
}

const METHOD_LABELS: Record<PaymentMethodValue, string> = {
  cash: 'Cash',
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  online: 'Online',
  other: 'Other',
}

export function PaymentTypeBadge({ type }: { type: PaymentTypeValue }) {
  const cfg = TYPE_STYLES[type] ?? { bg: 'bg-gray-100 text-gray-700', label: type }
  return (
    <span className={cn('inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', cfg.bg)}>
      {cfg.label}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatusValue }) {
  const cfg = STATUS_STYLES[status] ?? { bg: 'bg-gray-100 text-gray-700', label: status }
  return (
    <span className={cn('inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', cfg.bg)}>
      {cfg.label}
    </span>
  )
}

export function methodLabel(method: PaymentMethodValue): string {
  return METHOD_LABELS[method] ?? method
}

export const PAYMENT_TYPE_OPTIONS: { value: PaymentTypeValue; label: string }[] = [
  { value: 'rental_payment',   label: 'Rental Payment' },
  { value: 'deposit_received', label: 'Deposit Received' },
  { value: 'deposit_refund',   label: 'Deposit Refund' },
  { value: 'extra_charge',     label: 'Extra Charge' },
  { value: 'refund',           label: 'Refund' },
]

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethodValue; label: string }[] = [
  { value: 'cash',          label: 'Cash' },
  { value: 'card',          label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'online',        label: 'Online' },
  { value: 'other',         label: 'Other' },
]

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatusValue; label: string }[] = [
  { value: 'pending',            label: 'Pending' },
  { value: 'completed',          label: 'Completed' },
  { value: 'failed',             label: 'Failed' },
  { value: 'refunded',           label: 'Refunded' },
  { value: 'partially_refunded', label: 'Partially Refunded' },
]

const INVOICE_STATUS_STYLES: Record<InvoiceStatusValue, { bg: string; label: string }> = {
  draft:     { bg: 'bg-gray-100 text-gray-700',   label: 'Draft' },
  issued:    { bg: 'bg-blue-100 text-blue-800',   label: 'Issued' },
  paid:      { bg: 'bg-green-100 text-green-800', label: 'Paid' },
  cancelled: { bg: 'bg-red-100 text-red-800',     label: 'Cancelled' },
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatusValue }) {
  const cfg = INVOICE_STATUS_STYLES[status] ?? { bg: 'bg-gray-100 text-gray-700', label: status }
  return (
    <span className={cn('inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', cfg.bg)}>
      {cfg.label}
    </span>
  )
}

export const INVOICE_STATUS_OPTIONS: { value: InvoiceStatusValue; label: string }[] = [
  { value: 'draft',     label: 'Draft' },
  { value: 'issued',    label: 'Issued' },
  { value: 'paid',      label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
]
