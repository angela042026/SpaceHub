<?php

namespace Tests\Feature\Locale;

use App\Http\Middleware\SetLocale;
use App\Models\PedidoSuporte;
use App\Models\User;
use App\Notifications\SuporteRespondidoNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Cobre o mecanismo de troca de idioma (SetLocale + LocaleController) e a
 * garantia de que o backend responde no idioma certo — tanto num pedido
 * HTTP normal (sessão/cookie) como fora dele, em Notifications
 * despoletadas por filas/comandos agendados (User::preferredLocale()).
 */
class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_visitante_ve_o_idioma_por_omissao_pt(): void
    {
        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'pt'));
    }

    public function test_idioma_invalido_e_rejeitado(): void
    {
        $response = $this->post(route('locale.update'), ['locale' => 'fr']);

        $response->assertSessionHasErrors('locale');

        // A sessão não deve ter ficado com um idioma inválido.
        $this->assertNotSame('fr', session('locale'));
    }

    public function test_mensagem_de_validacao_sai_em_ingles_quando_a_sessao_ja_esta_em_ingles(): void
    {
        // Muda para inglês primeiro, depois provoca o mesmo erro de
        // validação — confirma que lang/en/validation.php está ligado.
        $this->post(route('locale.update'), ['locale' => 'en']);

        $response = $this->post(route('locale.update'), ['locale' => 'fr']);

        $response->assertSessionHasErrors('locale');
        $this->assertSame(
            'The selected locale is invalid.',
            session('errors')->first('locale')
        );
    }

    public function test_mensagem_de_validacao_sai_em_portugues_por_omissao(): void
    {
        $response = $this->post(route('locale.update'), ['locale' => 'fr']);

        $response->assertSessionHasErrors('locale');
        $this->assertSame(
            'O valor selecionado para locale é inválido.',
            session('errors')->first('locale')
        );
    }

    public function test_visitante_pode_mudar_para_ingles_e_fica_guardado_na_sessao_e_no_cookie(): void
    {
        $response = $this->post(route('locale.update'), ['locale' => 'en']);

        $response->assertSessionHasNoErrors();
        $this->assertSame('en', session('locale'));
        $response->assertCookie(SetLocale::COOKIE, 'en');
    }

    public function test_pedido_seguinte_reflete_o_idioma_guardado_na_sessao(): void
    {
        $this->post(route('locale.update'), ['locale' => 'en']);

        $this->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
    }

    public function test_cookie_de_idioma_e_respeitado_sem_sessao_previa(): void
    {
        // Simula um visitante que já escolheu inglês numa visita anterior
        // (cookie de 1 ano) mas cuja sessão atual ainda não tem 'locale'.
        // withCookie() encripta o valor tal como o EncryptCookies faria
        // a um cookie real vindo do browser — sem isto, o middleware
        // falhava a desencriptar um valor em claro e o cookie era
        // simplesmente ignorado.
        $this->withCookie(SetLocale::COOKIE, 'en')
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
    }

    public function test_utilizador_autenticado_pode_mudar_de_idioma(): void
    {
        $user = User::factory()->create(['locale' => null]);

        $this->actingAs($user)
            ->post(route('locale.update'), ['locale' => 'en'])
            ->assertSessionHasNoErrors();

        $this->assertSame('en', $user->fresh()->locale);
    }

    public function test_utilizador_autenticado_ve_a_pagina_no_idioma_guardado(): void
    {
        $user = User::factory()->create(['locale' => 'en']);

        $this->actingAs($user)
            ->get(route('home'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('locale', 'en'));
    }

    /**
     * O canal 'database' das Notifications corre em fila
     * (QUEUE_CONNECTION=database em produção) — não há pedido HTTP em
     * curso nem sessão de onde ler o idioma. Este teste teria passado
     * mesmo sem a mudança (QUEUE_CONNECTION=sync nos testes), mas o que
     * importa aqui é confirmar que o texto guardado reflete
     * User::preferredLocale(), não app()->getLocale() do momento em
     * que o teste corre.
     */
    public function test_notificacao_respeita_a_preferencia_de_idioma_do_utilizador(): void
    {
        $utilizadorIngles = User::factory()->create(['locale' => 'en']);
        $utilizadorPortugues = User::factory()->create(['locale' => 'pt']);

        $pedidoIngles = PedidoSuporte::create([
            'user_id' => $utilizadorIngles->id,
            'assunto' => 'Assunto de teste',
            'mensagem' => 'Mensagem de teste',
            'resposta' => 'Resposta de teste',
            'estado' => 'Resolvido',
        ]);

        $pedidoPortugues = PedidoSuporte::create([
            'user_id' => $utilizadorPortugues->id,
            'assunto' => 'Assunto de teste',
            'mensagem' => 'Mensagem de teste',
            'resposta' => 'Resposta de teste',
            'estado' => 'Resolvido',
        ]);

        $utilizadorIngles->notify(new SuporteRespondidoNotification($pedidoIngles));
        $utilizadorPortugues->notify(new SuporteRespondidoNotification($pedidoPortugues));

        $this->assertSame(
            'Support Request Resolved',
            $utilizadorIngles->fresh()->notifications()->first()->data['titulo']
        );

        $this->assertSame(
            'Pedido de Suporte Resolvido',
            $utilizadorPortugues->fresh()->notifications()->first()->data['titulo']
        );
    }

    /**
     * Sem preferência guardada (utilizador criado antes desta
     * funcionalidade existir, ou nunca trocou de idioma), a notificação
     * cai em português — o mesmo omissão usado pelo SetLocale.
     */
    public function test_notificacao_cai_em_portugues_sem_preferencia_guardada(): void
    {
        $user = User::factory()->create(['locale' => null]);

        $pedido = PedidoSuporte::create([
            'user_id' => $user->id,
            'assunto' => 'Assunto de teste',
            'mensagem' => 'Mensagem de teste',
            'resposta' => 'Resposta de teste',
            'estado' => 'Resolvido',
        ]);

        $user->notify(new SuporteRespondidoNotification($pedido));

        $this->assertSame(
            'Pedido de Suporte Resolvido',
            $user->fresh()->notifications()->first()->data['titulo']
        );
    }
}
