<?php

namespace App\Domain\Maintenance;

use App\Enums\MaintenanceStatus;
use App\Enums\VehicleStatus;
use App\Models\MaintenanceRecord;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class MaintenanceService
{
    /**
     * Krijon maintenance record me kod unik.
     */
  public function create(array $data, ?int $createdBy = null): MaintenanceRecord
{
    return DB::transaction(function () use ($data, $createdBy) {
        $record = MaintenanceRecord::create([
            'maintenance_code' => (new MaintenanceRecord)->generateCode(),
            'status' => $data['status'] ?? MaintenanceStatus::SCHEDULED->value,
            'blocks_vehicle' => $data['blocks_vehicle'] ?? false,
            'created_by' => $createdBy,
            ...$data,
        ]);

        // Rifresko për të marrë default-et nga DB
        $record = $record->fresh();

        if ($record->blocks_vehicle) {
            $this->applyVehicleBlock($record);
        }

        return $record;
    });
}

    /**
     * Përditëson një maintenance record.
     * Nëse statusi kalon në COMPLETED, çliro vehicle.
     */
    public function update(MaintenanceRecord $record, array $data): MaintenanceRecord
    {
        return DB::transaction(function () use ($record, $data) {
            $oldStatus = $record->status;
            $oldBlocks = $record->blocks_vehicle;

            $record->update($data);

            // Rregullo statusin e vehicle
            if ($record->status === MaintenanceStatus::COMPLETED
                && $oldStatus !== MaintenanceStatus::COMPLETED) {
                // Lirо vehicle
                $this->releaseVehicle($record);
            } elseif ($record->blocks_vehicle && ! $oldBlocks) {
                // Tani bllokon
                $this->applyVehicleBlock($record);
            } elseif (! $record->blocks_vehicle && $oldBlocks
                && $record->status !== MaintenanceStatus::COMPLETED) {
                // Nuk bllokon më
                $this->releaseVehicle($record);
            }

            return $record->fresh();
        });
    }

    /**
     * Anulon një maintenance record.
     */
    public function cancel(MaintenanceRecord $record): MaintenanceRecord
    {
        return DB::transaction(function () use ($record) {
            if ($record->status === MaintenanceStatus::COMPLETED) {
                throw new RuntimeException('Nuk mund të anulohet një maintenance i përfunduar.');
            }

            $record->update(['status' => MaintenanceStatus::CANCELLED]);

            if ($record->blocks_vehicle) {
                $this->releaseVehicle($record);
            }

            return $record->fresh();
        });
    }

    /**
     * Fshin një maintenance record (vetëm nëse është scheduled ose cancelled).
     */
    public function delete(MaintenanceRecord $record): void
    {
        if (in_array($record->status, [
            MaintenanceStatus::IN_PROGRESS,
            MaintenanceStatus::COMPLETED,
        ], true)) {
            throw new RuntimeException('Vetëm maintenance scheduled ose cancelled mund të fshihen.');
        }

        $record->delete();
    }

    /**
     * Vendos vehicle në MAINTENANCE.
     */
    private function applyVehicleBlock(MaintenanceRecord $record): void
    {
        $vehicle = $record->vehicle()->lockForUpdate()->first();

        // Vetëm nëse vehicle është AVAILABLE ose CLEANING (mos e prish RENTED/RESERVED)
        if (in_array($vehicle->status, [VehicleStatus::AVAILABLE, VehicleStatus::CLEANING], true)) {
            $vehicle->update(['status' => VehicleStatus::MAINTENANCE]);
        }
    }

    /**
     * Kthen vehicle në AVAILABLE (ose CLEANING).
     */
    private function releaseVehicle(MaintenanceRecord $record): void
    {
        $vehicle = $record->vehicle()->lockForUpdate()->first();

        if ($vehicle->status === VehicleStatus::MAINTENANCE) {
            $vehicle->update(['status' => VehicleStatus::CLEANING]);
        }
    }
}
