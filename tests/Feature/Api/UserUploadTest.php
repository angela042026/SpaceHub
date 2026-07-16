<?php

namespace Tests\Feature\Api;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserUploadTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Role $utilizadorRole;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        Storage::fake('public');

        $this->admin = User::query()
            ->where('email', 'admin@spacehub.pt')
            ->firstOrFail();

        $this->utilizadorRole = Role::query()
            ->where('nome', 'Utilizador')
            ->firstOrFail();

        Sanctum::actingAs($this->admin);
    }

    public function test_administrator_can_create_user_with_valid_photo(): void
    {
        $fotografia = UploadedFile::fake()->image(
            'fotografia.jpg',
            600,
            600
        );

        $response = $this->post('/api/users', [
            'name' => 'Utilizador com fotografia',
            'email' => 'fotografia@spacehub.test',
            'password' => 'password123',
            'role_id' => $this->utilizadorRole->id,
            'fotografia' => $fotografia,
        ], [
            'Accept' => 'application/json',
        ]);

        $response
            ->assertSuccessful()
            ->assertJsonPath(
                'data.email',
                'fotografia@spacehub.test'
            );

        $user = User::query()
            ->where('email', 'fotografia@spacehub.test')
            ->firstOrFail();

        $this->assertNotNull($user->fotografia);

        $this->assertTrue(
            Storage::disk('public')->exists($user->fotografia)
        );

        $this->assertStringStartsWith(
            'utilizadores/fotografias/',
            $user->fotografia
        );
    }

    public function test_invalid_user_photo_returns_422(): void
    {
        $ficheiro = UploadedFile::fake()->create(
            'documento.pdf',
            100,
            'application/pdf'
        );

        $response = $this->post('/api/users', [
            'name' => 'Utilizador inválido',
            'email' => 'invalido@spacehub.test',
            'password' => 'password123',
            'role_id' => $this->utilizadorRole->id,
            'fotografia' => $ficheiro,
        ], [
            'Accept' => 'application/json',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors('fotografia');

        $this->assertDatabaseMissing('users', [
            'email' => 'invalido@spacehub.test',
        ]);

        $this->assertCount(
            0,
            Storage::disk('public')->files(
                'utilizadores/fotografias'
            )
        );
    }

    public function test_oversized_user_photo_returns_422(): void
    {
        $fotografia = UploadedFile::fake()
            ->image('fotografia-grande.png')
            ->size(3000);

        $response = $this->post('/api/users', [
            'name' => 'Utilizador imagem grande',
            'email' => 'grande@spacehub.test',
            'password' => 'password123',
            'role_id' => $this->utilizadorRole->id,
            'fotografia' => $fotografia,
        ], [
            'Accept' => 'application/json',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors('fotografia');

        $this->assertDatabaseMissing('users', [
            'email' => 'grande@spacehub.test',
        ]);

        $this->assertCount(
            0,
            Storage::disk('public')->files(
                'utilizadores/fotografias'
            )
        );
    }

    public function test_updating_photo_replaces_and_deletes_previous_file(): void
    {
        $fotografiaAntiga = UploadedFile::fake()
            ->image('antiga.jpg')
            ->store('utilizadores/fotografias', 'public');

        $user = User::create([
            'name' => 'Utilizador para atualizar',
            'email' => 'atualizar@spacehub.test',
            'password' => 'password123',
            'role_id' => $this->utilizadorRole->id,
            'ativo' => true,
            'fotografia' => $fotografiaAntiga,
        ]);

        $this->assertTrue(
            Storage::disk('public')->exists($fotografiaAntiga)
        );

        $novaFotografia = UploadedFile::fake()->image(
            'nova.webp',
            800,
            800
        );

        $response = $this->call(
            'PUT',
            "/api/users/{$user->id}",
            [],
            [],
            [
                'fotografia' => $novaFotografia,
            ],
            [
                'HTTP_ACCEPT' => 'application/json',
            ]
        );

        $response->assertOk();

        $user->refresh();

        $this->assertNotNull($user->fotografia);

        $this->assertNotSame(
            $fotografiaAntiga,
            $user->fotografia
        );

        $this->assertTrue(
            Storage::disk('public')->exists($user->fotografia)
        );

        $this->assertFalse(
            Storage::disk('public')->exists($fotografiaAntiga)
        );
    }
}