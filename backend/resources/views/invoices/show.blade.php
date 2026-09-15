<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $invoice->invoice_number }}</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 11px;
            color: #0F1417;
            margin: 0;
            padding: 30px 40px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0F1417;
            padding-bottom: 15px;
            margin-bottom: 25px;
        }
        .brand {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .brand-sub {
            font-size: 9px;
            color: #666;
            margin-top: 3px;
        }
        .invoice-title {
            text-align: right;
        }
        .invoice-title h1 {
            margin: 0;
            font-size: 24px;
            color: #0F1417;
        }
        .invoice-number {
            font-family: monospace;
            font-size: 12px;
            color: #666;
            margin-top: 4px;
        }
        .grid {
            display: flex;
            gap: 20px;
            margin-bottom: 25px;
        }
        .col { flex: 1; }
        .label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #888;
            margin-bottom: 3px;
        }
        .value {
            font-size: 11px;
            line-height: 1.5;
        }
        .value strong { font-size: 12px; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #666;
            padding: 8px 10px;
            border-bottom: 1px solid #ccc;
        }
        td {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }
        td.right, th.right { text-align: right; }
        .totals {
            width: 280px;
            margin-left: auto;
        }
        .totals table {
            width: 100%;
            margin: 0;
        }
        .totals td { padding: 4px 10px; border: none; }
        .totals .grand td {
            font-size: 14px;
            font-weight: bold;
            border-top: 2px solid #0F1417;
            padding-top: 8px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 15px;
            border-top: 1px solid #ddd;
            font-size: 9px;
            color: #888;
            text-align: center;
        }
        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: bold;
        }
        .badge-paid { background: #d4f4dd; color: #0a5c2b; }
        .badge-issued { background: #d6eaff; color: #07417a; }
        .badge-draft { background: #eee; color: #555; }
    </style>
</head>
<body>

<div class="header">
    <div>
        <div class="brand">DRIVEWAY RENT-A-CAR</div>
        <div class="brand-sub">
            Prishtina · Prizren · Peja<br>
            info@driveway-rentacar.com · +383 38 501 502
        </div>
    </div>
    <div class="invoice-title">
        <h1>FATURË</h1>
        <div class="invoice-number">{{ $invoice->invoice_number }}</div>
        <div style="margin-top: 8px;">
            <span class="badge badge-{{ $invoice->status->value }}">{{ $invoice->status->label() }}</span>
        </div>
    </div>
</div>

<div class="grid">
    <div class="col">
        <div class="label">Klienti</div>
        <div class="value">
            <strong>{{ $customer->full_name }}</strong><br>
            {{ $customer->email }}<br>
            {{ $customer->phone }}<br>
            @if($customer->address){{ $customer->address }}<br>@endif
            @if($customer->city){{ $customer->city }}, {{ $customer->country }}@endif
        </div>
    </div>
    <div class="col">
        <div class="label">Automjeti</div>
        <div class="value">
            <strong>{{ $rental->vehicle->full_name }}</strong><br>
            Targa: {{ $rental->vehicle->license_plate }}<br>
            Viti: {{ $rental->vehicle->year }}
        </div>
    </div>
    <div class="col">
        <div class="label">Periudha</div>
        <div class="value">
            <strong>{{ $rental->planned_pickup_at->format('d M Y') }}</strong><br>
            deri {{ $rental->planned_return_at->format('d M Y') }}<br>
            <span style="color: #666;">{{ $rental->rental_code }}</span>
        </div>
    </div>
</div>

<table>
    <thead>
        <tr>
            <th>Përshkrimi</th>
            <th class="right">Sasia</th>
            <th class="right">Çmimi</th>
            <th class="right">Totali</th>
        </tr>
    </thead>
    <tbody>
        @foreach($invoice->line_items as $item)
            <tr>
                <td>
                    <strong>{{ $item['label'] }}</strong>
                    @if(!empty($item['description']))
                        <br><span style="color: #888; font-size: 10px;">{{ $item['description'] }}</span>
                    @endif
                </td>
                <td class="right">{{ $item['qty'] }}</td>
                <td class="right">{{ number_format($item['unit_price'], 2) }}€</td>
                <td class="right">{{ number_format($item['total'], 2) }}€</td>
            </tr>
        @endforeach
    </tbody>
</table>

<div class="totals">
    <table>
        <tr>
            <td>Nëntotali</td>
            <td class="right">{{ number_format($invoice->subtotal, 2) }}€</td>
        </tr>
        <tr>
            <td>TVSH (18%)</td>
            <td class="right">{{ number_format($invoice->tax_amount, 2) }}€</td>
        </tr>
        <tr class="grand">
            <td>Totali</td>
            <td class="right">{{ number_format($invoice->total, 2) }}€</td>
        </tr>
        <tr>
            <td style="color: #666;">Paguar</td>
            <td class="right" style="color: #666;">{{ number_format($invoice->amount_paid, 2) }}€</td>
        </tr>
        <tr>
            <td style="color: #666;">Mbetur</td>
            <td class="right" style="color: #666;">{{ number_format($invoice->amount_due, 2) }}€</td>
        </tr>
    </table>
</div>

<div class="footer">
    Data e lëshimit: {{ $invoice->issued_at?->format('d.m.Y') }} ·
    Data e skadencës: {{ $invoice->due_at?->format('d.m.Y') }}<br>
    Faleminderit që zgjodhët Driveway Rent-A-Car.
</div>

</body>
</html>
