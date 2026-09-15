<?php

it('includes security headers on API responses', function () {
    $response = $this->getJson('/api/v1/health');

    $response->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'SAMEORIGIN') // jo prod → SAMEORIGIN
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeader('X-XSS-Protection', '1; mode=block');
});

it('sets Permissions-Policy header', function () {
    $response = $this->getJson('/api/v1/health');

    expect($response->headers->get('Permissions-Policy'))
        ->toContain('camera=()')
        ->toContain('microphone=()')
        ->toContain('geolocation=()');
});
