<?php

use App\Enums\RentalStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->string('rental_code')->unique();

            // Relacione
            $table->foreignId('reservation_id')->nullable()
                ->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('vehicle_id')->constrained()->restrictOnDelete();
            $table->foreignId('pickup_location_id')->constrained('locations')->restrictOnDelete();
            $table->foreignId('return_location_id')->constrained('locations')->restrictOnDelete();

            // Planned window (nga rezervimi)
            $table->timestamp('planned_pickup_at');
            $table->timestamp('planned_return_at');

            // Aktual (mbahen nga check-in)
            $table->timestamp('actual_pickup_at')->nullable();
            $table->timestamp('actual_return_at')->nullable();

            // Statusi
            $table->enum('status', array_column(RentalStatus::cases(), 'value'))
                ->default(RentalStatus::PENDING_CHECKOUT->value);

            // Kilometrazhi
            $table->unsignedInteger('pickup_mileage')->nullable();
            $table->unsignedInteger('return_mileage')->nullable();
            $table->unsignedInteger('mileage_limit')->nullable(); // km për të gjithë periudhën (nga pricing)
            $table->unsignedInteger('mileage_used')->nullable(); // kalkulohet në check-in

            // Karburanti (0-100%)
            $table->unsignedTinyInteger('pickup_fuel_level')->nullable();
            $table->unsignedTinyInteger('return_fuel_level')->nullable();

            // Çmimi (snapshot nga rezervimi + charges shtesë)
            $table->decimal('base_amount', 10, 2);
            $table->decimal('extras_amount', 10, 2)->default(0);
            $table->decimal('fees_amount', 10, 2)->default(0);
            $table->decimal('taxes_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('damage_amount', 10, 2)->default(0);
            $table->decimal('extra_mileage_amount', 10, 2)->default(0);
            $table->decimal('fuel_amount', 10, 2)->default(0);
            $table->decimal('late_return_amount', 10, 2)->default(0);
            $table->decimal('other_charges_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->decimal('deposit_deduction', 10, 2)->default(0);
            $table->decimal('deposit_refund', 10, 2)->default(0);

            // Check-out info
            $table->json('checkout_condition')->nullable(); // { exterior, interior, notes }
            $table->text('checkout_notes')->nullable();
            $table->string('checkout_signature')->nullable(); // path ose base64
            $table->timestamp('checked_out_at')->nullable();

            // Check-in info
            $table->json('checkin_condition')->nullable();
            $table->text('checkin_notes')->nullable();
            $table->string('checkin_signature')->nullable();
            $table->timestamp('checked_in_at')->nullable();

            $table->timestamps();

            $table->index(['vehicle_id', 'status']);
            $table->index('status');
            $table->index('customer_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};
