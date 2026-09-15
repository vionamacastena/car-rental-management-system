<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Domain\Documents\DocumentService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\StoreDocumentRequest;
use App\Http\Resources\DocumentCollection;
use App\Http\Resources\DocumentResource;
use App\Models\Contract;
use App\Models\Customer;
use App\Models\Document;
use App\Models\Invoice;
use App\Models\Rental;
use App\Models\Reservation;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class DocumentController extends Controller
{
    public function __construct(
        private readonly DocumentService $service,
    ) {}

    public function index(Request $request): DocumentCollection
    {
        $query = Document::query()->with('uploadedBy');

        if ($request->filled('documentable_type') && $request->filled('documentable_id')) {
            $class = $this->resolveClass($request->input('documentable_type'));
            $query->where('documentable_type', $class)
                  ->where('documentable_id', (int) $request->input('documentable_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('search')) {
            $search = strtolower(trim((string) $request->input('search')));
            $like = "%{$search}%";
            $query->where(function ($q) use ($like) {
                $q->whereRaw('LOWER(title) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(file_name) LIKE ?', [$like]);
            });
        }

        $query->orderByDesc('created_at');
        $perPage = min((int) $request->input('per_page', 20), 100);

        return new DocumentCollection($query->paginate($perPage));
    }

    public function store(StoreDocumentRequest $request): JsonResponse
    {
        $class = $this->resolveClass($request->input('documentable_type'));
        $model = $class::findOrFail($request->input('documentable_id'));

        $document = $this->service->upload(
            $model,
            $request->file('file'),
            $request->validated(),
            auth()->id(),
        );

        return (new DocumentResource($document->load('uploadedBy')))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Document $document): DocumentResource
    {
        $document->load('uploadedBy');

        return new DocumentResource($document);
    }

   public function download(Document $document): Response|JsonResponse
{
    $contents = $this->service->getFileContents($document);

    // Ndryshim: != null në vend të ! $contents (empty string është file i vlefshëm)
    if ($contents === null) {
        return response()->json(['message' => 'File nuk u gjet.'], 404);
    }

    return response($contents, 200, [
        'Content-Type' => $document->mime_type,
        'Content-Disposition' => "inline; filename=\"{$document->file_name}\"",
    ]);
}

    public function destroy(Document $document): JsonResponse
    {
        $this->service->delete($document);

        return response()->json(['message' => 'Dokumenti u fshi.']);
    }

    private function resolveClass(string $type): string
    {
        return match ($type) {
            'customer' => Customer::class,
            'vehicle' => Vehicle::class,
            'rental' => Rental::class,
            'reservation' => Reservation::class,
            'contract' => Contract::class,
            'invoice' => Invoice::class,
            default => throw new \InvalidArgumentException("Lloj i pavlefshëm: {$type}"),
        };
    }
}
