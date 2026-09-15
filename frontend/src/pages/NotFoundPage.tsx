import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-shell px-6 lg:px-10 py-32 text-center">
      <p className="font-display text-7xl font-bold text-ink/20">404</p>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink">Faqja nuk u gjet</h1>
      <p className="mt-2 text-muted">Faqja që po kërkoni nuk ekziston.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-lg bg-ink px-6 py-3 text-sm font-medium text-cream transition-colors hover:bg-ink/90"
      >
        Kthehu në kryefaqe
      </Link>
    </div>
  )
}
