<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update existing user or create new one
        $user = User::first();
        if ($user) {
            $user->update([
                'name' => 'admin1',
                'email' => 'admin1',
                'password' => Hash::make('jancokkabeh'),
            ]);
        } else {
            User::create([
                'name' => 'admin1',
                'email' => 'admin1',
                'password' => Hash::make('jancokkabeh'),
            ]);
        }
    }
}
