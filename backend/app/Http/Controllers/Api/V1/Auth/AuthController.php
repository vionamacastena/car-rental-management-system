<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredencialet janë të pasakta.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Llogaria është e çaktivizuar.'],
            ]);
        }

        $user->update(['last_login_at' => now()]);

        // Fshij tokenat e vjetra
        $user->tokens()->delete();

        $deviceName = $request->validated('device_name') ?? 'admin-panel';
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'last_login_at' => $user->last_login_at?->toIso8601String(),
                ],
                'token' => $token,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'last_login_at' => $request->user()->last_login_at?->toIso8601String(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        // Fshij të gjitha tokenat e user-it — më e sigurt se currentAccessToken()
        // sepse funksionon si me Bearer ashtu edhe me stateful (cookie).
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'U shkëputët me sukses.']);
    }
}
