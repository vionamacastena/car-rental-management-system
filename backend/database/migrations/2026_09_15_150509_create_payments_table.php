<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('payment_code')->unique();

            // Polymorphic — pagesa mund t'i lidhet një rental ose një rezervimi
            $table->string('payable_type');
            $table->unsignedBigInteger('payable_id');

            $table->foreignId('customer_id')->constrained()->restrictOnDelete();

            $table->enum('type', array_column(PaymentType::cases(), 'value'));
            $table->enum('method', array_column(PaymentMethod::cases(), 'value'));
            $table->enum('status', array_column(PaymentStatus::cases(), 'value'))
                ->default(PaymentStatus::COMPLETED->value);

            $table->decimal('amount', 10, 2);
            $table->decimal('refunded_amount', 10, 2)->default(0);

            $table->string('reference')->nullable(); // transaction ID nga banka/karta
            $table->text('notes')->nullable();

            // Kur është kryer
            $table->timestamp('paid_at');
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['payable_type', 'payable_id']);
            $table->index('customer_id');
            $table->index('type');
            $table->index('status');
            $table->index('paid_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
