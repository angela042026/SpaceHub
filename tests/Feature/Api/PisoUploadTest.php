<?php

namespace Tests\Feature\Api;

use App\Models\Edificio;
use App\Models\Piso;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PisoUploadTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Edificio $edificio;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();

        Storage::fake('public');

        $this->admin = User::query()
            ->where('email', 'admin@spacehub.pt')
            ->firstOrFail();

        Sanctum::actingAs($this->admin);

        $this->edificio = Edificio::create([
            'nome' => 'Edifício Teste Upload',
            'codigo' => 'EU'.Str::upper(Str::random(6)),
            'morada' => 'Rua Teste, 1',
            'cidade' => 'Lisboa',
            'pais' => 'Portugal',
            'ativo' => true,
        ]);
    }

    public function test_administrator_can_create_floor_with_valid_plan(): void
    {
        $codigo = 'PV'.Str::upper(Str::random(6));

        $planta = UploadedFile::fake()->image(
            'planta.png',
            1200,
            800
        );

        $response = $this->post('/api/pisos', [
            'edificio_id' => $this->edificio->id,
            'nome' => 'Piso com planta',
            'codigo' => $codigo,
            'numero' => 101,
            'planta' => $planta,
        ], [
            'Accept' => 'application/json',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.codigo', $codigo);

        $piso = Piso::query()
            ->where('edificio_id', $this->edificio->id)
            ->where('codigo', $codigo)
            ->firstOrFail();

        $this->assertNotNull($piso->planta);

        $this->assertTrue(
            Storage::disk('public')->exists($piso->planta)
        );

        $this->assertStringStartsWith(
            'pisos/plantas/',
            $piso->planta
        );
    }

    public function test_invalid_floor_plan_returns_422(): void
    {
        $codigo = 'PI'.Str::upper(Str::random(6));

        $ficheiro = UploadedFile::fake()->create(
            'planta.pdf',
            100,
            'application/pdf'
        );

        $response = $this->post('/api/pisos', [
            'edificio_id' => $this->edificio->id,
            'nome' => 'Piso com planta inválida',
            'codigo' => $codigo,
            'numero' => 102,
            'planta' => $ficheiro,
        ], [
            'Accept' => 'application/json',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors('planta');

        $this->assertDatabaseMissing('pisos', [
            'edificio_id' => $this->edificio->id,
            'codigo' => $codigo,
        ]);

        $this->assertCount(
            0,
            Storage::disk('public')->files('pisos/plantas')
        );
    }

    public function test_oversized_floor_plan_returns_422(): void
    {
        $codigo = 'PG'.Str::upper(Str::random(6));

        $planta = UploadedFile::fake()
            ->image('planta-grande.png')
            ->size(3000);

        $response = $this->post('/api/pisos', [
            'edificio_id' => $this->edificio->id,
            'nome' => 'Piso com planta grande',
            'codigo' => $codigo,
            'numero' => 103,
            'planta' => $planta,
        ], [
            'Accept' => 'application/json',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors('planta');

        $this->assertDatabaseMissing('pisos', [
            'edificio_id' => $this->edificio->id,
            'codigo' => $codigo,
        ]);

        $this->assertCount(
            0,
            Storage::disk('public')->files('pisos/plantas')
        );
    }

    public function test_php_file_disguised_as_image_is_rejected(): void
    {
        $codigo = 'PS'.Str::upper(Str::random(6));

        // UploadedFile::fake() deriva sempre o MIME reportado a partir
        // da extensão do nome do ficheiro, nunca do conteúdo real —
        // por isso não serve para testar deteção de spoofing. Aqui
        // construímos um UploadedFile real (modo "test") sobre um
        // ficheiro com conteúdo PHP genuíno, para confirmar que a regra
        // "image"/"mimes" do Laravel deteta o conteúdo real via
        // guessExtension() e não confia na extensão .jpg nem no
        // Content-Type que o cliente declarou.
        $caminho = tempnam(sys_get_temp_dir(), 'spoof');
        file_put_contents($caminho, '<?php echo "spoofed"; ?>');

        $ficheiro = new UploadedFile($caminho, 'planta.jpg', 'image/jpeg', null, true);

        $response = $this->post('/api/pisos', [
            'edificio_id' => $this->edificio->id,
            'nome' => 'Piso com ficheiro disfarçado',
            'codigo' => $codigo,
            'numero' => 105,
            'planta' => $ficheiro,
        ], [
            'Accept' => 'application/json',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors('planta');

        $this->assertDatabaseMissing('pisos', [
            'edificio_id' => $this->edificio->id,
            'codigo' => $codigo,
        ]);

        $this->assertCount(
            0,
            Storage::disk('public')->files('pisos/plantas')
        );
    }

    public function test_updating_floor_plan_replaces_previous_file(): void
    {
        $plantaAntiga = UploadedFile::fake()
            ->image('antiga.png')
            ->store('pisos/plantas', 'public');

        $piso = Piso::create([
            'edificio_id' => $this->edificio->id,
            'nome' => 'Piso para atualizar',
            'codigo' => 'PA'.Str::upper(Str::random(6)),
            'numero' => 104,
            'planta' => $plantaAntiga,
            'ativo' => true,
        ]);

        $this->assertTrue(
            Storage::disk('public')->exists($plantaAntiga)
        );

        $novaPlanta = UploadedFile::fake()->image(
            'nova.webp',
            1000,
            700
        );

        $response = $this->call(
            'PUT',
            "/api/pisos/{$piso->id}",
            [],
            [],
            [
                'planta' => $novaPlanta,
            ],
            [
                'HTTP_ACCEPT' => 'application/json',
            ]
        );

        $response->assertOk();

        $piso->refresh();

        $this->assertNotNull($piso->planta);

        $this->assertNotSame(
            $plantaAntiga,
            $piso->planta
        );

        $this->assertTrue(
            Storage::disk('public')->exists($piso->planta)
        );

        $this->assertFalse(
            Storage::disk('public')->exists($plantaAntiga)
        );
    }
}
