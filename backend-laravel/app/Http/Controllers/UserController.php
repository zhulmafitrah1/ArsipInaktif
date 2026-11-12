<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /* ===== GET ALL USERS ===== */
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role')->get();

        // Mapping agar React bisa baca "username" dan "nama_lengkap"
        $mapped = $users->map(function ($u) {
            return [
                'id'          => $u->id,
                'username'    => $u->name,
                'nama_lengkap'=> $u->name,
                'email'       => $u->email,
                'role'        => $u->role,
            ];
        });

        return response()->json($mapped);
    }

    /* ===== TAMBAH USER BARU ===== */
    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role'     => 'required|in:admin,staf',
        ]);

        $user = User::create([
            'name'     => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil ditambahkan',
            'user'    => $user,
        ], 201);
    }

    /* ===== EDIT USER ===== */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'email' => 'required|email|unique:users,email,' . $id,
            'role'  => 'required|in:admin,staf',
        ]);

        $user->update([
            'name'  => $request->nama_lengkap ?? $request->username ?? $user->name,
            'email' => $request->email,
            'role'  => $request->role,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diupdate',
        ]);
    }

    /* ===== HAPUS USER ===== */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus',
        ]);
    }

    /* ===== RESET PASSWORD ===== */
    public function resetPassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|min:6',
        ]);

        $user = User::findOrFail($id);
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil direset',
        ]);
    }
}