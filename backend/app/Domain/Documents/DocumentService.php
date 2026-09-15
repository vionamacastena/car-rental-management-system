<?php

namespace App\Domain\Documents;

use App\Enums\DocumentType;
use App\Models\Document;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
public function upload(
    Model $documentable,
    UploadedFile $file,
    array $data,
    ?int $uploadedBy = null,
): Document {
    $entityName = $this->entityName($documentable);
    $folder = "documents/{$entityName}/{$documentable->id}";

    // putFileAs është metoda standarde për UploadedFile
    $storedPath = Storage::disk('local')->putFileAs(
        $folder,
        $file,
        $file->hashName(),
    );

    if (! $storedPath) {
        throw new \RuntimeException('File nuk mund të ruhet.');
    }

    return Document::create([
        'documentable_type' => get_class($documentable),
        'documentable_id' => $documentable->id,
        'type' => $data['type'] ?? DocumentType::OTHER->value,
        'title' => $data['title'] ?? $file->getClientOriginalName(),
        'description' => $data['description'] ?? null,
        'file_path' => $storedPath,
        'file_name' => $file->getClientOriginalName(),
        'mime_type' => $file->getMimeType(),
        'file_size' => $file->getSize(),
        'metadata' => $data['metadata'] ?? null,
        'expires_at' => $data['expires_at'] ?? null,
        'is_confidential' => $data['is_confidential'] ?? false,
        'uploaded_by' => $uploadedBy,
    ]);
}

    /**
     * Fshij një dokument dhe file-in fizik.
     */
    public function delete(Document $document): void
    {
        if ($document->file_path && Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }

        $document->delete();
    }

    /**
     * Kthe përmbajtjen e file-it për download.
     */
    public function getFileContents(Document $document): ?string
    {
        if (! Storage::disk('local')->exists($document->file_path)) {
            return null;
        }

        return Storage::disk('local')->get($document->file_path);
    }

    private function entityName(Model $model): string
    {
        return match (class_basename($model)) {
            'Customer' => 'customers',
            'Vehicle' => 'vehicles',
            'Rental' => 'rentals',
            'Reservation' => 'reservations',
            'Contract' => 'contracts',
            'Invoice' => 'invoices',
            default => strtolower(class_basename($model)) . 's',
        };
    }
}
