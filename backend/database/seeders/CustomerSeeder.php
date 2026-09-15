<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'first_name' => 'Arben',
                'last_name' => 'Krasniqi',
                'email' => 'arben.krasniqi@example.com',
                'phone' => '+383 44 111 222',
                'address' => 'Rr. Nëna Terezë 12',
                'city' => 'Prishtina',
                'country' => 'Kosovo',
                'driver_license_number' => 'KS123456',
                'driver_license_expiry' => '2028-06-15',
            ],
            [
                'first_name' => 'Blerina',
                'last_name' => 'Berisha',
                'email' => 'blerina.berisha@example.com',
                'phone' => '+383 45 333 444',
                'address' => 'Rr. Remzi Ademaj 8',
                'city' => 'Prizren',
                'country' => 'Kosovo',
                'driver_license_number' => 'KS234567',
                'driver_license_expiry' => '2027-03-22',
            ],
            [
                'first_name' => 'Gentian',
                'last_name' => 'Hoxha',
                'email' => 'gentian.hoxha@example.com',
                'phone' => '+383 44 555 666',
                'address' => 'Rr. Mbretëresha Teutë 5',
                'city' => 'Peja',
                'country' => 'Kosovo',
                'driver_license_number' => 'KS345678',
                'driver_license_expiry' => '2029-09-10',
            ],
            [
                'first_name' => 'Doruntina',
                'last_name' => 'Shala',
                'email' => 'doruntina.shala@example.com',
                'phone' => '+383 49 777 888',
                'address' => 'Rr. UÇK 22',
                'city' => 'Gjakova',
                'country' => 'Kosovo',
                'driver_license_number' => 'KS456789',
                'driver_license_expiry' => '2026-12-01',
            ],
            [
                'first_name' => 'Endrit',
                'last_name' => 'Gashi',
                'email' => 'endrit.gashi@example.com',
                'phone' => '+383 44 999 000',
                'address' => 'Rr. Skënderbeu 45',
                'city' => 'Prishtina',
                'country' => 'Kosovo',
                'driver_license_number' => 'KS567890',
                'driver_license_expiry' => '2028-05-20',
            ],
        ];

        foreach ($customers as $data) {
            Customer::updateOrCreate(
                ['email' => $data['email']],
                $data,
            );
        }

        $this->command->info('✓ Seeded ' . count($customers) . ' customers');
    }
}
