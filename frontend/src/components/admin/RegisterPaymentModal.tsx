import { useEffect, useState, type FormEvent } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { useCreatePayment } from '@/hooks/admin/useAdminPayments'
import { useAdminRentals } from '@/hooks/admin/useAdminRentals'
import { useAdminReservations } from '@/hooks/admin/useAdminReservations'
import {
  PAYMENT_TYPE_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '@/components/admin/PaymentBadges'
import type { ApiError } from '@/types/api'
import type { PaymentTypeValue, PaymentMethodValue } from '@/types/payment'

interface Props {
  onClose: () => void
  defaultPayable?: { type: 'rental' | 'reservation'; id: number }
}

export function RegisterPaymentModal({ onClose, defaultPayable }: Props) {
  const [form, setForm] = useState({
    payable_type: (defaultPayable?.type ?? 'rental') as 'rental' | 'reservation',
    payable_id: defaultPayable?.id ?? 0,
    type: 'rental_payment' as PaymentTypeValue,
    method: 'cash' as PaymentMethodValue,
    amount: 0,
    reference: '',
    notes: '',
  })

  // Ngarko rentals dhe reservations (vetëm kur s'ka defaultPayable)
  const { data: rentals } = useAdminRentals({ per_page: 50, sort_by: 'created_at', sort_dir: 'desc' })
  const { data: reservations } = useAdminReservations({ per_page: 50, sort_by: 'created_at', sort_dir: 'desc' })

  const create = useCreatePayment()

  // Auto-set payable_id kur s'ka vlerë
  useEffect(() => {
    if (defaultPayable || form.payable_id > 0) return
    if (form.payable_type === 'rental' && rentals?.data?.length) {
      setForm((f) => ({ ...f, payable_id: rentals.data[0].id }))
    } else if (form.payable_type === 'reservation' && reservations?.data?.length) {
      setForm((f) => ({ ...f, payable_id: reservations.data[0].id }))
    }
  }, [form.payable_type, form.payable_id, rentals, reservations, defaultPayable])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.payable_id) return
    create.mutate(
      {
        ...form,
        amount: Number(form.amount),
        reference: form.reference || null,
        notes: form.notes || null,
      },
      { onSuccess: onClose },
    )
  }

  const errorMessage = (() => {
    const err = create.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    const errs = err.response.data?.errors
    if (errs) return Object.values(errs).flat().join(' · ')
    return err.response.data?.message ?? 'Gabim gjatë regjistrimit.'
  })()

  const payableOptions = form.payable_type === 'rental'
    ? (rentals?.data ?? []).map((r) => ({
        id: r.id,
        label: `${r.rental_code} — ${r.customer.full_name} (${r.pricing.total_amount.toFixed(2)}€)`,
      }))
    : (reservations?.data ?? []).map((r) => ({
        id: r.id,
        label: `${r.reservation_code} — ${r.customer.full_name} (${r.pricing.total.toFixed(2)}€)`,
      }))

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-xl font-bold text-ink">Regjistro pagesë</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-ink/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Field label="Lidh me">
            <select
              value={form.payable_type}
              onChange={(e) =>
                setForm({ ...form, payable_type: e.target.value as 'rental' | 'reservation', payable_id: 0 })
              }
              disabled={!!defaultPayable}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="rental">Rental</option>
              <option value="reservation">Rezervim</option>
            </select>
          </Field>

          <Field label={form.payable_type === 'rental' ? 'Zgjidh rental *' : 'Zgjidh rezervim *'}>
            <select
              required
              value={form.payable_id || ''}
              onChange={(e) => setForm({ ...form, payable_id: Number(e.target.value) })}
              disabled={!!defaultPayable || payableOptions.length === 0}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="">
                {payableOptions.length === 0
                  ? 'Asnjë opsion i disponueshëm'
                  : 'Zgjidh…'}
              </option>
              {payableOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Lloji i pagesës *">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as PaymentTypeValue })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              >
                {PAYMENT_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Metoda *">
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethodValue })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              >
                {PAYMENT_METHOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Shuma (€) *">
            <input
              type="number"
              min={0.01}
              step={0.01}
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Referenca (transaction ID)">
            <input
              type="text"
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              placeholder="Opsionale"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Shënime">
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm resize-y"
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Anulo
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={create.isPending || !form.payable_id}
            >
              {create.isPending ? 'Duke ruajtur…' : 'Regjistro'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  )
}
