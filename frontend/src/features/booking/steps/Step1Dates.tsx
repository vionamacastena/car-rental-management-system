import { MapPin, Calendar } from 'lucide-react'
import { useBookingDraft } from '@/store/bookingDraft'
import { useLocations } from '@/hooks/useLocations'
import { Button } from '@/components/ui/Button'

interface Props {
  onNext: () => void
}

export function Step1Dates({ onNext }: Props) {
  const { draft, setDraft } = useBookingDraft()
  const { data: locations, isLoading } = useLocations()

  const canContinue =
    draft.pickupLocationId &&
    draft.returnLocationId &&
    draft.pickupAt &&
    draft.returnAt

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Kur dhe ku?</h2>
        <p className="mt-1.5 text-sm text-muted">
          Zgjidh lokacionet dhe periudhën e marrjes/kthimit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field icon={<MapPin className="h-4 w-4" />} label="Lokacioni i marrjes">
          <select
            value={draft.pickupLocationId ?? ''}
            onChange={(e) =>
              setDraft({ pickupLocationId: e.target.value ? Number(e.target.value) : null })
            }
            disabled={isLoading}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            <option value="">Zgjidh lokacionin</option>
            {locations?.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </Field>

        <Field icon={<MapPin className="h-4 w-4" />} label="Lokacioni i kthimit">
          <select
            value={draft.returnLocationId ?? ''}
            onChange={(e) =>
              setDraft({ returnLocationId: e.target.value ? Number(e.target.value) : null })
            }
            disabled={isLoading}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            <option value="">Zgjidh lokacionin</option>
            {locations?.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </Field>

        <Field icon={<Calendar className="h-4 w-4" />} label="Data e marrjes">
          <input
            type="datetime-local"
            value={draft.pickupAt}
            onChange={(e) => setDraft({ pickupAt: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </Field>

        <Field icon={<Calendar className="h-4 w-4" />} label="Data e kthimit">
          <input
            type="datetime-local"
            value={draft.returnAt}
            onChange={(e) => setDraft({ returnAt: e.target.value })}
            min={draft.pickupAt || new Date().toISOString().slice(0, 16)}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </Field>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!canContinue} variant="primary" size="lg">
          Vazhdo
        </Button>
      </div>
    </div>
  )
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
        <span className="text-muted">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  )
}
