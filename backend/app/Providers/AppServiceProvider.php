<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Login — 5 tentativa / 15 min / (IP + email)
        RateLimiter::for('login', function (Request $request) {
            $key = strtolower($request->input('email', '')) . '|' . $request->ip();
            return Limit::perMinutes(15, 5)->by($key);
        });

        // Booking publik — 10 / min / IP
        RateLimiter::for('booking', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // Lookup — 20 / min / IP
        RateLimiter::for('lookup', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        // API admin — 120 / min / user (ose IP nëse s'është loguar)
        RateLimiter::for('admin-api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?? $request->ip());
        });

        // Public API (read-only endpoints) — 60 / min / IP
        RateLimiter::for('public-api', function (Request $request) {
            return Limit::perMinute(60)->by($request->ip());
        });
    }
}
