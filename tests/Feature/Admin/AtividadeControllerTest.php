<?php

namespace Tests\Feature\Admin;

use App\Models\ActivityLog;
use App\Models\Role;
use App\Models\User;
use App\Services\ActivityLogger;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class AtividadeControllerTest extends TestCase
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

    public function test_administrador_pode_aceder_ao_registo_de_atividade(): void
    {
        $admin = $this->userWithRole('Administrador');

        $this->actingAs($admin)
            ->get(route('admin.atividade.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Atividade/Index'));
    }

    public function test_utilizador_comum_recebe_403(): void
    {
        foreach (['Gestor', 'Colaborador', 'Utilizador'] as $nome) {
            $user = $this->userWithRole($nome);

            $this->actingAs($user)
                ->get(route('admin.atividade.index'))
                ->assertForbidden();
        }
    }

    public function test_pesquisa_por_descricao_funciona(): void
    {
        $admin = $this->userWithRole('Administrador');

        ActivityLogger::log($admin, 'espaco_criado', 'Setor Alfa · Piso 1');
        ActivityLogger::log($admin, 'espaco_criado', 'Setor Beta · Piso 2');

        $response = $this->actingAs($admin)->get(
            route('admin.atividade.index', ['search' => 'Alfa', 'periodo' => 'tudo'])
        );

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Atividade/Index')
            ->has('registos.data', 1)
            ->where('registos.data.0.description', 'Setor Alfa · Piso 1'));
    }

    public function test_filtro_por_acao_funciona(): void
    {
        $admin = $this->userWithRole('Administrador');

        ActivityLogger::log($admin, 'utilizador_criado', 'Colaborador Demo · demo@spacehub.pt');
        ActivityLogger::log($admin, 'espaco_criado', 'Setor Alfa · Piso 1');

        $response = $this->actingAs($admin)->get(
            route('admin.atividade.index', ['acao' => 'utilizador_criado', 'periodo' => 'tudo'])
        );

        $response->assertInertia(fn (Assert $page) => $page
            ->has('registos.data', 1)
            ->where('registos.data.0.action', 'utilizador_criado'));
    }

    public function test_paginacao_preserva_filtros(): void
    {
        $admin = $this->userWithRole('Administrador');

        for ($i = 0; $i < 11; $i++) {
            ActivityLogger::log($admin, 'espaco_criado', "Setor {$i} · Piso 1");
        }

        $response = $this->actingAs($admin)->get(
            route('admin.atividade.index', ['acao' => 'espaco_criado', 'periodo' => 'tudo'])
        );

        $response->assertInertia(fn (Assert $page) => $page
            ->has('registos.data', 10)
            ->where(
                'registos.next_page_url',
                fn (?string $url) => $url !== null && str_contains($url, 'acao=espaco_criado')
            ));
    }

    public function test_atividade_e_registada_uma_unica_vez(): void
    {
        $admin = $this->userWithRole('Administrador');
        $setor = $this->criarSecretaria()->setor;

        $this->actingAs($admin)->patch(
            route('admin.setores.toggleAtivo', $setor)
        )->assertRedirect();

        $this->assertDatabaseCount('activity_logs', 1);
        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'action' => 'espaco_desativado',
        ]);
    }

    public function test_acoes_automaticas_aparecem_como_sistema(): void
    {
        ActivityLogger::log(null, 'reserva_cancelada', 'Utilizador Demo · SEC-01 (sem check-in dentro do prazo)');

        $registo = ActivityLog::firstOrFail();

        $this->assertNull($registo->actor_id);
        $this->assertSame('Sistema', $registo->actor_name);
        $this->assertSame(ActivityLogger::RESULTADO_AUTOMATICO, $registo->result);
        $this->assertNull($registo->ip_address);
    }

    /**
     * ip_address existia na migration e no $fillable do model, mas
     * ActivityLogger::log() nunca a preenchia — ficava sempre null
     * para qualquer ação, mesmo as de utilizadores reais.
     */
    public function test_acao_de_utilizador_regista_o_ip(): void
    {
        $admin = $this->userWithRole('Administrador');
        $setor = $this->criarSecretaria()->setor;

        $this->actingAs($admin)
            ->from('/')
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.10'])
            ->patch(route('admin.setores.toggleAtivo', $setor))
            ->assertRedirect();

        $this->assertDatabaseHas('activity_logs', [
            'actor_id' => $admin->id,
            'ip_address' => '203.0.113.10',
        ]);
    }

    public function test_dados_sensiveis_nao_aparecem_na_pagina(): void
    {
        $admin = $this->userWithRole('Administrador');
        $role = Role::where('nome', 'Utilizador')->firstOrFail();

        $senhaEmClaro = 'password-secreta-123';

        $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'Novo Colaborador',
            'email' => 'novo.colaborador@spacehub.pt',
            'password' => $senhaEmClaro,
            'role_id' => $role->id,
            'ativo' => true,
        ])->assertRedirect();

        $registo = ActivityLog::where('action', 'utilizador_criado')->firstOrFail();

        $this->assertStringNotContainsString($senhaEmClaro, $registo->description);
        $this->assertStringNotContainsString($senhaEmClaro, (string) json_encode($registo->metadata));

        $pagina = $this->actingAs($admin)->get(route('admin.atividade.index', ['periodo' => 'tudo']));
        $pagina->assertDontSee($senhaEmClaro);
    }

    public function test_historico_pessoal_dos_utilizadores_continua_funcional(): void
    {
        $utilizador = $this->userWithRole('Utilizador');

        $this->actingAs($utilizador)
            ->get(route('reservas.history'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reservas/History'));
    }
}
