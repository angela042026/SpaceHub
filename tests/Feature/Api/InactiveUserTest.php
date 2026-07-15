<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class InactiveUserTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'ativo' => false,
            'password' => Hash::make('password123'),
        ]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])
            ->assertForbidden()
            ->assertJson([
                'message' => 'A conta encontra-se desativada.',
            ]);
    }

    public function test_inactive_user_with_existing_token_cannot_access_private_route(): void
    {
        $user = User::factory()->create([
            'ativo' => false,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/me')
            ->assertForbidden()
            ->assertJson([
                'message' => 'A conta encontra-se desativada.',
            ]);
    }

    public function test_guest_receives_401_on_private_route(): void
    {
        $this->getJson('/api/me')
            ->assertUnauthorized();
    }

    public function test_active_user_can_access_private_route(): void
    {
        $user = User::factory()->create([
            'ativo' => true,
        ]);

        Sanctum::actingAs($user);

        $this->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);
    }
}