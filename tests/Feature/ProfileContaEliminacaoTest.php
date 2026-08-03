<?php

namespace Tests\Feature;

use App\Models\Pagamento;
use App\Models\Reserva;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

/**
 * Testes de regressão para a correção do cascade destrutivo (secção 16.3
 * do relatório): antes desta correção, ProfileController::destroy()
 * fazia um DELETE físico em users, e o cascade da BD apagava em
 * silêncio reservas + pagamentos associados. Nenhum teste existente
 * cria reservas/pagamentos antes de eliminar a conta, por isso a
 * proteção real nunca tinha sido comprovada por teste.
 */
class ProfileContaEliminacaoTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    public function test_eliminar_conta_preserva_reservas_e_pagamentos_do_utilizador(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $estado = $this->criarEstadoReserva('pendente');

        $reserva = Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estado->id,
            'data' => now()->addDay()->format('Y-m-d'),
            'data_fim' => now()->addDay()->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
        ]);

        $pagamento = Pagamento::create([
            'reserva_id' => $reserva->id,
            'valor' => 8.00,
            'estado' => 'pago',
            'referencia' => 'REF-' . Str::upper(Str::random(8)),
        ]);

        $response = $this->actingAs($user)->delete('/profile', [
            'password' => 'password',
        ]);

        $response->assertRedirect('/');
        $this->assertGuest();
        $this->assertSoftDeleted($user);

        // O núcleo da correção: a reserva e o registo de pagamento
        // continuam a existir, intactos, depois da auto-eliminação.
        $this->assertDatabaseHas('reservas', [
            'id' => $reserva->id,
            'user_id' => $user->id,
        ]);

        $this->assertDatabaseHas('pagamentos', [
            'id' => $pagamento->id,
            'reserva_id' => $reserva->id,
            'estado' => 'pago',
        ]);
    }

    public function test_eliminar_conta_liberta_email_para_novo_registo(): void
    {
        $emailOriginal = 'reutilizavel@spacehub.test';

        $user = User::factory()->create([
            'email' => $emailOriginal,
        ]);

        $this->actingAs($user)->delete('/profile', [
            'password' => 'password',
        ]);

        $this->assertDatabaseMissing('users', [
            'email' => $emailOriginal,
        ]);

        // Sem a libertação do e-mail, o unique:users da validação de
        // registo bateria na linha soft-deleted (a validação de
        // unicidade não respeita o scope do SoftDeletes) e isto falharia
        // com "email já registado".
        $response = $this->post('/register', [
            'name' => 'Pessoa Nova',
            'email' => $emailOriginal,
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'terms' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated();

        $novoUtilizador = User::where('email', $emailOriginal)->firstOrFail();
        $this->assertNotSame($user->id, $novoUtilizador->id);
    }

    public function test_eliminar_conta_liberta_google_id(): void
    {
        $user = User::factory()->create([
            'google_id' => 'google-a-libertar',
        ]);

        $this->actingAs($user)->delete('/profile', [
            'password' => 'password',
        ]);

        // fresh() ignora o scope do SoftDeletes de propósito — é a
        // forma correta de inspecionar o estado real da linha
        // soft-deleted na BD.
        $this->assertNull($user->fresh()->google_id);
    }

    public function test_forcedelete_de_utilizador_com_reservas_e_bloqueado_pela_constraint(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $secretaria = $this->criarSecretaria();
        $periodo = $this->criarPeriodo();
        $estado = $this->criarEstadoReserva('pendente');

        Reserva::create([
            'user_id' => $user->id,
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $estado->id,
            'data' => now()->addDay()->format('Y-m-d'),
            'data_fim' => now()->addDay()->format('Y-m-d'),
            'tipo_duracao' => 'diaria',
        ]);

        // Rede de segurança: mesmo que algo (ex.: um script de admin)
        // tente apagar mesmo a linha do utilizador, restrictOnDelete()
        // em reservas.user_id recusa, em vez de apagar em cascata.
        $this->expectException(QueryException::class);

        $user->forceDelete();
    }
}
