import { useEffect, useState, type FormEvent } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { useCreateLocation, useUpdateLocation } from '@/hooks/admin/useAdminLocations'
import type { Location } from '@/types/vehicle'
import type { ApiError } from '@/types/api'
import type { LocationPayload } from '@/services/admin/locations'

interface Props {
  location: Location | null
  onClose: () => void
}

const EMPTY: LocationPayload = {
  name: '',
  address: '',
  city: '',
  phone: '',
  email: '',
  opening_hours: { mon_fri: '08:00-20:00', sat: '09:00-18:00', sun: 'closed' },
  is_active: true,
}

export function LocationFormModal({ location, onClose }: Props) {
  const isEdit = !!location
  const [form, setForm] = useState<LocationPayload>(EMPTY)
  const create = useCreateLocation()
  const update = useUpdateLocation()

  useEffect(() => {
    if (location) {
      setForm({
        name: location.name,
        address: location.address,
        city: location.city,
        phone: location.phone ?? '',
        email: location.email ?? '',
        opening_hours: location.opening_hours ?? EMPTY.opening_hours,
        is_active: location.is_active,
      })
    } else {
      setForm(EMPTY)
    }
  }, [location])

  const mutation = isEdit ? update : create

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isEdit && location) {
      update.mutate({ id: location.id, payload: form }, { onSuccess: onClose })
    } else {
      create.mutate(form, { onSuccess: onClose })
    }
  }

  const errorMessage = (() => {
    const err = mutation.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    const errs = err.response.data?.errors
    if (errs) {
      return Object.values(errs).flat().join(' ')
    }
    return err.response.data?.message ?? 'Gabim gjatë ruajtjes.'
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-cream shadow-xl">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink">
            {isEdit ? 'Ndrysho lokacionin' : 'Shto lokacion të re'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-ink/5"
          >
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

          <Field label="Emri *">
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </Field>

          <Field label="Adresa *">
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </Field>

          <Field label="Qyteti *">
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefoni">
              <input
                type="text"
                value={form.phone ?? ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-line accent-ink focus:ring-gold"
            />
            Aktiv (i dukshëm për klientët)
          </label>

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  )
}
