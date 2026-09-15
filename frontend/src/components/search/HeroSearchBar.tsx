import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Search } from 'lucide-react'
import { useLocations } from '@/hooks/useLocations'
import { Button } from '@/components/ui/Button'

export function HeroSearchBar() {
  const navigate = useNavigate()
  const { data: locations, isLoading } = useLocations()

  const [pickupLocationId, setPickupLocationId] = useState<string>('')
  const [returnLocationId, setReturnLocationId] = useState<string>('')
  const [pickupDate, setPickupDate] = useState<string>('')
  const [returnDate, setReturnDate] = useState<string>('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (pickupLocationId) params.set('pickup_location_id', pickupLocationId)
    if (returnLocationId) params.set('return_location_id', returnLocationId)
    if (pickupDate) params.set('pickup_at', pickupDate)
    if (returnDate) params.set('return_at', returnDate)
    navigate(`/fleet?${params.toString()}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-ink-700 p-4 md:p-5 shadow-2xl shadow-ink/10"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_1fr_1fr_auto] gap-3">
        <Field icon={<MapPin className="h-4 w-4" />} label="Marja">
          <select
            value={pickupLocationId}
            onChange={(e) => setPickupLocationId(e.target.value)}
            disabled={isLoading}
            className="w-full appearance-none rounded-lg border border-white/10 bg-ink-600 px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none disabled:opacity-50"
          >
            <option value="">Zgjidh lokacionin</option>
            {locations?.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<MapPin className="h-4 w-4" />} label="Kthimi">
          <select
            value={returnLocationId}
            onChange={(e) => setReturnLocationId(e.target.value)}
            disabled={isLoading}
            className="w-full appearance-none rounded-lg border border-white/10 bg-ink-600 px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none disabled:opacity-50"
          >
            <option value="">Zgjidh lokacionin</option>
            {locations?.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </Field>

        <Field icon={<Calendar className="h-4 w-4" />} label="Data e marrjes">
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-ink-600 px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none [color-scheme:dark]"
          />
        </Field>

        <Field icon={<Calendar className="h-4 w-4" />} label="Data e kthimit">
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-ink-600 px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none [color-scheme:dark]"
          />
        </Field>

        <div className="flex items-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full lg:w-auto lg:px-8 h-[42px] font-semibold"
          >
            <Search className="h-4 w-4" />
            Kërko
          </Button>
        </div>
      </div>
    </form>
  )
}

interface FieldProps {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}

function Field({ icon, label, children }: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-cream/70">
        {icon}
        {label}
      </label>
      {children}
    </div>
  )
}
