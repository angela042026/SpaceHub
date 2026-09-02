<?php

namespace Tests\Feature\QrCode;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Feature\Concerns\CriaEstruturaEspacial;
use Tests\TestCase;

class SecretariaQrCodeTest extends TestCase
{
    use CriaEstruturaEspacial;
    use RefreshDatabase;

    public function test_administrador_acede_a_listagem_de_qrcodes(): void
    {
        $user = $this->criarUsuarioComRole('Administrador');
        $this->criarSecretaria();

        $response = $this->actingAs($user)->get(route('secretarias.qrcodes'));

        $response->assertOk();
    }

    public function test_gestor_acede_a_listagem_de_qrcodes(): void
    {
        $user = $this->criarUsuarioComRole('Gestor');
        $this->criarSecretaria();

        $response = $this->actingAs($user)->get(route('secretarias.qrcodes'));

        $response->assertOk();
    }

    public function test_utilizador_comum_recebe_403(): void
    {
        $user = $this->criarUsuarioComRole('Utilizador');

        $response = $this->actingAs($user)->get(route('secretarias.qrcodes'));

        $response->assertForbidden();
    }

    public function test_show_devolve_svg(): void
    {
        $user = $this->criarUsuarioComRole('Administrador');
        $secretaria = $this->criarSecretaria();

        $response = $this->actingAs($user)->get(route('secretarias.qrcode', $secretaria->id));

        $response->assertOk();
        $response->assertHeader('Content-Type', 'image/svg+xml');
        $cacheControl = (string) $response->headers->get('Cache-Control');
        $this->assertStringContainsString('no-store', $cacheControl);
        $this->assertStringContainsString('must-revalidate', $cacheControl);
        $this->assertStringStartsWith('<svg', $response->getContent());
        $this->assertStringNotContainsString('<?xml', $response->getContent());
    }
}
