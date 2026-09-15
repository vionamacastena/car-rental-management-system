import { useEffect, useState, type FormEvent } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import {
  useCreateMaintenance,
  useUpdateMaintenance,
} from '@/hooks/admin/useAdminMaintenance'
import { useAdminVehicles } from '@/hooks/admin/useAdminVehicles'
import {
  MAINTENANCE_TYPE_OPTIONS,
  MAINTENANCE_STATUS_OPTIONS,
} from '@/components/admin/MaintenanceBadges'
import type { MaintenanceRecord, MaintenanceTypeValue, MaintenanceStatusValue } from '@/types/maintenance'
import type { ApiError } from '@/types/api'
import type { MaintenancePayload } from '@/services/admin/maintenance'

interface Props {
  record: MaintenanceRecord | null
  onClose: () => void
}

const EMPTY: MaintenancePayload = {
  vehicle_id: 0,
  type: 'service',
  status: 'scheduled',
  title: '',
  description: '',
  scheduled_at: '',
  performed_at: '',
  next_service_at: '',
  mileage_at_service: null,
  next_service_mileage: null,
  cost: 0,
  provider_name: '',
  provider_phone: '',
  invoice_number: '',
  blocks_vehicle: false,
}

export function MaintenanceFormModal({ record, onClose }: Props) {
  const isEdit = !!record
  const [form, setForm] = useState<MaintenancePayload>(EMPTY)
  const { data: vehiclesData } = useAdminVehicles({ per_page: 100 })
  const create = useCreateMaintenance()
  const update = useUpdateMaintenance()

  useEffect(() => {
    if (record) {
      setForm({
        vehicle_id: record.vehicle.id,
        type: record.type.value,
        status: record.status.value,
        title: record.title,
        description: record.description ?? '',
        scheduled_at: record.scheduled_at ?? '',
        performed_at: record.performed_at ?? '',
        next_service_at: record.next_service_at ?? '',
        mileage_at_service: record.mileage_at_service,
        next_service_mileage: record.next_service_mileage,
        cost: record.cost,
        provider_name: record.provider_name ?? '',
        provider_phone: record.provider_phone ?? '',
        invoice_number: record.invoice_number ?? '',
        blocks_vehicle: record.blocks_vehicle,
      })
    } else {
      setForm({
        ...EMPTY,
        vehicle_id: vehiclesData?.data[0]?.id ?? 0,
      })
    }
  }, [record, vehiclesData])

  const mutation = isEdit ? update : create

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload: MaintenancePayload = {
      ...form,
      description: form.description || null,
      scheduled_at: form.scheduled_at || null,
      performed_at: form.performed_at || null,
      next_service_at: form.next_service_at || null,
      provider_name: form.provider_name || null,
      provider_phone: form.provider_phone || null,
      invoice_number: form.invoice_number || null,
    }

    if (isEdit && record) {
      update.mutate({ id: record.id, payload }, { onSuccess: onClose })
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
              {isEdit ? 'Ndrysho maintenance' : 'Shto maintenance'}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {isEdit ? record?.maintenance_code : 'Regjistro një maintenance të re'}
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
            <Field label="Automjeti *">
              <select
                required
                value={form.vehicle_id || ''}
                onChange={(e) => setForm({ ...form, vehicle_id: Number(e.target.value) })}
                disabled={isEdit}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm disabled:opacity-60"
              >
                <option value="">Zgjidh automjetin</option>
                {vehiclesData?.data.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.full_name} — {v.license_plate}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Lloji *">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MaintenanceTypeValue })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              >
                {MAINTENANCE_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Statusi *">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as MaintenanceStatusValue })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              >
                {MAINTENANCE_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Titulli *">
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="p.sh. Ndryshim vaji 10.000 km"
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <Field label="Përshkrim">
            <textarea
              rows={3}
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Shënime shtesë…"
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm resize-y"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Planifikuar më">
              <input
                type="date"
                value={form.scheduled_at ?? ''}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Kryer më">
              <input
                type="date"
                value={form.performed_at ?? ''}
                onChange={(e) => setForm({ ...form, performed_at: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Servisi i ardhshëm">
              <input
                type="date"
                value={form.next_service_at ?? ''}
                onChange={(e) => setForm({ ...form, next_service_at: e.target.value })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Km në servis">
              <input
                type="number"
                min={0}
                value={form.mileage_at_service ?? ''}
                onChange={(e) => setForm({ ...form, mileage_at_service: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Km për servisin e ardhshëm">
              <input
                type="number"
                min={0}
                value={form.next_service_mileage ?? ''}
                onChange={(e) => setForm({ ...form, next_service_mileage: e.target.value ? Number(e.target.value) : null })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Kosto (€)">
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.cost ?? 0}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Numri i faturës">
              <input
                type="text"
                value={form.invoice_number ?? ''}
                onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                placeholder="Opsionale"
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Ofruesi">
              <input
                type="text"
                value={form.provider_name ?? ''}
                onChange={(e) => setForm({ ...form, provider_name: e.target.value })}
                placeholder="p.sh. AutoServis Prishtina"
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>

            <Field label="Telefoni i ofruesit">
              <input
                type="text"
                value={form.provider_phone ?? ''}
                onChange={(e) => setForm({ ...form, provider_phone: e.target.value })}
                placeholder="+383 …"
                className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.blocks_vehicle ?? false}
              onChange={(e) => setForm({ ...form, blocks_vehicle: e.target.checked })}
              className="h-4 w-4 rounded border-line accent-ink"
            />
            Bllokon automjetin (statusi → MAINTENANCE)
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
