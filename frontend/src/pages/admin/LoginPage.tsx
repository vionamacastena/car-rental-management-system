import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Car, Lock, Mail, AlertCircle } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { useLogin } from '@/features/auth/useLogin'
import type { ApiError } from '@/types/api'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@driveway-rentacar.com')
  const [password, setPassword] = useState('')
  const login = useLogin()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    login.mutate({ email, password })
  }

  const errorMessage = (() => {
    const err = login.error as AxiosError<ApiError> | null
    if (!err) return null
    if (err.response?.status === 429) {
      return 'Shumë tentativa. Provo përsëri pas 15 minutash.'
    }
    return err.response?.data?.message ?? 'Gabim gjatë login-it.'
  })()

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Form */}
      <div className="flex items-center justify-center px-6 py-12 bg-cream">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 inline-flex items-center gap-3 group">
            <Car className="h-7 w-7 text-ink" />
            <span className="font-display text-xl font-bold tracking-tight uppercase text-ink">
              Driveway Rent-A-Car
            </span>
          </Link>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-muted">
              <Lock className="h-3 w-3" />
              Admin Panel
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold text-ink">Mirë se vini</h1>
            <p className="mt-2 text-sm text-muted">
              Login për të menaxhuar flotën, rezervimet dhe biznesin.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-line bg-white pl-10 pr-3 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
                Fjalëkalimi
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-line bg-white pl-10 pr-3 py-2.5 text-sm text-ink focus:border-ink/30 focus:outline-none focus:ring-2 focus:ring-gold/30"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-semibold"
              disabled={login.isPending}
            >
              {login.isPending ? 'Duke u loguar…' : 'Hyr'}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted">
            Demo: <span className="font-mono">admin@driveway-rentacar.com</span> / <span className="font-mono">password</span>
          </p>
        </div>
      </div>

      {/* Right: Decorative */}
      <div className="hidden lg:flex items-center justify-center bg-ink-700 p-12">
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight text-cream">
            Menaxho gjithçka nga një vend.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-cream/60">
            Flota, rezervimet, klientët, pagesat, kontratat, maintenance dhe raportet —
            të centralizuara në një dashboard të vetëm.
          </p>
          <div className="mt-10 space-y-3 text-sm text-cream/50">
            <p>· Fleet Management</p>
            <p>· Reservations & Rentals</p>
            <p>· Payments & Deposits</p>
            <p>· Reports & KPIs</p>
          </div>
        </div>
      </div>
    </div>
  )
}
