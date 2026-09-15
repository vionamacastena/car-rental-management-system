<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewReservationNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly Reservation $reservation,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_reservation',
            'title' => 'Rezervim i re',
            'message' => "Rezervim {$this->reservation->reservation_code} u krijua nga {$this->reservation->customer->full_name}.",
            'reservation_id' => $this->reservation->id,
            'reservation_code' => $this->reservation->reservation_code,
            'customer_name' => $this->reservation->customer->full_name,
            'total' => (float) $this->reservation->total,
            'pickup_at' => $this->reservation->pickup_at->toIso8601String(),
            'url' => "/admin/reservations",
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject("Rezervim i re: {$this->reservation->reservation_code}")
            ->greeting('Rezervim i re!')
            ->line("Rezervimi {$this->reservation->reservation_code} u krijua nga {$this->reservation->customer->full_name}.")
            ->line("Automjeti: {$this->reservation->vehicle->full_name}")
            ->line("Periudha: {$this->reservation->pickup_at->format('d.m.Y H:i')} → {$this->reservation->return_at->format('d.m.Y H:i')}")
            ->line("Totali: €{$this->reservation->total}")
            ->action('Shiko rezervimin', url('/admin/reservations'))
            ->line('Faleminderit!');
    }
}
