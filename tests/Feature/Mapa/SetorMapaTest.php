<?php

namespace Tests\Feature\Mapa;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class SetorMapaTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    public function test_administrador_acede_ao_editor_de_mapa(): void
    {
        $user = $this->criarUsuarioComRole('Administrador');
        $this->criarSecretaria();

        $response = $this->actingAs($user)->get(route('setores.mapa.edit'));

        $response->assertOk();
    }

    public function test_utilizador_comum_recebe_403(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $response = $this->actingAs($user)->get(route('setores.mapa.edit'));

        $response->assertForbidden();
    }

    public function test_atualizar_posicao_com_valores_validos(): void
    {
        $user = $this->criarUsuarioComRole('Administrador');
        $secretaria = $this->criarSecretaria();
        $setor = $secretaria->setor;

        $response = $this->actingAs($user)
            ->patch(route('setores.posicao.update', $setor->id), [
                'planta_x' => 50,
                'planta_y' => 30,
            ]);

        $response->assertOk();
        $response->assertJson(['ok' => true]);

        $this->assertSame(50, $setor->fresh()->planta_x);
        $this->assertSame(30, $setor->fresh()->planta_y);
    }

    public function test_atualizar_posicao_com_valores_fora_do_intervalo_falha(): void
    {
        $user = $this->criarUsuarioComRole('Administrador');
        $secretaria = $this->criarSecretaria();
        $setor = $secretaria->setor;

        $response = $this->actingAs($user)
            ->patch(route('setores.posicao.update', $setor->id), [
                'planta_x' => 101,
                'planta_y' => -1,
            ]);

        $response->assertSessionHasErrors(['planta_x', 'planta_y']);
    }
}
