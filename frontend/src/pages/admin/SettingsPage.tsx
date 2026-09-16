import { useEffect, useState } from 'react'
import { Save, AlertCircle, Building2, DollarSign, Bell, Calendar } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { useSettings, useUpdateSettings } from '@/hooks/admin/useSettings'
import { cn } from '@/lib/cn'
import type { AppSetting } from '@/types/setting'
import type { ApiError } from '@/types/api'

const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  company: Building2,
  pricing: DollarSign,
  notifications: Bell,
  booking: Calendar,
}

const GROUP_LABELS: Record<string, string> = {
  company: 'Kompania',
  pricing: 'Çmimet',
  notifications: 'Njoftimet',
  booking: 'Rezervimet',
}

export default function SettingsPage() {
  const { data, isLoading } = useSettings()
  const update = useUpdateSettings()

  const [draft, setDraft] = useState<Record<string, unknown>>({})
  const [activeGroup, setActiveGroup] = useState<string>('company')
  const [success, setSuccess] = useState(false)

  // Inicializo draft kur ngarkohen settings
  useEffect(() => {
    if (! data) return
    const initial: Record<string, unknown> = {}
    Object.values(data).flat().forEach((s) => {
      initial[s.key] = s.value
    })
    setDraft(initial)
  }, [data])

  const groups = data ? Object.keys(data) : []
  const currentGroup = data?.[activeGroup] ?? []

  function setValue(key: string, value: unknown) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSuccess(false)

    // Vetëm fushat e grupit aktiv
    const groupSettings: Record<string, unknown> = {}
    currentGroup.forEach((s) => {
      groupSettings[s.key] = draft[s.key]
    })

    update.mutate(groupSettings, {
      onSuccess: () => {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      },
    })
  }

  const errorMessage = (() => {
    const err = update.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    const errs = err.response.data?.errors
    if (errs) return Object.values(errs).flat().join(' · ')
    return err.response.data?.message ?? 'Gabim gjatë ruajtjes.'
  })()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-line/40" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">Settings</h1>
        <p className="mt-2 text-muted">
          Konfigurimet e përgjithshme të sistemit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar i grupeve */}
        <aside className="rounded-2xl border border-line bg-white p-2 h-fit">
          {groups.map((group) => {
            const Icon = GROUP_ICONS[group] ?? Building2
            return (
              <button
                key={group}
                type="button"
                onClick={() => setActiveGroup(group)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  activeGroup === group
                    ? 'bg-ink text-cream'
                    : 'text-ink hover:bg-ink/5',
                )}
              >
                <Icon className="h-4 w-4" />
                {GROUP_LABELS[group] ?? group}
              </button>
            )
          })}
        </aside>

        {/* Formulari i grupit aktiv */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {success && (
            <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <Save className="h-5 w-5" />
              Konfigurimet u ruajtën.
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-white p-6 space-y-5">
            {currentGroup.map((s) => (
              <SettingField
                key={s.key}
                setting={s}
                value={draft[s.key]}
                onChange={(v) => setValue(s.key, v)}
              />
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" disabled={update.isPending}>
              {update.isPending ? 'Duke ruajtur…' : 'Ruaj ndryshimet'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SettingField({
  setting,
  value,
  onChange,
}: {
  setting: AppSetting
  value: unknown
  onChange: (v: unknown) => void
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">
        {setting.label}
      </label>
      {setting.description && (
        <p className="mb-2 text-xs text-muted">{setting.description}</p>
      )}

      {setting.type === 'bool' ? (
        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-ink"
          />
          {Boolean(value) ? 'Aktiv' : 'Joaktiv'}
        </label>
      ) : setting.type === 'int' ? (
        <input
          type="number"
          value={String(value ?? '')}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full max-w-md rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      ) : setting.type === 'float' ? (
        <input
          type="number"
          step="0.01"
          value={String(value ?? '')}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full max-w-md rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      ) : (
        <input
          type="text"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          className="w-full max-w-md rounded-lg border border-line bg-white px-3 py-2 text-sm focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      )}

      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
        <span className="font-mono">{setting.key}</span>
        {setting.is_public && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
            PUBLIC
          </span>
        )}
      </div>
    </div>
  )
}
