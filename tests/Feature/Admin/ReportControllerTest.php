<?php

namespace Tests\Feature\Admin;

use App\Models\Reserva;
use App\Models\ReservaDia;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class ReportControllerTest extends TestCase
{
    use CriaEstruturaEspacial;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    private function userWithRole(string $nome): User
    {
        return User::factory()->create([
            'role_id' => Role::where('nome', $nome)->firstOrFail()->id,
            'ativo' => true,
        ]);
    }

    public function test_administrator_can_access_all_report_pages(): void
    {
        $admin = $this->userWithRole('Administrador');

        $this->actingAs($admin)->get(route('admin.reports.index'))->assertOk();
        $this->actingAs($admin)->get(route('admin.reports.reservas'))->assertOk();
        $this->actingAs($admin)->get(route('admin.reports.utilizadores'))->assertOk();
        $this->actingAs($admin)->get(route('admin.reports.suporte'))->assertOk();
    }

    public function test_gestor_can_access_most_report_pages(): void
    {
        $gestor = $this->userWithRole('Gestor');

        $this->actingAs($gestor)->get(route('admin.reports.index'))->assertOk();
        $this->actingAs($gestor)->get(route('admin.reports.reservas'))->assertOk();
        $this->actingAs($gestor)->get(route('admin.reports.suporte'))->assertOk();
    }

    /**
     * Ao contrário dos outros relatórios (autorizados via SetorPolicy,
     * aberta a Administrador+Gestor), o relatório de utilizadores usa
     * Gate::authorize('viewAny', User::class) — e UserPolicy::viewAny()
     * é deliberadamente só para Administrador ("Apenas o Administrador
     * pode listar utilizadores"), o mesmo critério usado em toda a
     * gestão de utilizadores. O middleware da rota (Administrador OU
     * Gestor) é só o primeiro filtro; esta policy é mais restrita e
     * bloqueia o Gestor especificamente aqui, de propósito.
     */
    public function test_apenas_administrador_acede_ao_relatorio_de_utilizadores(): void
    {
        $admin = $this->userWithRole('Administrador');
        $gestor = $this->userWithRole('Gestor');

        $this->actingAs($admin)->get(route('admin.reports.utilizadores'))->assertOk();
        $this->actingAs($gestor)->get(route('admin.reports.utilizadores'))->assertForbidden();
    }

    public function test_colaborador_and_utilizador_cannot_access_reports(): void
    {
        foreach (['Colaborador', 'Utilizador'] as $nome) {
            $user = $this->userWithRole($nome);

            $this->actingAs($user)
                ->get(route('admin.reports.index'))
                ->assertForbidden();
        }
    }

    public function test_relatorio_de_reservas_respeita_filtro_de_data(): void
    {
        $admin = $this->userWithRole('Administrador');

        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $estado = $this->criarEstadoReserva('pendente');
        $dono = $this->criarUsuarioComRole('Utilizador');

        $dentroDoFiltro = Reserva::create([
            'user_id' => $dono->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estado->id,
            'data' => '2026-03-10',
            'data_fim' => '2026-03-10',
            'tipo_duracao' => 'diaria',
        ]);

        Reserva::create([
            'user_id' => $dono->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estado->id,
            'data' => '2026-05-10',
            'data_fim' => '2026-05-10',
            'tipo_duracao' => 'diaria',
        ]);

        $response = $this->actingAs($admin)->get(
            route('admin.reports.reservas', [
                'data_inicio' => '2026-03-01',
                'data_fim' => '2026-03-31',
            ])
        );

        $response->assertOk();

        // Só a reserva de março deve sobreviver ao filtro — se a de
        // maio também aparecesse, a contagem já não seria 1.
        // "reservas" é o paginador inteiro (data/current_page/total/...),
        // por isso a contagem de itens está em "reservas.data", não em
        // "reservas" diretamente — sem o ".data" a asserção contava as
        // chaves do próprio paginador (13), não o número de reservas.
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Reservas')
            ->has('reservas.data', 1)
            ->where('reservas.data.0.id', $dentroDoFiltro->id));
    }

    /**
     * Antes, uma data mal formada ia direta para Carbon::parse() ou
     * whereDate() e podia rebentar com erro 500 em vez de devolver uma
     * mensagem de validação.
     */
    public function test_relatorio_rejeita_data_mal_formada(): void
    {
        $admin = $this->userWithRole('Administrador');

        $this->actingAs($admin)
            ->get(route('admin.reports.reservas', ['data_inicio' => 'não-é-uma-data']))
            ->assertSessionHasErrors('data_inicio');

        $this->actingAs($admin)
            ->get(route('admin.reports.ocupacao', ['data_inicio' => 'não-é-uma-data']))
            ->assertSessionHasErrors('data_inicio');
    }

    public function test_relatorio_rejeita_intervalo_de_datas_invertido(): void
    {
        $admin = $this->userWithRole('Administrador');

        $this->actingAs($admin)
            ->get(route('admin.reports.reservas', [
                'data_inicio' => '2026-06-01',
                'data_fim' => '2026-01-01',
            ]))
            ->assertSessionHasErrors('data_fim');
    }

    public function test_relatorio_rejeita_id_de_filtro_inexistente(): void
    {
        $admin = $this->userWithRole('Administrador');

        $this->actingAs($admin)
            ->get(route('admin.reports.reservas', ['estado_reserva_id' => 999999]))
            ->assertSessionHasErrors('estado_reserva_id');

        $this->actingAs($admin)
            ->get(route('admin.reports.espacos', ['piso_id' => 999999]))
            ->assertSessionHasErrors('piso_id');
    }

    /**
     * REL-03: o Relatório de Espaços mede ocupação real (dias
     * efetivamente ocupados em reserva_dias), não número de reservas —
     * uma reserva de 5 dias corridos conta como 5, não 1.
     */
    public function test_relatorio_de_espacos_conta_dias_ocupados_nao_reservas(): void
    {
        $admin = $this->userWithRole('Administrador');

        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $estado = $this->criarEstadoReserva('confirmada');
        $dono = $this->criarUsuarioComRole('Utilizador');

        $inicio = '2026-03-10';
        $fim = '2026-03-14';

        $reserva = Reserva::create([
            'user_id' => $dono->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estado->id,
            'data' => $inicio,
            'data_fim' => $fim,
            'tipo_duracao' => 'semanal',
        ]);

        foreach (['2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13', '2026-03-14'] as $dia) {
            ReservaDia::create([
                'reserva_id' => $reserva->id,
                'secretaria_id' => $secretaria->id,
                'user_id' => $dono->id,
                'dia' => $dia,
                'slot' => 'manha',
            ]);
        }

        $response = $this->actingAs($admin)->get(
            route('admin.reports.espacos', [
                'data_inicio' => $inicio,
                'data_fim' => $fim,
            ])
        );

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Espacos')
            ->has('linhas.data', 1)
            ->where('linhas.data.0.id', $secretaria->id)
            ->where('linhas.data.0.diasOcupados', 5));
    }

    public function test_impressao_do_relatorio_de_espacos_inclui_todas_as_linhas(): void
    {
        $admin = $this->userWithRole('Administrador');
        $primeira = $this->criarSecretaria();

        foreach (range(2, 25) as $numero) {
            $primeira->setor->secretarias()->create([
                'codigo' => sprintf('SEC-PRINT-%02d', $numero),
                'reservavel' => true,
                'ativo' => true,
            ]);
        }

        $this->actingAs($admin)
            ->get(route('admin.reports.espacos'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('linhas.data', 20)
                ->where('linhas.total', 25));

        $this->actingAs($admin)
            ->get(route('admin.reports.espacos', ['imprimir' => 1]))
            ->assertInertia(fn (Assert $page) => $page
                ->has('linhas.data', 25)
                ->where('linhas.total', 25)
                ->where('linhas.last_page', 1));
    }

    public function test_impressao_de_cancelamentos_inclui_todos_os_registos(): void
    {
        $admin = $this->userWithRole('Administrador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $estado = $this->criarEstadoReserva('cancelada');
        $dono = $this->criarUsuarioComRole('Utilizador');

        foreach (range(0, 24) as $indice) {
            $data = now()->addDays($indice + 1)->toDateString();

            Reserva::create([
                'user_id' => $dono->id,
                'secretaria_id' => $secretaria->id,
                'periodo_id' => $periodo->id,
                'estado_reserva_id' => $estado->id,
                'data' => $data,
                'data_fim' => $data,
                'tipo_duracao' => 'diaria',
                'cancelada_at' => now(),
            ]);
        }

        $this->actingAs($admin)
            ->get(route('admin.reports.cancelamentos'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('reservas.data', 20)
                ->where('reservas.total', 25));

        $this->actingAs($admin)
            ->get(route('admin.reports.cancelamentos', ['imprimir' => 1]))
            ->assertInertia(fn (Assert $page) => $page
                ->has('reservas.data', 25)
                ->where('reservas.total', 25)
                ->where('reservas.last_page', 1));
    }
}
