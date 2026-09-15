<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            $table->text('checkout_signature')->nullable()->change();
            $table->text('checkin_signature')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('rentals', function (Blueprint $table) {
            $table->string('checkout_signature')->nullable()->change();
            $table->string('checkin_signature')->nullable()->change();
        });
    }
};
