<?php

namespace App\Notifications;

use App\Models\MaintenanceRecord;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MaintenanceDueNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly MaintenanceRecord $record,
        public readonly int $daysUntil,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        $label = $this->daysUntil < 0
            ? "i vonuar " . abs($this->daysUntil) . " ditë"
            : "skadon pas {$this->daysUntil} ditësh";

        return [
            'type' => 'maintenance_due',
            'title' => 'Maintenance ' . ($this->daysUntil < 0 ? 'i vonuar' : 'së shpejti'),
            'message' => "{$this->record->title} për {$this->record->vehicle->full_name} — {$label}.",
            'maintenance_id' => $this->record->id,
            'maintenance_code' => $this->record->maintenance_code,
            'vehicle_id' => $this->record->vehicle_id,
            'vehicle_name' => $this->record->vehicle->full_name,
            'license_plate' => $this->record->vehicle->license_plate,
            'days_until' => $this->daysUntil,
            'next_service_at' => $this->record->next_service_at?->toDateString(),
            'url' => "/admin/maintenance",
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $label = $this->daysUntil < 0
            ? "i vonuar " . abs($this->daysUntil) . " ditë"
            : "skadon pas {$this->daysUntil} ditësh";

        return (new MailMessage())
            ->subject("Maintenance {$this->record->maintenance_code}: " . ($this->daysUntil < 0 ? 'i vonuar' : 'së shpejti'))
            ->greeting('Kujtesë maintenance')
            ->line("{$this->record->title} për {$this->record->vehicle->full_name} ({$this->record->vehicle->license_plate})")
            ->line("Afati: " . $label)
            ->line("Data e planifikuar: {$this->record->next_service_at?->format('d.m.Y')}")
            ->action('Shiko maintenance', url('/admin/maintenance'));
    }
}
