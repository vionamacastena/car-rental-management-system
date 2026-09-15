import { useBookingDraft } from '@/store/bookingDraft'
import { Button } from '@/components/ui/Button'

interface Props {
  onNext: () => void
  onBack: () => void
}

export function Step2Customer({ onNext, onBack }: Props) {
  const { draft, setDraft } = useBookingDraft()

  const canContinue =
    draft.firstName.trim() &&
    draft.lastName.trim() &&
    draft.email.trim() &&
    draft.phone.trim()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">Të dhënat e tua</h2>
        <p className="mt-1.5 text-sm text-muted">
          Nuk kërkohet llogari. Plotëso të dhënat për konfirmimin e rezervimit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Emri *">
          <TextInput
            value={draft.firstName}
            onChange={(v) => setDraft({ firstName: v })}
            required
          />
        </Field>
        <Field label="Mbiemri *">
          <TextInput
            value={draft.lastName}
            onChange={(v) => setDraft({ lastName: v })}
            required
          />
        </Field>

        <Field label="Email *">
          <TextInput
            type="email"
            value={draft.email}
            onChange={(v) => setDraft({ email: v })}
            required
          />
        </Field>
        <Field label="Telefoni *">
          <TextInput
            type="tel"
            value={draft.phone}
            onChange={(v) => setDraft({ phone: v })}
            placeholder="+383 44 123 456"
            required
          />
        </Field>

        <Field label="Qyteti">
          <TextInput value={draft.city} onChange={(v) => setDraft({ city: v })} />
        </Field>
        <Field label="Shteti">
          <TextInput value={draft.country} onChange={(v) => setDraft({ country: v })} />
        </Field>

        <Field label="Adresa">
          <TextInput value={draft.address} onChange={(v) => setDraft({ address: v })} />
        </Field>
        <Field label="Data e lindjes">
          <TextInput
            type="date"
            value={draft.dateOfBirth}
            onChange={(v) => setDraft({ dateOfBirth: v })}
          />
        </Field>

        <Field label="Numri i patentës">
          <TextInput
            value={draft.driverLicenseNumber}
            onChange={(v) => setDraft({ driverLicenseNumber: v })}
          />
        </Field>
        <Field label="Patenta skadon">
          <TextInput
            type="date"
            value={draft.driverLicenseExpiry}
            onChange={(v) => setDraft({ driverLicenseExpiry: v })}
          />
        </Field>
      </div>

      <Field label="Shënime (opsionale)">
        <textarea
          value={draft.notes}
          onChange={(e) => setDraft({ notes: e.target.value })}
          rows={3}
          placeholder="Kërkesa të veçanta, orë specifike…"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-y"
        />
      </Field>

      {/* Honeypot */}
      <input
        type="text"
        value={draft.website}
        onChange={(e) => setDraft({ website: e.target.value })}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline" size="lg">
          Kthehu
        </Button>
        <Button onClick={onNext} disabled={!canContinue} variant="primary" size="lg">
          Vazhdo
        </Button>
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

function TextInput({
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
    />
  )
}
