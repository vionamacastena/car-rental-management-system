<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            // Kush e bëri
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable(); // snapshot i emrit
            $table->string('user_email')->nullable();

            // Çfarë bëri
            $table->string('action'); // created, updated, deleted, status_changed, signed, refunded, etc.
            $table->string('entity_type'); // App\Models\Vehicle, etc.
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('entity_label')->nullable(); // "BMW 320d (01-320-DA)"

            // Ndryshimet
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            // Konteksti
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->string('url')->nullable();
            $table->string('method', 10)->nullable();

            $table->text('description')->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Indexes për filtrim
            $table->index(['entity_type', 'entity_id']);
            $table->index('action');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
