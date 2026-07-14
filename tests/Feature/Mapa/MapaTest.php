<?php

namespace Tests\Feature\Mapa;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class MapaTest extends TestCase
{
    use RefreshDatabase;
    use CriaEstruturaEspacial;

    public function test_utilizador_nao_autenticado_e_redirecionado(): void
    {
        $response = $this->get('/mapa');

        $response->assertRedirect('/login');
    }

    public function test_qualquer_papel_autenticado_ve_o_mapa(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');
        $this->criarSecretaria();

        $response = $this->actingAs($user)->get(route('mapa.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Mapa/Index')
            ->has('pisos', 1)
            ->has('edificios'));
    }
}
