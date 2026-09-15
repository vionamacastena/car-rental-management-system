<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->index();
            $table->string('phone');
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();

            // Driver info
            $table->date('date_of_birth')->nullable();
            $table->string('driver_license_number')->nullable();
            $table->date('driver_license_expiry')->nullable();

            // Admin
            $table->text('notes')->nullable();
            $table->timestamps();

            // Match key për booking flow (email + phone për dedupe)
            $table->index(['email', 'phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
