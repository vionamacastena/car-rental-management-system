<?php

namespace Database\Seeders;

use App\Enums\FuelType;
use App\Enums\Transmission;
use App\Enums\VehicleStatus;
use App\Models\Location;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $airport = Location::where('name', 'Pristina Airport')->first();
        $pristina = Location::where('name', 'Pristina City')->first();
        $prizren = Location::where('name', 'Prizren')->first();
        $peja = Location::where('name', 'Peja')->first();

        $vehicles = [
            [
                'brand' => 'BMW',
                'model' => '320d',
                'year' => 2022,
                'license_plate' => '01-320-DA',
                'vin' => 'WBA5E51050G123456',
                'color' => 'Black',
                'mileage' => 45000,
                'fuel_type' => FuelType::DIESEL,
                'transmission' => Transmission::AUTOMATIC,
                'seats' => 5,
                'current_location_id' => $pristina->id,
                'status' => VehicleStatus::AVAILABLE,
                'daily_price' => 50.00,
                'purchase_price' => 38000.00,
                'current_value' => 28000.00,
                'description' => 'BMW 320d është një sedan premium me motorr efficient diesel, transmision automatik dhe pajisje të plota. Ideal për udhëtime biznesi dhe turistike.',
                'features' => ['Navigation', 'Cruise Control', 'Bluetooth', 'Leather Seats', 'Parking Sensors', 'Rear Camera'],
                'photo_seeds' => ['bmw320d-a', 'bmw320d-b', 'bmw320d-c'],
            ],
            [
                'brand' => 'Audi',
                'model' => 'A4',
                'year' => 2022,
                'license_plate' => '01-A4-AD',
                'vin' => 'WAUZZZF48MA123456',
                'color' => 'Blue',
                'mileage' => 38000,
                'fuel_type' => FuelType::DIESEL,
                'transmission' => Transmission::AUTOMATIC,
                'seats' => 5,
                'current_location_id' => $airport->id,
                'status' => VehicleStatus::AVAILABLE,
                'daily_price' => 50.00,
                'purchase_price' => 40000.00,
                'current_value' => 30000.00,
                'description' => 'Audi A4 është një sedan luksoz me linja elegante, teknologi moderne dhe rehati maksimale për udhëtime të gjata.',
                'features' => ['Navigation', 'Cruise Control', 'Bluetooth', 'Leather Seats', 'Apple CarPlay', 'Android Auto'],
                'photo_seeds' => ['audia4-a', 'audia4-b'],
            ],
            [
                'brand' => 'Mercedes',
                'model' => 'C-Class',
                'year' => 2021,
                'license_plate' => '01-C200-MB',
                'vin' => 'WDD2050011A123456',
                'color' => 'Red',
                'mileage' => 52000,
                'fuel_type' => FuelType::PETROL,
                'transmission' => Transmission::AUTOMATIC,
                'seats' => 5,
                'current_location_id' => $prizren->id,
                'status' => VehicleStatus::AVAILABLE,
                'daily_price' => 50.00,
                'purchase_price' => 42000.00,
                'current_value' => 32000.00,
                'description' => 'Mercedes C-Class kombinon luksin klasik me performancën sportive. Perfekt për klientë që kërkojnë stil dhe komoditet.',
                'features' => ['Navigation', 'Cruise Control', 'Bluetooth', 'Leather Seats', 'Sunroof', 'Heated Seats'],
                'photo_seeds' => ['mercedesc-a', 'mercedesc-b'],
            ],
            [
                'brand' => 'Volkswagen',
                'model' => 'Golf 8',
                'year' => 2023,
                'license_plate' => '01-GOLF-8',
                'vin' => 'WVWZZZ1KZMW123456',
                'color' => 'White',
                'mileage' => 18000,
                'fuel_type' => FuelType::PETROL,
                'transmission' => Transmission::MANUAL,
                'seats' => 5,
                'current_location_id' => $pristina->id,
                'status' => VehicleStatus::AVAILABLE,
                'daily_price' => 35.00,
                'purchase_price' => 28000.00,
                'current_value' => 25000.00,
                'description' => 'Volkswagen Golf 8 është hatchback kompakt, ekonomik dhe i shkathët — ideal për qytet dhe udhëtime të shkurtra.',
                'features' => ['Bluetooth', 'AC', 'Rear Camera', 'USB Charging'],
                'photo_seeds' => ['vwgolf8-a'],
            ],
            [
                'brand' => 'Škoda',
                'model' => 'Octavia',
                'year' => 2022,
                'license_plate' => '01-OCT-22',
                'vin' => 'TMBJJ7NE0M0123456',
                'color' => 'Grey',
                'mileage' => 42000,
                'fuel_type' => FuelType::DIESEL,
                'transmission' => Transmission::MANUAL,
                'seats' => 5,
                'current_location_id' => $peja->id,
                'status' => VehicleStatus::AVAILABLE,
                'daily_price' => 38.00,
                'purchase_price' => 26000.00,
                'current_value' => 22000.00,
                'description' => 'Škoda Octavia ofron hapësirë të bollshme bagazhi, konsum të ulët karburanti dhe rehati për familje ose udhëtime biznesi.',
                'features' => ['Navigation', 'Bluetooth', 'AC', 'Cruise Control', 'Large Trunk'],
                'photo_seeds' => ['skodaoctavia-a'],
            ],
            [
                'brand' => 'Toyota',
                'model' => 'Corolla Hybrid',
                'year' => 2023,
                'license_plate' => '01-COR-HYB',
                'vin' => 'JTDBR32E0M0123456',
                'color' => 'Silver',
                'mileage' => 15000,
                'fuel_type' => FuelType::HYBRID,
                'transmission' => Transmission::AUTOMATIC,
                'seats' => 5,
                'current_location_id' => $airport->id,
                'status' => VehicleStatus::AVAILABLE,
                'daily_price' => 42.00,
                'purchase_price' => 30000.00,
                'current_value' => 27000.00,
                'description' => 'Toyota Corolla Hybrid është zgjedhja më ekonomike dhe ekologjike — konsum shumë i ulët dhe besueshmëri maksimale.',
                'features' => ['Hybrid Engine', 'Navigation', 'Bluetooth', 'Adaptive Cruise Control', 'Lane Assist'],
                'photo_seeds' => ['toyotacorolla-a'],
            ],
        ];

        foreach ($vehicles as $data) {
            $seeds = $data['photo_seeds'] ?? [];
            unset($data['photo_seeds']);

            $vehicle = Vehicle::updateOrCreate(
                ['license_plate' => $data['license_plate']],
                $data
            );

            // Fshij fotot e vjetra për këtë vehicle (për seed të pastër)
            $vehicle->photos()->delete();

            foreach ($seeds as $index => $seed) {
                $vehicle->photos()->create([
                    'path' => "https://picsum.photos/seed/{$seed}/1200/800",
                    'is_primary' => $index === 0,
                    'sort_order' => $index,
                ]);
            }
        }

        $this->command->info('✓ Seeded ' . count($vehicles) . ' vehicles with photos');
    }
}
