<?php

namespace Tests\Feature\Seeders;

use App\Models\Reserva;
use App\Services\PagamentoService;
use Database\Seeders\ReservaSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * UserSeeder já só cria as contas de demonstração em local/testing,
 * mas ReservaSeeder (que depende delas) corria sempre — `migrate
 * --seed` fora desses ambientes falhava a meio com RuntimeException,
 * já depois de ter criado roles/períodos/estados/estrutura física.
 */
class ReservaSeederEnvironmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_reserva_seeder_nao_falha_fora_de_local_testing(): void
    {
        $this->app['env'] = 'production';

        try {
            (new ReservaSeeder)->run(app(PagamentoService::class));
        } finally {
            $this->app['env'] = 'testing';
        }

        $this->assertSame(0, Reserva::count());
    }
}
