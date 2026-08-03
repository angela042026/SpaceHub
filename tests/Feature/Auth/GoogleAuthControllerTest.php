<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class GoogleAuthControllerTest extends TestCase
{
    use RefreshDatabase;

    private function mockSocialiteUser(
        string $googleId,
        ?string $email,
        string $nome = 'Utilizador Google'
    ): void {
        $socialiteUser = Mockery::mock(SocialiteUser::class);
        $socialiteUser->shouldReceive('getId')->andReturn($googleId);
        $socialiteUser->shouldReceive('getEmail')->andReturn($email);
        $socialiteUser->shouldReceive('getName')->andReturn($nome);

        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->andReturn($socialiteUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    public function test_creates_new_user_and_logs_in_when_no_matching_account(): void
    {
        $this->mockSocialiteUser('google-123', 'novo@spacehub.test', 'Pessoa Nova');

        $response = $this->get(route('google.callback'));

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard'));

        $user = User::where('email', 'novo@spacehub.test')->firstOrFail();

        $this->assertSame('google-123', $user->google_id);
        $this->assertSame('Pessoa Nova', $user->name);
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue($user->ativo);
    }

    public function test_logs_in_existing_user_matched_by_google_id(): void
    {
        $user = User::factory()->create([
            'google_id' => 'google-456',
            'email' => 'ja-ligado@spacehub.test',
        ]);

        // O Google agora reporta um e-mail diferente do gravado — a
        // ligação pelo google_id deve continuar a bastar para
        // identificar a mesma conta.
        $this->mockSocialiteUser('google-456', 'email-diferente@spacehub.test');

        $response = $this->get(route('google.callback'));

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard'));

        $this->assertSame(1, User::count());
    }

    public function test_links_google_id_to_existing_verified_account_matched_by_email(): void
    {
        $user = User::factory()->create([
            'google_id' => null,
            'email' => 'conta-verificada@spacehub.test',
            'email_verified_at' => now(),
            'password' => bcrypt('password-original'),
        ]);

        $passwordOriginal = $user->password;

        $this->mockSocialiteUser('google-789', 'conta-verificada@spacehub.test');

        $response = $this->get(route('google.callback'));

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard'));

        $user->refresh();

        $this->assertSame('google-789', $user->google_id);

        // Conta já verificada: a password existente não deve ser tocada.
        $this->assertSame($passwordOriginal, $user->password);
    }

    public function test_claims_unverified_account_and_invalidates_password_when_matched_by_email(): void
    {
        // Conta pré-registada (ex.: por outra pessoa, de má fé, ou um
        // registo abandonado) cujo e-mail nunca foi confirmado — o
        // Google agora prova quem é o dono real do e-mail.
        $user = User::factory()->create([
            'google_id' => null,
            'email' => 'nunca-confirmado@spacehub.test',
            'email_verified_at' => null,
            'password' => bcrypt('password-de-terceiros'),
        ]);

        $passwordAntiga = $user->password;

        $this->mockSocialiteUser('google-999', 'nunca-confirmado@spacehub.test');

        $response = $this->get(route('google.callback'));

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard'));

        $user->refresh();

        $this->assertSame('google-999', $user->google_id);
        $this->assertNotNull($user->email_verified_at);

        // A password de quem quer que tenha registado a conta antes é
        // invalidada — só o dono comprovado do e-mail (via Google)
        // consegue agora entrar nesta conta.
        $this->assertNotSame($passwordAntiga, $user->password);
    }

    public function test_inactive_user_is_redirected_with_error_and_not_logged_in(): void
    {
        User::factory()->create([
            'google_id' => 'google-inativo',
            'email' => 'inativo@spacehub.test',
            'ativo' => false,
        ]);

        $this->mockSocialiteUser('google-inativo', 'inativo@spacehub.test');

        $response = $this->get(route('google.callback'));

        $this->assertGuest();
        $response->assertRedirect(route('login'));
        $response->assertSessionHasErrors('email');
    }

    public function test_redirects_with_error_when_google_does_not_provide_email(): void
    {
        $this->mockSocialiteUser('google-sem-email', null);

        $response = $this->get(route('google.callback'));

        $this->assertGuest();
        $response->assertRedirect(route('login'));
        $response->assertSessionHasErrors('email');

        $this->assertSame(0, User::count());
    }

    public function test_redirects_with_error_when_socialite_throws(): void
    {
        Socialite::shouldReceive('driver')
            ->with('google')
            ->andThrow(new \Exception('Falha ao contactar o Google.'));

        $response = $this->get(route('google.callback'));

        $this->assertGuest();
        $response->assertRedirect(route('login'));
        $response->assertSessionHasErrors('email');
    }
}
