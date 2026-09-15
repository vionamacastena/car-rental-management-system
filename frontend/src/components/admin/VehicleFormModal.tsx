import { X } from 'lucide-react'
import type { Vehicle } from '@/types/vehicle'

interface Props {
  vehicle: Vehicle | null
  onClose: () => void
}

export function VehicleFormModal({ onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-cream p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">Formulari vjen së shpejti</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-ink/5">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
