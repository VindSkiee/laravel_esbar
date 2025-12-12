<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = [
            // Makanan
            [
                'name' => 'Nasi Goreng Spesial',
                'price' => 25000,
                'description' => 'Nasi goreng dengan telur, ayam, dan sayuran',
                'category' => 'Makanan',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Mie Goreng',
                'price' => 20000,
                'description' => 'Mie goreng dengan sayuran dan telur',
                'category' => 'Makanan',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Ayam Geprek',
                'price' => 28000,
                'description' => 'Ayam goreng dengan sambal geprek pedas',
                'category' => 'Makanan',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Sate Ayam',
                'price' => 30000,
                'description' => '10 tusuk sate ayam dengan bumbu kacang',
                'category' => 'Makanan',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Bakso Spesial',
                'price' => 22000,
                'description' => 'Bakso sapi dengan mie dan pangsit',
                'category' => 'Makanan',
                'status' => 'Tersedia',
            ],
            
            // Minuman
            [
                'name' => 'Es Teh Manis',
                'price' => 5000,
                'description' => 'Es teh manis segar',
                'category' => 'Minuman',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Es Jeruk',
                'price' => 8000,
                'description' => 'Es jeruk peras segar',
                'category' => 'Minuman',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Jus Alpukat',
                'price' => 15000,
                'description' => 'Jus alpukat segar dengan susu',
                'category' => 'Minuman',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Es Cappuccino',
                'price' => 18000,
                'description' => 'Kopi cappuccino dingin',
                'category' => 'Minuman',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Lemon Tea',
                'price' => 10000,
                'description' => 'Teh dengan perasan lemon segar',
                'category' => 'Minuman',
                'status' => 'Tersedia',
            ],
            
            // Es Krim
            [
                'name' => 'Es Krim Vanilla',
                'price' => 12000,
                'description' => 'Es krim vanilla premium',
                'category' => 'Es Krim',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Es Krim Coklat',
                'price' => 12000,
                'description' => 'Es krim coklat premium',
                'category' => 'Es Krim',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Es Krim Strawberry',
                'price' => 14000,
                'description' => 'Es krim strawberry dengan potongan buah',
                'category' => 'Es Krim',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Sundae Spesial',
                'price' => 20000,
                'description' => 'Es krim dengan topping coklat, kacang, dan cherry',
                'category' => 'Es Krim',
                'status' => 'Tersedia',
            ],
            [
                'name' => 'Es Krim Matcha',
                'price' => 16000,
                'description' => 'Es krim rasa green tea Jepang',
                'category' => 'Es Krim',
                'status' => 'Tersedia',
            ],
        ];

        foreach ($menus as $menu) {
            Menu::updateOrCreate(
                ['name' => $menu['name']],
                $menu
            );
        }
    }
}
