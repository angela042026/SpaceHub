<?php

namespace Tests\Feature\Dashboard;

use App\Models\Edificio;
use App\Models\Reserva;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    protected function setUp(): void
    {
        parent::setUp();

        // EstatisticasService::obterEstatisticas() usa Cache::remember()
        // e o CACHE_STORE=array dos testes persiste entre métodos da
        // mesma classe — sem isto, um teste anterior que já visitou o
        // /dashboard deixa uma resposta em cache com dados de outro
        // cenário, e este teste lê esse resultado desatualizado.
        Cache::flush();
    }

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

    /**
     * Cobre os dados enviados ao dashboard do Colaborador, não só o nome
     * do componente — protege contra regressões nas props que
     * Dashboard/Funcionario.jsx efetivamente usa.
     */
    public function test_colaborador_recebe_dados_do_dashboard_funcionario(): void
    {
        $user = $this->criarUsuarioComRole('Colaborador');
        $this->criarSecretaria();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(function (Assert $page) {
            $page->component('Dashboard/Funcionario')
                ->has('pisos')
                ->has('edificios')
                ->has('reservaHojeUtilizador')
                ->has('proximasReservas')
                ->where('stats.totalSecretarias', 1)
                ->etc();
        });
    }

    /**
     * Cobre os dados enviados ao dashboard do Utilizador comum, não só o
     * nome do componente — protege contra regressões nas props que
     * Dashboard/Utilizador.jsx efetivamente usa.
     */
    public function test_utilizador_comum_recebe_dados_do_dashboard_utilizador(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $this->criarSecretaria();

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(function (Assert $page) {
            $page->component('Dashboard/Utilizador')
                ->has('pisos')
                ->has('edificios')
                ->has('reservaHojeUtilizador')
                ->has('proximasReservas')
                ->where('stats.totalSecretarias', 1)
                ->etc();
        });
    }

    /**
     * O cartão "reserva de hoje" do dashboard usava whereDate('data', hoje)
     * — só via reservas no primeiro dia. Reservas semanais/mensais/anuais
     * (agora em dias corridos) deixavam de aparecer a partir do 2.º dia.
     */
    public function test_reserva_multidia_no_segundo_dia_ainda_aparece_no_dashboard(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo('08:00:00', '18:00:00');
        $estadoPendente = $this->criarEstadoReserva('pendente');

        $ontem = Carbon::today()->subDay();

        Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estadoPendente->id,
            'data' => $ontem->format('Y-m-d'),
            'data_fim' => $ontem->copy()->addDays(6)->format('Y-m-d'),
            'tipo_duracao' => 'semanal',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(function (Assert $page) use ($secretaria) {
            $page->component('Dashboard/Utilizador')
                ->where('reservaHojeUtilizador.secretaria_id', $secretaria->id)
                ->etc();
        });
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

    /**
     * O card "Destaques do período" tem o seu próprio toggle (30
     * dias/90 dias/Ano, ver StatisticsPanel/destaques()) e é isso que
     * controla `estatisticas` — o `?periodo=` do próprio /dashboard
     * não tem nenhum controlo na interface ligado a ele (o único que
     * existia, StatisticsPanel.jsx, não é importado em nenhuma
     * página) e serve só para o valor ser ecoado de volta no payload.
     * `estatisticas` é sempre calculado com a janela fixa de 30 dias
     * (DashboardController::index()), por isso diasComMaiorOcupacao
     * não muda com o `?periodo=`, só com a janela dos 30 dias.
     */
    public function test_estatisticas_usam_janela_fixa_de_30_dias_independente_do_periodo(): void
    {
        $user = $this->criarUsuarioComRole('Administrador');
        $periodo = $this->criarPeriodo();
        // calcularEstatisticas() só conta reservas "confirmada" (mesmo
        // critério do gráfico Reservas por Piso) — "pendente" nunca
        // aparece em diasComMaiorOcupacao.
        $confirmada = $this->criarEstadoReserva('confirmada');
        $secretaria = $this->criarSecretaria();

        Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $confirmada->id,
            'data' => Carbon::today()->format('Y-m-d'),
        ]);

        // Fora da janela fixa de 30 dias — nunca deve entrar em
        // diasComMaiorOcupacao, com nenhum valor de periodo.
        Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $confirmada->id,
            'data' => Carbon::today()->subDays(40)->format('Y-m-d'),
        ]);

        $respostaSemana = $this->actingAs($user)
            ->get('/dashboard?periodo=semana');

        $respostaSemana->assertOk();
        $respostaSemana->assertInertia(
            fn (Assert $page) => $page
                ->component('Dashboard/Admin')
                ->where('periodo', 'semana')
                ->has('estatisticas.diasComMaiorOcupacao', 1)
                ->etc()
        );

        $respostaGeral = $this->actingAs($user)
            ->get('/dashboard?periodo=geral');

        $respostaGeral->assertOk();
        $respostaGeral->assertInertia(
            fn (Assert $page) => $page
                ->component('Dashboard/Admin')
                ->where('periodo', 'geral')
                ->has('estatisticas.diasComMaiorOcupacao', 1)
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