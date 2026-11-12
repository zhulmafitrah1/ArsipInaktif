<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Bisa login pakai email atau username (name)
        $user = User::where('email', $request->email)
            ->orWhere('name', $request->email)
            ->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                "success" => false,
                "message" => "Email atau password salah"
            ], 401);
        }

        // Create token using Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            "success" => true,
            "message" => "Login berhasil",
            "token"   => $token,
            "user"    => [
                "id"    => $user->id,
                "email" => $user->email,
                "name"  => $user->name ?? null,
                "role"  => $user->role,  // ✅ DITAMBAH
            ]
        ]);
    }
}