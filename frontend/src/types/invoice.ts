import type { Customer } from './customer'

export type InvoiceStatusValue = 'draft' | 'issued' | 'paid' | 'cancelled'

export interface InvoiceLineItem {
  label: string
  description: string | null
  qty: number
  unit_price: number
  total: number
}

export interface Invoice {
  id: number
  invoice_number: string
  status: {
    value: InvoiceStatusValue
    label: string
  }
  rental_id: number | null
  customer: Customer
  line_items: InvoiceLineItem[]
  subtotal: number
  tax_amount: number
  total: number
  amount_paid: number
  amount_due: number
  has_pdf: boolean
  download_url: string | null
  issued_at: string | null
  due_at: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
}
