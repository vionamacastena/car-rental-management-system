import { useEffect, useState, type FormEvent } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { useCreateCustomer, useUpdateCustomer } from '@/hooks/admin/useAdminCustomers'
import type { Customer } from '@/types/customer'
import type { ApiError } from '@/types/api'
import type { CustomerPayload } from '@/services/admin/customers'

interface Props {
  customer: Customer | null
  onClose: () => void
}

const EMPTY: CustomerPayload = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Kosovo',
  date_of_birth: '',
  driver_license_number: '',
  driver_license_expiry: '',
  notes: '',
}

export function CustomerFormModal({ customer, onClose }: Props) {
  const isEdit = !!customer
  const [form, setForm] = useState<CustomerPayload>(EMPTY)
  const create = useCreateCustomer()
  const update = useUpdateCustomer()

  useEffect(() => {
    if (customer) {
      setForm({
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address ?? '',
        city: customer.city ?? '',
        country: customer.country ?? 'Kosovo',
        date_of_birth: customer.date_of_birth ?? '',
        driver_license_number: customer.driver_license_number ?? '',
        driver_license_expiry: customer.driver_license_expiry ?? '',
        notes: customer.notes ?? '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [customer])

  const mutation = isEdit ? update : create

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload: CustomerPayload = {
      ...form,
      address: form.address || null,
      city: form.city || null,
      country: form.country || null,
      date_of_birth: form.date_of_birth || null,
      driver_license_number: form.driver_license_number || null,
      driver_license_expiry: form.driver_license_expiry || null,
      notes: form.notes || null,
    }

    if (isEdit && customer) {
      update.mutate({ id: customer.id, payload }, { onSuccess: onClose })
    } else {
      create.mutate(payload, { onSuccess: onClose })
    }
  }

  const errorMessage = (() => {
    const err = mutation.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    const errs = err.response.data?.errors
    if (errs) return Object.values(errs).flat().join(' · ')
    return err.response.data?.message ?? 'Gabim gjatë ruajtjes.'
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">
              {isEdit ? 'Ndrysho klientin' : 'Shto klient të re'}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {isEdit ? customer?.full_name : 'Të dhënat bazë të klientit'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-ink/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Emri *">
              <I value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} required />
            </F>
            <F label="Mbiemri *">
              <I value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} required />
            </F>
            <F label="Email *">
              <I type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
            </F>
            <F label="Telefoni *">
              <I value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required />
            </F>
            <F label="Adresa">
              <I value={form.address ?? ''} onChange={(v) => setForm({ ...form, address: v })} />
            </F>
            <F label="Qyteti">
              <I value={form.city ?? ''} onChange={(v) => setForm({ ...form, city: v })} />
            </F>
            <F label="Shteti">
              <I value={form.country ?? ''} onChange={(v) => setForm({ ...form, country: v })} />
            </F>
            <F label="Data e lindjes">
              <I type="date" value={form.date_of_birth ?? ''} onChange={(v) => setForm({ ...form, date_of_birth: v })} />
            </F>
            <F label="Numri i patentës">
              <I value={form.driver_license_number ?? ''} onChange={(v) => setForm({ ...form, driver_license_number: v })} />
            </F>
            <F label="Patenta skadon">
              <I type="date" value={form.driver_license_expiry ?? ''} onChange={(v) => setForm({ ...form, driver_license_expiry: v })} />
            </F>
          </div>

          <F label="Shënime interne">
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-y"
            />
          </F>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="md" onClick={onClose}>
              Anulo
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={mutation.isPending}>
              {mutation.isPending ? 'Duke ruajtur…' : isEdit ? 'Ruaj ndryshimet' : 'Shto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  )
}

function I({
  value,
  onChange,
  type = 'text',
  required,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
    />
  )
}
