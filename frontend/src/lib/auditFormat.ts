export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Po' : 'Jo'
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'string') return value
  if (Array.isArray(value)) return value.length === 0 ? '[]' : JSON.stringify(value)
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

export function fieldLabel(key: string): string {
  const labels: Record<string, string> = {
    status: 'Statusi',
    daily_price: 'Çmimi ditor',
    mileage: 'Kilometrazhi',
    brand: 'Marka',
    model: 'Modeli',
    year: 'Viti',
    license_plate: 'Targa',
    vin: 'VIN',
    color: 'Ngjyra',
    fuel_type: 'Karburanti',
    transmission: 'Transmisioni',
    seats: 'Vendet',
    current_location_id: 'Lokacioni',
    first_name: 'Emri',
    last_name: 'Mbiemri',
    email: 'Email',
    phone: 'Telefoni',
    total: 'Totali',
    amount: 'Shuma',
    refunded_amount: 'Rimbursuar',
    notes: 'Shënime',
    reason: 'Arsyeja',
    refund_amount: 'Shuma e rimbursimit',
    refund_code: 'Kodi i rimbursimit',
    deposit_refund: 'Rimbursim depozite',
    title: 'Titulli',
    cost: 'Kostoja',
    description: 'Përshkrimi',
  }
  return labels[key] ?? key.replace(/_/g, ' ')
}
