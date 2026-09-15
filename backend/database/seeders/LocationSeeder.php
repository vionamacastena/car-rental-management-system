<?php

namespace Database\Seeders;

use App\Models\Location;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            [
                'name' => 'Pristina Airport',
                'address' => 'Aeroporti Ndërkombëtar i Prishtinës "Adem Jashari"',
                'city' => 'Prishtina',
                'phone' => '+383 38 501 502',
                'email' => 'airport@driveway-rentacar.com',
                'opening_hours' => [
                    'mon_fri' => '00:00-24:00',
                    'sat' => '00:00-24:00',
                    'sun' => '00:00-24:00',
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Pristina City',
                'address' => 'Rr. Nëna Terezë 45, Prishtinë 10000',
                'city' => 'Prishtina',
                'phone' => '+383 38 222 333',
                'email' => 'pristina@driveway-rentacar.com',
                'opening_hours' => [
                    'mon_fri' => '08:00-20:00',
                    'sat' => '09:00-18:00',
                    'sun' => '10:00-16:00',
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Prizren',
                'address' => 'Rr. Remzi Ademaj 12, Prizren 20000',
                'city' => 'Prizren',
                'phone' => '+383 29 222 333',
                'email' => 'prizren@driveway-rentacar.com',
                'opening_hours' => [
                    'mon_fri' => '08:00-20:00',
                    'sat' => '09:00-18:00',
                    'sun' => '10:00-16:00',
                ],
                'is_active' => true,
            ],
            [
                'name' => 'Peja',
                'address' => 'Rr. Mbretëresha Teutë 8, Pejë 30000',
                'city' => 'Peja',
                'phone' => '+383 39 222 333',
                'email' => 'peja@driveway-rentacar.com',
                'opening_hours' => [
                    'mon_fri' => '08:00-20:00',
                    'sat' => '09:00-18:00',
                    'sun' => 'closed',
                ],
                'is_active' => true,
            ],
        ];

        foreach ($locations as $data) {
            Location::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }

        $this->command->info('✓ Seeded ' . count($locations) . ' locations');
    }
}
