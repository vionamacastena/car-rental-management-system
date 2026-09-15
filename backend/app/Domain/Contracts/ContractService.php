<?php

namespace App\Domain\Contracts;

use App\Enums\ContractStatus;
use App\Models\Contract;
use App\Models\Rental;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ContractService
{
    /**
     * Gjeneron kontratën nga një rental me terms snapshot.
     */
    public function generateFromRental(Rental $rental, ?int $createdBy = null): Contract
    {
        return DB::transaction(function () use ($rental, $createdBy) {
            // Idempotent — kthe ekzistuesin
            $existing = Contract::where('rental_id', $rental->id)->first();
            if ($existing) {
                return $existing;
            }

            $contract = Contract::create([
                'contract_number' => (new Contract)->generateNumber(),
                'rental_id' => $rental->id,
                'customer_id' => $rental->customer_id,
                'vehicle_id' => $rental->vehicle_id,
                'status' => ContractStatus::DRAFT,
                'contract_version' => 1,
                'terms_snapshot' => $this->buildTermsSnapshot($rental),
                'created_by' => $createdBy,
            ]);

            $this->regeneratePdf($contract);

            return $contract->fresh();
        });
    }
    /**
 * Regjistron një firmë për kontratën.
 * Nëse të dyja palët kanë firmuar, statusi kalon në SIGNED.
 */
public function sign(
    Contract $contract,
    string $party,
    string $signature,
    ?string $ip = null,
): Contract {
    return DB::transaction(function () use ($contract, $party, $signature, $ip) {
        if ($contract->status === ContractStatus::CANCELLED) {
            throw new RuntimeException('Kontrata është e anuluar.');
        }

        if ($party === 'customer' && $contract->customer_signature) {
            throw new RuntimeException('Klienti e ka firmosur tashmë kontratën.');
        }

        if ($party === 'admin' && $contract->admin_signature) {
            throw new RuntimeException('Administratori e ka firmosur tashmë kontratën.');
        }

        $update = [];

        if ($party === 'customer') {
            $update['customer_signature'] = $signature;
            $update['customer_signed_at'] = now();
            $update['customer_signed_ip'] = $ip;
        } else {
            $update['admin_signature'] = $signature;
            $update['admin_signed_at'] = now();
            $update['admin_signed_ip'] = $ip;
        }

        // A ka të dyja firmat pas këtij update?
        $hasCustomer = $contract->customer_signature || $party === 'customer';
        $hasAdmin = $contract->admin_signature || $party === 'admin';

        if ($hasCustomer && $hasAdmin) {
            $update['status'] = ContractStatus::SIGNED;
        } elseif ($contract->status === ContractStatus::DRAFT) {
            $update['status'] = ContractStatus::PENDING_SIGNATURE;
        }

        $contract->update($update);

        // Rigjenero PDF me firmat e reja
        $this->regeneratePdf($contract);

        return $contract->fresh();
    });
}

    /**
     * Ndërton termat e kontratës bazuar në rental.
     */
    public function buildTermsSnapshot(Rental $rental): array
    {
        return [
            'mileage_policy' => [
                'limit_km' => $rental->mileage_limit ?? 250,
                'extra_km_price' => 0.20,
                'description' => '250 km/ditë, pastaj 0.20€ / km shtesë',
            ],
            'fuel_policy' => [
                'description' => 'Klienti duhet të kthejë automjetin me të njëjtin nivel karburanti',
                'refuel_charge' => 'Kostoja e karburantit + 10€ tarifë shërbimi',
            ],
            'insurance' => [
                'type' => 'Kasko e plotë',
                'deductible' => 300,
                'description' => 'Dëmet e vogla mbuluar me pjesëmarrje deri në 300€',
            ],
            'deposit' => [
                'amount' => (float) $rental->deposit_amount,
                'description' => 'Bllokim në kartë, kthehet brenda 5 ditëve pune',
            ],
            'late_return' => [
                'price_per_hour' => 5.00,
                'description' => 'Kthim me vonesë tarifohet 5€ / orë',
            ],
            'pickup_return' => [
                'pickup_at' => $rental->planned_pickup_at->toIso8601String(),
                'return_at' => $rental->planned_return_at->toIso8601String(),
                'pickup_location' => $rental->pickupLocation?->name,
                'return_location' => $rental->returnLocation?->name,
            ],
            'payment_terms' => [
                'method' => 'Kartë krediti ose cash',
                'due' => 'Në momentin e marrjes',
                'currency' => 'EUR',
            ],
            'responsibilities' => [
                'Klienti mban përgjegjësi për dëmet e shkaktuara gjatë periudhës së qirasë.',
                'Klienti duhet të respektojë ligjin e qarkullimit rrugor.',
                'Ndalohet dhënia e automjetit personave të tretë.',
                'Ndalohet përdorimi për transport mallrash të paligjshëm.',
            ],
        ];
    }

    /**
     * Rigjeneron PDF-në e kontratës.
     */
    public function regeneratePdf(Contract $contract): string
    {
        $contract->load([
            'rental.pickupLocation',
            'rental.returnLocation',
            'customer',
            'vehicle',
        ]);

        $pdf = Pdf::loadView('contracts.show', [
            'contract' => $contract,
            'rental' => $contract->rental,
            'customer' => $contract->customer,
            'vehicle' => $contract->vehicle,
            'terms' => $contract->terms_snapshot,
        ])->setPaper('a4');

        $path = "contracts/{$contract->contract_number}.pdf";
        Storage::disk('local')->put($path, $pdf->output());

        $contract->update(['pdf_path' => $path]);

        return $path;
    }

    public function getPdfContents(Contract $contract): ?string
    {
        if (! $contract->pdf_path || ! Storage::disk('local')->exists($contract->pdf_path)) {
            return null;
        }

        return Storage::disk('local')->get($contract->pdf_path);
    }
}
