import { X, User, Globe, Activity } from 'lucide-react'
import { AuditActionBadge, entityLabel } from './AuditBadges'
import { formatValue, fieldLabel } from '@/lib/auditFormat'
import type { AuditLogEntry } from '@/types/auditLog'

interface Props {
  log: AuditLogEntry
  onClose: () => void
}

export function AuditLogDetailModal({ log, onClose }: Props) {
  const changes = Object.entries(log.changed_fields)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-cream shadow-2xl">
        <div className="flex items-start justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Detajet e audit log</h2>
            <p className="mt-0.5 text-xs text-muted">
              {log.created_at && new Date(log.created_at).toLocaleString('sq-AL')} · {log.human_time}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-ink/5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Header info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card icon={<Activity className="h-4 w-4" />} title="Veprimi">
              <AuditActionBadge action={log.action} />
              {log.description && (
                <p className="mt-2 text-sm text-muted">{log.description}</p>
              )}
            </Card>

            <Card icon={<User className="h-4 w-4" />} title="Kryer nga">
              <p className="text-sm font-medium text-ink">{log.user.name ?? 'Sistemi'}</p>
              {log.user.email && <p className="text-xs text-muted">{log.user.email}</p>}
            </Card>
          </div>

          {/* Entity info */}
          <Card title="Entiteti">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-sm font-medium text-ink">
                  {entityLabel(log.entity.short_name)}
                </p>
                <p className="text-xs text-muted">
                  {log.entity.label ?? `#${log.entity.id}`}
                </p>
              </div>
              <span className="font-mono text-xs text-muted">ID: {log.entity.id}</span>
            </div>
          </Card>

          {/* Changes */}
          {changes.length > 0 ? (
            <Card title={`Ndryshimet (${changes.length})`}>
              <div className="space-y-2">
                {changes.map(([key, { old, new: newVal }]) => (
                  <div key={key} className="rounded-lg border border-line bg-white p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">
                      {fieldLabel(key)}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Para</p>
                        <p className="mt-0.5 break-words text-red-600 line-through">
                          {formatValue(old)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-muted">Pas</p>
                        <p className="mt-0.5 break-words font-medium text-emerald-700">
                          {formatValue(newVal)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : log.action === 'created' && log.new_values ? (
            <Card title="Të dhënat e krijuara">
              <div className="space-y-1.5 text-xs">
                {Object.entries(log.new_values).slice(0, 20).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="w-32 shrink-0 text-muted">{fieldLabel(key)}</span>
                    <span className="break-words text-ink">{formatValue(value)}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {/* Request info */}
          <Card icon={<Globe className="h-4 w-4" />} title="Konteksti i kërkesës">
            <dl className="space-y-1.5 text-xs">
              <Row label="IP" value={log.ip_address ?? '—'} />
              <Row label="Metoda" value={log.method ?? '—'} />
              <Row label="URL" value={log.url ?? '—'} mono />
              <Row label="User Agent" value={log.user_agent ?? '—'} />
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Card({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="w-24 shrink-0 text-muted">{label}</dt>
      <dd className={`break-all text-ink ${mono ? 'font-mono' : ''}`}>{value}</dd>
    </div>
  )
}
