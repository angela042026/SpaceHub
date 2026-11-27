<?php

namespace Tests\Feature\Seeders;

use App\Models\User;
use Database\Seeders\CaracteristicaSeeder;
use Database\Seeders\EstadoReservaSeeder;
use Database\Seeders\PeriodoSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\SpaceHubEstruturaSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * As contas de demonstração têm palavra-passe pública. Fora de
 * local/testing só podem ser criadas quando DEMO_DATA está ativo
 * (ambiente de demonstração público).
 */
class DemoDataSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RoleSeeder::class,
            PeriodoSeeder::class,
            EstadoReservaSeeder::class,
            CaracteristicaSeeder::class,
            SpaceHubEstruturaSeeder::class,
        ]);
    }

    private function correrEmProducao(callable $callback): void
    {
        $this->app['env'] = 'production';

        try {
            $callback();
        } finally {
            $this->app['env'] = 'testing';
        }
    }

    public function test_nao_cria_contas_de_demonstracao_em_producao_por_defeito(): void
    {
        config(['app.demo_data' => false]);

        $this->correrEmProducao(fn () => (new UserSeeder)->run());

        $this->assertSame(0, User::where('email', 'admin@spacehub.pt')->count());
    }

    public function test_cria_contas_de_demonstracao_em_producao_com_demo_data(): void
    {
        config(['app.demo_data' => true]);

        $this->correrEmProducao(fn () => (new UserSeeder)->run());

        $this->assertSame(1, User::where('email', 'admin@spacehub.pt')->count());
        $this->assertSame(4, User::whereIn('email', [
            'admin@spacehub.pt',
            'gestor@spacehub.pt',
            'colaborador@spacehub.pt',
            'utilizador@spacehub.pt',
        ])->count());
    }
}
