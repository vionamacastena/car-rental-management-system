<?php

namespace App\Notifications;

use App\Models\Reservation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReservationOverdueNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly Reservation $reservation,
        public readonly int $hoursOverdue,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'reservation_overdue',
            'title' => 'Kthim me vonesë',
            'message' => "Rezervimi {$this->reservation->reservation_code} është {$this->hoursOverdue}h me vonesë.",
            'reservation_id' => $this->reservation->id,
            'reservation_code' => $this->reservation->reservation_code,
            'customer_name' => $this->reservation->customer->full_name,
            'hours_overdue' => $this->hoursOverdue,
            'url' => "/admin/reservations",
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject("Vonesë kthimi: {$this->reservation->reservation_code}")
            ->error()
            ->greeting('Kujdes!')
            ->line("Rezervimi {$this->reservation->reservation_code} është {$this->hoursOverdue}h me vonesë.")
            ->line("Klienti: {$this->reservation->customer->full_name}")
            ->action('Shiko rezervimin', url('/admin/reservations'));
    }
}
