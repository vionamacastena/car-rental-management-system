<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            // Company
            ['company_name', 'Driveway Rent-A-Car', 'string', 'company', 'Emri i kompanisë', null, true],
            ['company_email', 'info@driveway-rentacar.com', 'string', 'company', 'Email', null, true],
            ['company_phone', '+383 38 501 502', 'string', 'company', 'Telefoni', null, true],
            ['company_address', 'Rr. Nëna Terezë 45, Prishtinë', 'string', 'company', 'Adresa', null, true],
            ['company_nui', '810123456', 'string', 'company', 'NUI', null, true],
            ['company_vat', 'AL12345678', 'string', 'company', 'TVSH', null, false],

            // Pricing defaults
            ['default_daily_price', '50.00', 'float', 'pricing', 'Çmimi ditor bazë (€)', 'Përdoret si default kur s\'ka çmim tjetër', false],
            ['default_deposit_amount', '200.00', 'float', 'pricing', 'Depozita standarde (€)', null, false],
            ['tax_rate', '18.00', 'float', 'pricing', 'Norma e TVSH-së (%)', 'VAT në Kosovë është 18%', false],
            ['extra_km_price', '0.20', 'float', 'pricing', 'Çmimi për km shtesë (€)', null, false],
            ['default_mileage_limit', '250', 'int', 'pricing', 'Limiti ditor i kilometrazhit (km)', null, false],
            ['late_return_price_per_hour', '5.00', 'float', 'pricing', 'Tarifa e vonesës / orë (€)', null, false],

            // Notifications
            ['notify_on_booking', '1', 'bool', 'notifications', 'Njofto me email për çdo rezervim', null, false],
            ['notify_on_payment', '1', 'bool', 'notifications', 'Njofto për çdo pagesë', null, false],
            ['notify_on_overdue', '1', 'bool', 'notifications', 'Njofto për rentals të vonuara', null, false],
            ['notify_maintenance_reminder_days', '30', 'int', 'notifications', 'Ditët e paralajmërimit për servis', null, false],

            // Booking
            ['min_rental_days', '1', 'int', 'booking', 'Kohëzgjatja minimale (ditë)', null, true],
            ['max_rental_days', '90', 'int', 'booking', 'Kohëzgjatja maksimale (ditë)', null, true],
            ['min_driver_age', '21', 'int', 'booking', 'Mosha minimale e drejtuesit', null, true],
            ['advance_booking_days', '1', 'int', 'booking', 'Ditët minimale përpara rezervimit', null, true],
        ];

        foreach ($settings as [$key, $value, $type, $group, $label, $description, $isPublic]) {
            Setting::updateOrCreate(
                ['key' => $key],
                [
                    'value' => $value,
                    'type' => $type,
                    'group' => $group,
                    'label' => $label,
                    'description' => $description,
                    'is_public' => $isPublic,
                ],
            );
        }

        $this->command->info('✓ Seeded ' . count($settings) . ' settings');
    }
}
