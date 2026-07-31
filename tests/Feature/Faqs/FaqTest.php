<?php

namespace Tests\Feature\Faqs;

use App\Models\Faq;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Centro de Ajuda. A listagem esconde as FAQs inativas e agrupa por
 * categoria, com as categorias por uma ordem fixa definida no controller.
 */
class FaqTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        $this->user = User::factory()->create([
            'role_id' => Role::where('nome', 'Utilizador')->firstOrFail()->id,
            'ativo' => true,
        ]);
    }

    public function test_visitante_e_redirecionado_para_o_login(): void
    {
        $this->get(route('faqs.index'))
            ->assertRedirect(route('login'));
    }

    public function test_a_pagina_agrupa_as_faqs_por_categoria(): void
    {
        $this->actingAs($this->user)
            ->get(route('faqs.index'))
            ->assertOk()
            ->assertInertia(
                fn (Assert $page) => $page
                    ->component('Faqs/Index')
                    ->has('faqs.Reservas')
            );
    }

    public function test_faqs_inativas_nao_aparecem(): void
    {
        Faq::query()->update(['ativo' => false]);

        Faq::create([
            'categoria' => 'Reservas',
            'pergunta' => 'Esta aparece?',
            'resposta' => 'Sim, porque está ativa.',
            'ordem' => 1,
            'ativo' => true,
        ]);

        Faq::create([
            'categoria' => 'Reservas',
            'pergunta' => 'Esta não devia aparecer.',
            'resposta' => 'Está inativa.',
            'ordem' => 2,
            'ativo' => false,
        ]);

        $this->actingAs($this->user)
            ->get(route('faqs.index'))
            ->assertInertia(
                fn (Assert $page) => $page
                    ->has('faqs.Reservas', 1)
                    ->where('faqs.Reservas.0.pergunta', 'Esta aparece?')
            );
    }

    public function test_as_faqs_de_uma_categoria_seguem_o_campo_ordem(): void
    {
        Faq::query()->update(['ativo' => false]);

        Faq::create([
            'categoria' => 'Conta',
            'pergunta' => 'Segunda',
            'resposta' => 'Resposta.',
            'ordem' => 2,
            'ativo' => true,
        ]);

        Faq::create([
            'categoria' => 'Conta',
            'pergunta' => 'Primeira',
            'resposta' => 'Resposta.',
            'ordem' => 1,
            'ativo' => true,
        ]);

        $this->actingAs($this->user)
            ->get(route('faqs.index'))
            ->assertInertia(
                fn (Assert $page) => $page
                    ->where('faqs.Conta.0.pergunta', 'Primeira')
                    ->where('faqs.Conta.1.pergunta', 'Segunda')
            );
    }
}
