<?php

use App\Enums\ReservationSource;
use App\Enums\ReservationStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('reservation_code')->unique();

            // Relations
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('vehicle_id')->constrained()->restrictOnDelete();
            $table->foreignId('pickup_location_id')->constrained('locations')->restrictOnDelete();
            $table->foreignId('return_location_id')->constrained('locations')->restrictOnDelete();

            // Time window
            $table->timestamp('pickup_at');
            $table->timestamp('return_at');

            // Pricing snapshot (BR-06: pricing nuk ndryshon pas konfirmimit)
            $table->unsignedSmallInteger('days');
            $table->decimal('daily_price_snapshot', 10, 2);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('extras_total', 10, 2)->default(0);
            $table->decimal('fees_total', 10, 2)->default(0);
            $table->decimal('taxes_total', 10, 2)->default(0);
            $table->decimal('discount_total', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->decimal('deposit_amount', 10, 2)->default(0);

            // Metadata
            $table->enum('status', array_column(ReservationStatus::cases(), 'value'))
                ->default(ReservationStatus::RESERVED->value);
            $table->enum('source', array_column(ReservationSource::cases(), 'value'))
                ->default(ReservationSource::PUBLIC->value);
            $table->text('notes')->nullable();           // notes për klientin
            $table->text('internal_notes')->nullable();  // notes vetëm për admin

            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancelled_reason')->nullable();

            $table->timestamps();

            // Indexes për overlap query
            $table->index(['vehicle_id', 'status', 'pickup_at', 'return_at'], 'reservations_overlap_idx');
            $table->index('status');
            $table->index('pickup_at');
            $table->index('created_at');
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
