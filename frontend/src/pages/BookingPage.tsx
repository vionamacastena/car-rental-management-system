import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { StepIndicator } from '@/features/booking/StepIndicator'
import { Step1Dates } from '@/features/booking/steps/Step1Dates'
import { Step2Customer } from '@/features/booking/steps/Step2Customer'
import { Step3Review } from '@/features/booking/steps/Step3Review'
import { useBookingDraft } from '@/store/bookingDraft'

const STEPS = ['Datat', 'Të dhënat', 'Konfirmo']

export default function BookingPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>()
  const navigate = useNavigate()
  const { draft, setVehicle } = useBookingDraft()
  const [step, setStep] = useState(1)

  useEffect(() => {
    const id = Number(vehicleId)
    if (!id || Number.isNaN(id)) {
      navigate('/fleet', { replace: true })
      return
    }
    if (draft.vehicleId !== id) {
      setVehicle(id)
    }
  }, [vehicleId, draft.vehicleId, setVehicle, navigate])

  return (
    <div className="mx-auto max-w-shell px-6 lg:px-10 py-10">
      <Link
        to={`/vehicles/${vehicleId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Kthehu te automjeti
      </Link>

      <div className="mb-10">
        <StepIndicator current={step} steps={STEPS} />
      </div>

      <div className="mx-auto max-w-4xl">
        {step === 1 && <Step1Dates onNext={() => setStep(2)} />}
        {step === 2 && <Step2Customer onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <Step3Review onBack={() => setStep(2)} />}
      </div>
    </div>
  )
}
