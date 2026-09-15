<?php

use App\Enums\FuelType;
use App\Enums\Transmission;
use App\Enums\VehicleStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('model');
            $table->unsignedSmallInteger('year');
            $table->string('license_plate')->unique();
            $table->string('vin')->unique()->nullable();
            $table->string('color')->nullable();
            $table->unsignedInteger('mileage')->default(0);
            $table->enum('fuel_type', array_column(FuelType::cases(), 'value'));
            $table->enum('transmission', array_column(Transmission::cases(), 'value'));
            $table->unsignedTinyInteger('seats')->default(5);
            $table->foreignId('current_location_id')
                ->nullable()
                ->constrained('locations')
                ->nullOnDelete();
            $table->enum('status', array_column(VehicleStatus::cases(), 'value'))
                ->default(VehicleStatus::AVAILABLE->value);
            $table->decimal('daily_price', 10, 2);
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->decimal('current_value', 10, 2)->nullable();
            $table->text('description')->nullable();
            $table->json('features')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('brand');
            $table->index('fuel_type');
            $table->index('transmission');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
