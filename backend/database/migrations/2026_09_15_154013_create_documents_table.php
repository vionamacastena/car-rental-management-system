<?php

use App\Enums\DocumentType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            // Polymorphic — mund t'i lidhet çdo modeli
            $table->string('documentable_type');
            $table->unsignedBigInteger('documentable_id');

            $table->enum('type', array_column(DocumentType::cases(), 'value'))
                ->default(DocumentType::OTHER->value);

            $table->string('title');
            $table->text('description')->nullable();

            // File info
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type');
            $table->unsignedBigInteger('file_size');

            // Metadata
            $table->json('metadata')->nullable(); // { expires_at, issued_at, number, ... }
            $table->date('expires_at')->nullable(); // për insurance, registration

            $table->boolean('is_confidential')->default(false);

            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['documentable_type', 'documentable_id']);
            $table->index('type');
            $table->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
