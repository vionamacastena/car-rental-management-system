<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class BackupDatabase extends Command
{
    protected $signature = 'crms:backup {--keep=30 : Numri i backups për të mbajtur}';
    protected $description = 'Krijo një backup të databazës';

    public function handle(): int
    {
        $driver = config('database.default');
        $timestamp = now()->format('Y-m-d_His');
        $filename = "backups/crms-{$timestamp}.sql";

        $this->info("Duke krijuar backup për {$driver}...");

        try {
            $path = match ($driver) {
                'pgsql' => $this->backupPostgres($filename),
                'sqlite' => $this->backupSqlite($filename),
                default => throw new \RuntimeException("Driver {$driver} nuk suportohet."),
            };

            $this->info("✓ Backup krijuar: {$path}");
            $this->cleanOldBackups((int) $this->option('keep'));

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("✗ Gabim: {$e->getMessage()}");
            return self::FAILURE;
        }
    }

    private function backupPostgres(string $filename): string
    {
        $db = config('database.connections.pgsql');
        $tempFile = storage_path('app/' . $filename);

        // Krijo folderin nëse mungon
        $backupDir = dirname($tempFile);
        if (! is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        // Përdor pg_dump brenda Docker container
        $cmd = sprintf(
            'docker exec crms-postgres pg_dump -U %s -d %s > %s 2>&1',
            escapeshellarg($db['username']),
            escapeshellarg($db['database']),
            escapeshellarg($tempFile),
        );

        exec($cmd, $output, $code);

        if ($code !== 0) {
            throw new \RuntimeException('pg_dump dështoi: ' . implode("\n", $output));
        }

        if (! file_exists($tempFile) || filesize($tempFile) === 0) {
            throw new \RuntimeException('Backup file është bosh ose mungon.');
        }

        return $filename;
    }

    private function backupSqlite(string $filename): string
    {
        $db = config('database.connections.sqlite.database');
        if (! file_exists($db)) {
            throw new \RuntimeException("Databaza SQLite nuk u gjet: {$db}");
        }

        Storage::disk('local')->put($filename, file_get_contents($db));

        return $filename;
    }

    private function cleanOldBackups(int $keep): void
    {
        $files = collect(Storage::disk('local')->files('backups'))
            ->filter(fn ($f) => str_ends_with($f, '.sql') || str_ends_with($f, '.sqlite'))
            ->sortDesc()
            ->values();

        $toDelete = $files->slice($keep);

        foreach ($toDelete as $file) {
            Storage::disk('local')->delete($file);
        }

        if ($toDelete->isNotEmpty()) {
            $this->info("Fshirë {$toDelete->count()} backup të vjetër.");
        }
    }
}
