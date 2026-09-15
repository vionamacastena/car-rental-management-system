<?php

namespace App\Domain\Audit;

trait Auditable
{
    /**
     * Auto-log created/updated/deleted.
     * Modelet që përdorin këtë trait do të regjistrojnë automatikisht.
     */
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            app(AuditService::class)->log(
                action: 'created',
                entity: $model,
                newValues: $model->getAttributes(),
                description: 'U krijua',
            );
        });

       static::updated(function ($model) {
    $changes = $model->getChanges();
    unset($changes['updated_at']);

    if (empty($changes)) {
        return;
    }

    $old = [];
    $new = [];
    foreach (array_keys($changes) as $key) {
        $old[$key] = $model->getOriginal($key);
        // Përdor vlerën e cast-uar për konsistencë me old
        $new[$key] = $model->getAttribute($key);
    }

    app(AuditService::class)->log(
        action: 'updated',
        entity: $model,
        oldValues: $old,
        newValues: $new,
        description: 'U përditësua',
    );
});

        static::deleted(function ($model) {
            app(AuditService::class)->log(
                action: 'deleted',
                entity: $model,
                oldValues: $model->getOriginal(),
                description: 'U fshi',
            );
        });
    }
}
