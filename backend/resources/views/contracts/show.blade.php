<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $contract->contract_number }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #0F1417;
            margin: 0;
            padding: 30px 40px;
            line-height: 1.5;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0F1417;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .brand { font-size: 20px; font-weight: bold; letter-spacing: 1px; }
        .brand-sub { font-size: 9px; color: #666; margin-top: 3px; }
        .title { text-align: right; }
        .title h1 { margin: 0; font-size: 22px; }
        .title .num { font-family: monospace; font-size: 11px; color: #666; margin-top: 4px; }
        .title .status {
            display: inline-block;
            margin-top: 6px;
            padding: 2px 8px;
            border-radius: 3px;
            background: #eee;
            font-size: 9px;
            text-transform: uppercase;
        }
        .section {
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0F1417;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            padding-bottom: 4px;
            margin-bottom: 8px;
        }
        .grid { display: flex; gap: 15px; }
        .col { flex: 1; }
        .field { margin-bottom: 6px; }
        .field-label { font-size: 8px; text-transform: uppercase; color: #888; margin-bottom: 1px; }
        .field-value { font-size: 10px; }
        .field-value strong { font-size: 11px; }
        ul { margin: 5px 0; padding-left: 18px; }
        li { margin-bottom: 3px; font-size: 10px; }
        .terms-block {
            background: #f8f8f8;
            border-left: 3px solid #D4A24C;
            padding: 8px 12px;
            margin-bottom: 8px;
        }
        .terms-block .label {
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 2px;
        }
        .terms-block .desc {
            font-size: 9px;
            color: #555;
        }
        .signatures {
            display: flex;
            gap: 30px;
            margin-top: 25px;
            page-break-inside: avoid;
        }
        .signature-box {
            flex: 1;
            border-top: 1px solid #0F1417;
            padding-top: 6px;
            min-height: 70px;
        }
        .signature-label {
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #666;
        }
        .signature-img {
            max-height: 60px;
            max-width: 100%;
            margin: 4px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 12px;
            border-top: 1px solid #ddd;
            font-size: 8px;
            color: #888;
            text-align: center;
        }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>

<!-- HEADER -->
<div class="header">
    <div>
        <div class="brand">DRIVEWAY RENT-A-CAR</div>
        <div class="brand-sub">
            Prishtina · Prizren · Peja<br>
            info@driveway-rentacar.com · +383 38 501 502<br>
            NUI: 810123456 · TVSH: AL12345678
        </div>
    </div>
    <div class="title">
        <h1>KONTRATË QIRAJE</h1>
        <div class="num">{{ $contract->contract_number }}</div>
        <div class="status">{{ $contract->status->label() }}</div>
    </div>
</div>

<!-- PARTIES -->
<div class="section">
    <div class="section-title">Palët</div>
    <div class="grid">
        <div class="col">
            <div class="field">
                <div class="field-label">Qiradhënësi</div>
                <div class="field-value">
                    <strong>Driveway Rent-A-Car SH.P.K.</strong><br>
                    Rr. Nëna Terezë 45, Prishtinë 10000<br>
                    NUI: 810123456
                </div>
            </div>
        </div>
        <div class="col">
            <div class="field">
                <div class="field-label">Qiradhënësi (Klienti)</div>
                <div class="field-value">
                    <strong>{{ $customer->full_name }}</strong><br>
                    {{ $customer->email }}<br>
                    {{ $customer->phone }}<br>
                    @if($customer->address){{ $customer->address }}<br>@endif
                    @if($customer->city){{ $customer->city }}, {{ $customer->country }}@endif
                    @if($customer->driver_license_number)
                        <br>Patenta: {{ $customer->driver_license_number }}
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<!-- VEHICLE -->
<div class="section">
    <div class="section-title">Automjeti</div>
    <div class="grid">
        <div class="col">
            <div class="field">
                <div class="field-label">Marka & Modeli</div>
                <div class="field-value"><strong>{{ $vehicle->full_name }}</strong></div>
            </div>
            <div class="field">
                <div class="field-label">Viti / Ngjyra</div>
                <div class="field-value">{{ $vehicle->year }} / {{ $vehicle->color ?? '—' }}</div>
            </div>
        </div>
        <div class="col">
            <div class="field">
                <div class="field-label">Targa</div>
                <div class="field-value" style="font-family: monospace; font-size: 12px;">
                    {{ $vehicle->license_plate }}
                </div>
            </div>
            <div class="field">
                <div class="field-label">Kilometrazhi</div>
                <div class="field-value">{{ number_format($rental->pickup_mileage ?? $vehicle->mileage) }} km</div>
            </div>
        </div>
        <div class="col">
            <div class="field">
                <div class="field-label">Karburanti / Transmisioni</div>
                <div class="field-value">
                    {{ $vehicle->fuel_type->label() }} / {{ $vehicle->transmission->label() }}
                </div>
            </div>
            <div class="field">
                <div class="field-label">Vende</div>
                <div class="field-value">{{ $vehicle->seats }}</div>
            </div>
        </div>
    </div>
</div>

<!-- PERIOD -->
<div class="section">
    <div class="section-title">Periudha e Qirasë</div>
    <div class="grid">
        <div class="col">
            <div class="field">
                <div class="field-label">Marrja</div>
                <div class="field-value">
                    <strong>{{ $rental->planned_pickup_at->format('d.m.Y H:i') }}</strong><br>
                    {{ $rental->pickupLocation?->name }}
                </div>
            </div>
        </div>
        <div class="col">
            <div class="field">
                <div class="field-label">Kthimi</div>
                <div class="field-value">
                    <strong>{{ $rental->planned_return_at->format('d.m.Y H:i') }}</strong><br>
                    {{ $rental->returnLocation?->name }}
                </div>
            </div>
        </div>
        <div class="col">
            <div class="field">
                <div class="field-label">Totali</div>
                <div class="field-value" style="font-size: 14px;">
                    <strong>{{ number_format($rental->total_amount, 2) }}€</strong>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- TERMS -->
<div class="section">
    <div class="section-title">Kushtet e Qirasë</div>

    <div class="terms-block">
        <div class="label">1. Kilometrazhi</div>
        <div class="desc">{{ $terms['mileage_policy']['description'] ?? '—' }}</div>
    </div>

    <div class="terms-block">
        <div class="label">2. Karburanti</div>
        <div class="desc">{{ $terms['fuel_policy']['description'] ?? '—' }}</div>
    </div>

    <div class="terms-block">
        <div class="label">3. Sigurimi</div>
        <div class="desc">
            {{ $terms['insurance']['type'] ?? 'Kasko' }} —
            pjesëmarrje {{ $terms['insurance']['deductible'] ?? 300 }}€
        </div>
    </div>

    <div class="terms-block">
        <div class="label">4. Depozita</div>
        <div class="desc">{{ $terms['deposit']['description'] ?? '—' }}</div>
    </div>

    <div class="terms-block">
        <div class="label">5. Kthimi me vonesë</div>
        <div class="desc">{{ $terms['late_return']['description'] ?? '—' }}</div>
    </div>

    <div class="terms-block">
        <div class="label">6. Përgjegjësitë e Qiradhënësit</div>
        <ul>
            @foreach(($terms['responsibilities'] ?? []) as $r)
                <li>{{ $r }}</li>
            @endforeach
        </ul>
    </div>
</div>

<!-- SIGNATURES -->
<div class="signatures">
    <div class="signature-box">
        <div class="signature-label">Qiradhënësi — Driveway Rent-A-Car</div>
        @if($contract->admin_signature)
            <img class="signature-img" src="{{ $contract->admin_signature }}" alt="Admin Signature">
            <div style="font-size: 9px; color: #666;">
                Firma u regjistrua: {{ $contract->admin_signed_at?->format('d.m.Y H:i') }}
            </div>
        @else
            <div style="height: 60px;"></div>
            <div style="font-size: 9px; color: #999;">Nënshkruhet nga ana e kompanisë</div>
        @endif
    </div>
    <div class="signature-box">
        <div class="signature-label">Qiradhënësi (Klienti) — {{ $customer->full_name }}</div>
        @if($contract->customer_signature)
            <img class="signature-img" src="{{ $contract->customer_signature }}" alt="Customer Signature">
            <div style="font-size: 9px; color: #666;">
                Firma u regjistrua: {{ $contract->customer_signed_at?->format('d.m.Y H:i') }}
            </div>
        @else
            <div style="height: 60px;"></div>
            <div style="font-size: 9px; color: #999;">Nënshkruhet nga klienti</div>
        @endif
    </div>
</div>

<div class="footer">
    Ky dokument përbën marrëveshje të plotë mes palëve. Data e gjenerimit:
    {{ $contract->created_at->format('d.m.Y H:i') }} ·
    Versioni {{ $contract->contract_version }}<br>
    Driveway Rent-A-Car SH.P.K. · Prishtinë, Kosovë
</div>

</body>
</html>
