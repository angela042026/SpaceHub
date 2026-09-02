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
            CaracteristicaSeeder::class,
            SpaceHubEstruturaSeeder::class,
            UserSeeder::class,
            ReservaSeeder::class,
            PagamentoSeeder::class,
            FaqSeeder::class,
        ]);
    }
}
