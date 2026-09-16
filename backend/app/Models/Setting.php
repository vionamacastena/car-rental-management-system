<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'description',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    /**
     * Get një vlerë settings nga cache.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $all = static::allCached();
        $setting = $all->get($key);

        if (! $setting) {
            return $default;
        }

        return static::cast($setting->value, $setting->type);
    }

    public static function set(string $key, mixed $value): void
    {
        $setting = static::where('key', $key)->first();
        if (! $setting) {
            return;
        }

        $setting->update([
            'value' => static::serialize($value, $setting->type),
        ]);

        static::clearCache();
    }

    public static function allCached(): \Illuminate\Support\Collection
    {
        return Cache::remember('settings:all', 3600, function () {
            return static::all()->keyBy('key');
        });
    }

    public static function clearCache(): void
    {
        Cache::forget('settings:all');
        Cache::forget('settings:public');
    }

    public static function publicSettings(): array
    {
        return Cache::remember('settings:public', 3600, function () {
            return static::where('is_public', true)
                ->get()
                ->mapWithKeys(fn ($s) => [$s->key => static::cast($s->value, $s->type)])
                ->all();
        });
    }

    private static function cast(?string $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'int' => (int) $value,
            'float' => (float) $value,
            'bool' => (bool) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }

    private static function serialize(mixed $value, string $type): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'bool' => $value ? '1' : '0',
            'json' => json_encode($value),
            default => (string) $value,
        };
    }
}
