<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Admin::create([
            'username' => 'admin',
            'password_hash' => Admin::hashPassword('admin123'),
        ]);

        Admin::create([
            'username' => 'esbar_admin',
            'password_hash' => Admin::hashPassword('esbar2024'),
        ]);
    }
}
