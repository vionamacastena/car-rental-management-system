<?php

use App\Enums\MaintenanceStatus;
use App\Enums\MaintenanceType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();
            $table->string('maintenance_code')->unique();

            $table->foreignId('vehicle_id')->constrained()->restrictOnDelete();

            $table->enum('type', array_column(MaintenanceType::cases(), 'value'));
            $table->enum('status', array_column(MaintenanceStatus::cases(), 'value'))
                ->default(MaintenanceStatus::SCHEDULED->value);

            $table->string('title');
            $table->text('description')->nullable();

            // Datat
            $table->date('scheduled_at')->nullable();
            $table->date('performed_at')->nullable();
            $table->date('next_service_at')->nullable(); // për rikujtim

            // Kilometrazhi
            $table->unsignedInteger('mileage_at_service')->nullable();
            $table->unsignedInteger('next_service_mileage')->nullable();

            // Kosto + provider
            $table->decimal('cost', 10, 2)->default(0);
            $table->string('provider_name')->nullable();
            $table->string('provider_phone')->nullable();

            // Fatura + dokumente
            $table->string('invoice_number')->nullable();

            // Nëse ky maintenance bllokon makinën
            $table->boolean('blocks_vehicle')->default(false);

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['vehicle_id', 'status']);
            $table->index('type');
            $table->index('next_service_at');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_records');
    }
};
