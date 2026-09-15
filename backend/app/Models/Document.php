<?php

namespace App\Models;

use App\Enums\DocumentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'documentable_type',
        'documentable_id',
        'type',
        'title',
        'description',
        'file_path',
        'file_name',
        'mime_type',
        'file_size',
        'metadata',
        'expires_at',
        'is_confidential',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'type' => DocumentType::class,
            'metadata' => 'array',
            'expires_at' => 'date',
            'is_confidential' => 'boolean',
            'file_size' => 'integer',
        ];
    }

    public function documentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function expiresInDays(): ?int
{
    if (! $this->expires_at) {
        return null;
    }

    return (int) now()->startOfDay()->diffInDays(
        $this->expires_at->copy()->startOfDay(),
        false,
    );
}

    public function humanSize(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes >= 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }
}
