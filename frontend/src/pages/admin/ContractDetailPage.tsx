import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, RefreshCw, AlertCircle, User, Building2, FileSignature } from 'lucide-react'
import { AxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { SignaturePad } from '@/components/admin/SignaturePad'
import { ContractStatusBadge } from '@/components/admin/ContractStatusBadge'
import { useAdminContract, useSignContract, useDownloadContractPdf } from '@/hooks/admin/useAdminContracts'
import { useRegenerateInvoicePdf } from '@/hooks/admin/useAdminInvoices'
import type { ApiError } from '@/types/api'

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const contractId = Number(id)
  const { data: contract, isLoading } = useAdminContract(contractId)

  const sign = useSignContract()
  const download = useDownloadContractPdf()
  const regenerate = useRegenerateInvoicePdf()

  const [customerSig, setCustomerSig] = useState<string | null>(null)
  const [adminSig, setAdminSig] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="h-8 w-1/2 animate-pulse rounded bg-line/40" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="text-center py-16">
        <p className="font-display text-xl font-bold text-ink">Kontrata nuk u gjet</p>
        <Link to="/admin/contracts" className="mt-4 inline-block text-sm text-ink underline">
          Kthehu
        </Link>
      </div>
    )
  }

  function handleSign(party: 'customer' | 'admin', signature: string | null) {
    if (!signature) return
    sign.mutate(
      { id: contractId, party, signature },
      {
        onSuccess: () => {
          if (party === 'customer') setCustomerSig(null)
          else setAdminSig(null)
        },
      },
    )
  }

  const errorMessage = (() => {
    const err = sign.error as AxiosError<ApiError> | null
    if (!err?.response) return null
    return err.response.data?.message ?? 'Gabim gjatë firmës.'
  })()

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/admin/contracts"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Kthehu në kontrata
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted">Kontrata</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">{contract.contract_number}</h1>
          <div className="mt-3 flex items-center gap-3">
            <ContractStatusBadge status={contract.status.value} />
            <span className="text-xs text-muted">Versioni {contract.contract_version}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => regenerate.mutate(contractId)}
            disabled={regenerate.isPending}
          >
            <RefreshCw className="h-4 w-4" />
            Rigjenero
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => download.mutate({ id: contract.id, number: contract.contract_number })}
            disabled={download.isPending}
          >
            <Download className="h-4 w-4" />
            Shkarko PDF
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info cards */}
        <div className="space-y-5">
          <Card icon={<User className="h-4 w-4" />} title="Klienti">
            <p className="font-medium text-ink">{contract.customer.full_name}</p>
            <p className="text-sm text-muted">{contract.customer.email}</p>
            <p className="text-sm text-muted">{contract.customer.phone}</p>
          </Card>

          <Card icon={<FileSignature className="h-4 w-4" />} title="Automjeti">
            <p className="font-medium text-ink">{contract.vehicle.full_name}</p>
            <p className="font-mono text-xs text-muted">{contract.vehicle.license_plate}</p>
          </Card>

          <Card icon={<Building2 className="h-4 w-4" />} title="Kushtet kryesore">
            <ul className="space-y-2 text-sm text-ink">
              <li>
                <span className="text-muted">Kilometrazhi:</span>{' '}
                {contract.terms_snapshot.mileage_policy?.description ?? '—'}
              </li>
              <li>
                <span className="text-muted">Sigurimi:</span>{' '}
                {contract.terms_snapshot.insurance?.type ?? '—'}
              </li>
              <li>
                <span className="text-muted">Depozita:</span>{' '}
                {contract.terms_snapshot.deposit?.amount ?? 0}€
              </li>
              <li>
                <span className="text-muted">Vonesa:</span>{' '}
                {contract.terms_snapshot.late_return?.description ?? '—'}
              </li>
            </ul>
          </Card>
        </div>

        {/* Signature panel */}
        <div className="space-y-5">
          <Card
            icon={<User className="h-4 w-4" />}
            title="Firma e Klientit"
            badge={contract.signatures.customer_signed ? 'signed' : 'pending'}
            signedAt={contract.signatures.customer_signed_at}
          >
            {contract.signatures.customer_signed ? (
              <p className="text-sm text-green-700">✓ Klienti e ka firmosur</p>
            ) : (
              <>
                <SignaturePad
                  value={customerSig}
                  onChange={setCustomerSig}
                  label="Firma e klientit"
                />
                <Button
                  variant="primary"
                  size="md"
                  className="mt-3 w-full"
                  disabled={!customerSig || sign.isPending}
                  onClick={() => handleSign('customer', customerSig)}
                >
                  Regjistro firmën e klientit
                </Button>
              </>
            )}
          </Card>

          <Card
            icon={<Building2 className="h-4 w-4" />}
            title="Firma e Adminit"
            badge={contract.signatures.admin_signed ? 'signed' : 'pending'}
            signedAt={contract.signatures.admin_signed_at}
          >
            {contract.signatures.admin_signed ? (
              <p className="text-sm text-green-700">✓ Admini e ka firmosur</p>
            ) : (
              <>
                <SignaturePad
                  value={adminSig}
                  onChange={setAdminSig}
                  label="Firma e adminit"
                />
                <Button
                  variant="primary"
                  size="md"
                  className="mt-3 w-full"
                  disabled={!adminSig || sign.isPending}
                  onClick={() => handleSign('admin', adminSig)}
                >
                  Regjistro firmën e adminit
                </Button>
              </>
            )}
          </Card>

          {contract.signatures.fully_signed && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-center">
              <p className="font-display text-sm font-semibold text-green-800">
                ✓ Kontrata u nënshkrua nga të dyja palët
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Card({
  icon,
  title,
  badge,
  signedAt,
  children,
}: {
  icon: React.ReactNode
  title: string
  badge?: 'signed' | 'pending'
  signedAt?: string | null
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
          {icon}
          {title}
        </h3>
        {badge === 'signed' && (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-800">
            SIGNED
          </span>
        )}
        {badge === 'pending' && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
            PENDING
          </span>
        )}
      </div>
      {signedAt && (
        <p className="mb-3 text-xs text-muted">
          {new Date(signedAt).toLocaleString('sq-AL')}
        </p>
      )}
      {children}
    </div>
  )
}
