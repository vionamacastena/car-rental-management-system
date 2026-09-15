import { useAuthStore } from '@/store/auth'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">
        Mirë se vini, {user?.name}
      </h1>
      <p className="mt-2 text-muted">
        Ky është dashboard-i i admin-it. Statistikat dhe KPI-t vijnë në Fazën 8.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Automjete', value: '6' },
          { label: 'Rezervime aktive', value: '0' },
          { label: 'Klientë', value: '0' },
          { label: 'Të ardhura (muaji)', value: '€0' },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-ink">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
