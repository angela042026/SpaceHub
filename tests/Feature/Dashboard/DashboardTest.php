<?php

namespace Tests\Feature\Dashboard;

use App\Models\Edificio;
use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    private function criarSetorComSecretarias(int $quantidade): array
    {
        $edificio = Edificio::create([
            'nome' => 'Edifício Central',
            'codigo' => 'ED-'.uniqid(),
            'morada' => 'Rua Principal, 1',
            'cidade' => 'Lisboa',
        ]);

        $piso = $edificio->pisos()->create([
            'nome' => 'Piso 1',
            'codigo' => 'P1',
            'numero' => 1,
        ]);

        $setor = $piso->setores()->create([
            'nome' => 'Setor A',
            'codigo' => 'A',
            'tipo' => 'coworking',
            'reservavel' => true,
        ]);

        $secretarias = collect(range(1, $quantidade))->map(
            fn (int $indice) => $setor->secretarias()->create([
                'codigo' => "SEC-{$indice}-".uniqid(),
                'reservavel' => true,
                'ativo' => true,
            ])
        );

        return [$setor, $secretarias];
    }

    public function test_utilizador_nao_autenticado_e_redirecionado(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_administrador_ve_dashboard_admin(): void
    {
        $user = $this->criarUsuarioComRole('Administrador');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page->component('Dashboard/Admin')
        );
    }

    public function test_colaborador_ve_dashboard_funcionario(): void
    {
        $user = $this->criarUsuarioComRole('Colaborador');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page->component('Dashboard/Funcionario')
        );
    }

    public function test_utilizador_comum_ve_dashboard_utilizador(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(
            fn (Assert $page) => $page->component('Dashboard/Utilizador')
        );
    }

    public function test_stats_basicos_aparecem_sem_reservas(): void
    {
        $user = $this->criarUsuarioComRole('Administrador');
        $this->criarSecretaria();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(function (Assert $page) {
            $page->component('Dashboard/Admin')
                ->where('stats.totalSecretarias', 1)
                ->where('stats.reservasHoje.value', 0)
                ->etc();
        });
    }

    public function test_kpis_com_dados_reais(): void
    {
        $admin = $this->criarUsuarioComRole('Administrador');
        $utilizadorPendente = $this->criarUsuarioComRole('Utilizador');
        $utilizadorConfirmado = $this->criarUsuarioComRole('Utilizador');

        $periodo = $this->criarPeriodo();
        $pendente = $this->criarEstadoReserva('pendente');
        $confirmada = $this->criarEstadoReserva('confirmada');
        $cancelada = $this->criarEstadoReserva('cancelada');

        $secretaria1 = $this->criarSecretaria();
        $secretaria2 = $this->criarSecretaria();
        $secretaria3 = $this->criarSecretaria();

        Reserva::create([
            'user_id' => $utilizadorPendente->id,
            'secretaria_id' => $secretaria1->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $pendente->id,
            'data' => Carbon::today()->format('Y-m-d'),
        ]);

        Reserva::create([
            'user_id' => $utilizadorConfirmado->id,
            'secretaria_id' => $secretaria2->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $confirmada->id,
            'data' => Carbon::today()->format('Y-m-d'),
            'check_in_at' => now(),
        ]);

        Reserva::create([
            'user_id' => $admin->id,
            'secretaria_id' => $secretaria3->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $cancelada->id,
            'data' => Carbon::today()->format('Y-m-d'),
            'cancelada_at' => now(),
        ]);

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(function (Assert $page) {
            $page->component('Dashboard/Admin')
                ->where('stats.totalSecretarias', 3)
                ->where('stats.reservasHoje.value', 2)
                ->where('stats.checkinsHoje.value', 1)
                ->where('stats.cancelamentosHoje.value', 1)
                ->where('stats.mesasLivres.value', 1)
                ->where('stats.taxaOcupacao.value', 67)
                ->etc();
        });
    }

    public function test_mapa_devolve_status_correto_por_secretaria(): void
    {
        $user = $this->criarUsuarioComRole('Administrador');
        $periodo = $this->criarPeriodo('08:00:00', '13:00:00');
        $confirmada = $this->criarEstadoReserva('confirmada');

        [$setor, $secretarias] = $this->criarSetorComSecretarias(2);
        $secretariaOcupada = $secretarias[0];

        Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretariaOcupada->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $confirmada->id,
            'data' => Carbon::today()->format('Y-m-d'),
            'check_in_at' => now(),
        ]);

        $this->travelTo(Carbon::today()->setTime(8, 15));

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(function (Assert $page) use ($setor) {
            $page->component('Dashboard/Admin')
                ->where('pisos.0.setores.0.id', $setor->id)
                ->where('pisos.0.setores.0.totalSecretarias', 2)
                ->where('pisos.0.setores.0.ocupadas', 1)
                ->where('pisos.0.setores.0.livres', 1)
                ->where('pisos.0.setores.0.status', 'reservada')
                ->etc();
        });
    }

    public function test_estatisticas_respeitam_filtro_periodo(): void
    {
        $user = $this->criarUsuarioComRole('Administrador');
        $periodo = $this->criarPeriodo();
        $pendente = $this->criarEstadoReserva('pendente');
        $secretaria = $this->criarSecretaria();

        Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $pendente->id,
            'data' => Carbon::today()->format('Y-m-d'),
        ]);

        Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $pendente->id,
            'data' => Carbon::today()->subWeeks(2)->format('Y-m-d'),
        ]);

        $respostaSemana = $this->actingAs($user)
            ->get('/dashboard?periodo=semana');

        $respostaSemana->assertOk();
        $respostaSemana->assertInertia(
            fn (Assert $page) => $page
                ->component('Dashboard/Admin')
                ->has('estatisticas.diasComMaiorOcupacao', 1)
                ->etc()
        );

        $respostaGeral = $this->actingAs($user)
            ->get('/dashboard?periodo=geral');

        $respostaGeral->assertOk();
        $respostaGeral->assertInertia(
            fn (Assert $page) => $page
                ->component('Dashboard/Admin')
                ->has('estatisticas.diasComMaiorOcupacao', 2)
                ->etc()
        );
    }

    public function test_dashboard_nao_gera_queries_que_escalam_com_dados(): void
    {
        $admin = $this->criarUsuarioComRole('Administrador');
        $periodo = $this->criarPeriodo();
        $pendente = $this->criarEstadoReserva('pendente');

        $criarCenario = function (int $quantidade) use (
            $periodo,
            $pendente
        ) {
            for ($i = 0; $i < $quantidade; $i++) {
                $utilizador = $this->criarUsuarioComRole('Utilizador');
                $secretaria = $this->criarSecretaria();

                Reserva::create([
                    'user_id' => $utilizador->id,
                    'secretaria_id' => $secretaria->id,
                    'periodo_id' => $periodo->id,
                    'estado_reserva_id' => $pendente->id,
                    'data' => Carbon::today()->format('Y-m-d'),
                ]);
            }
        };

        $criarCenario(2);

        DB::enableQueryLog();

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertOk();

        $queriesCenarioPequeno = count(DB::getQueryLog());

        DB::flushQueryLog();

        $criarCenario(18);

        /*
         * As queries de preparação dos dados não devem entrar
         * na contagem do dashboard.
         */
        DB::flushQueryLog();

        $this->actingAs($admin)
            ->get('/dashboard')
            ->assertOk();

        $queriesCenarioGrande = count(DB::getQueryLog());

        DB::disableQueryLog();

        /*
         * Uma query N+1 real aumentaria proporcionalmente ao número
         * de secretárias e reservas, não apenas por uma diferença fixa.
         */
        $this->assertLessThanOrEqual(
            $queriesCenarioPequeno + 3,
            $queriesCenarioGrande,
            'O número de queries do dashboard não deveria escalar com a quantidade de secretárias/reservas (indício de N+1).'
        );
    }
}