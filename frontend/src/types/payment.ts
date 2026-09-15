import type { Customer } from './customer'

export type PaymentTypeValue =
  | 'rental_payment'
  | 'deposit_received'
  | 'deposit_refund'
  | 'extra_charge'
  | 'refund'

export type PaymentMethodValue =
  | 'cash'
  | 'card'
  | 'bank_transfer'
  | 'online'
  | 'other'

export type PaymentStatusValue =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export interface PaymentEnumOption<T extends string = string> {
  value: T
  label: string
  is_incoming?: boolean
}

export interface Payment {
  id: number
  payment_code: string
  payable: {
    type: string
    id: number
  }
  customer?: Customer
  received_by?: {
    id: number
    name: string
  }
  type: PaymentEnumOption<PaymentTypeValue>
  method: PaymentEnumOption<PaymentMethodValue>
  status: PaymentEnumOption<PaymentStatusValue>
  amount: number
  refunded_amount: number
  net_amount: number
  reference: string | null
  notes: string | null
  paid_at: string | null
  created_at: string
}

export interface PaymentSummary {
  total_paid: number
  total_refunded: number
  net_received: number
  by_type: Record<string, number>
}
