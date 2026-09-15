<?php

use App\Enums\ContractStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number')->unique();

            $table->foreignId('rental_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('customer_id')->constrained()->restrictOnDelete();
            $table->foreignId('vehicle_id')->constrained()->restrictOnDelete();

            $table->enum('status', array_column(ContractStatus::cases(), 'value'))
                ->default(ContractStatus::DRAFT->value);

            $table->unsignedSmallInteger('contract_version')->default(1);

            // Snapshot i termave në momentin e gjenerimit
            $table->json('terms_snapshot');

            // Firma
            $table->text('customer_signature')->nullable();
            $table->text('admin_signature')->nullable();
            $table->timestamp('customer_signed_at')->nullable();
            $table->timestamp('admin_signed_at')->nullable();

            // IP + user agent për audit
            $table->string('customer_signed_ip')->nullable();
            $table->string('admin_signed_ip')->nullable();

            $table->string('pdf_path')->nullable();

            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index('status');
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
