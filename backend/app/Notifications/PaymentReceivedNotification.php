<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly Payment $payment,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'payment_received',
            'title' => 'Pagesë e re',
            'message' => "{$this->payment->payment_code}: {$this->payment->type->label()} — €{$this->payment->amount}",
            'payment_id' => $this->payment->id,
            'payment_code' => $this->payment->payment_code,
            'amount' => (float) $this->payment->amount,
            'method' => $this->payment->method->value,
            'customer_name' => $this->payment->customer?->full_name,
            'url' => "/admin/payments",
        ];
    }
}
