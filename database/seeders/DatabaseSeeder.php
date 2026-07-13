<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PeriodoSeeder::class,
            EstadoReservaSeeder::class,
            SpaceHubEstruturaSeeder::class,
            UserSeeder::class,
            ReservaSeeder::class,
             FaqSeeder::class,
        ]);
    }
}