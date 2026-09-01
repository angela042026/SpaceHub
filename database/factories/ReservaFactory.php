<?php

namespace Database\Factories;

use App\Models\Edificio;
use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Reserva;
use App\Models\Secretaria;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reserva>
 *
 * Ficheiro estava vazio (0 bytes) — PagamentoFactory::reserva_id
 * dependia de Reserva::factory(), que falhava com erro fatal.
 *
 * Reserva diária de "Dia inteiro" por omissão, num único dia futuro.
 * Reutiliza a hierarquia física (edifício/piso/setor/secretária) já
 * existente na base de dados de teste em vez de criar uma nova a cada
 * invocação — só cria uma mínima se ainda não existir nenhuma.
 */
class ReservaFactory extends Factory
{
    protected $model = Reserva::class;

    public function definition(): array
    {
        $secretaria = $this->secretariaPadrao();
        $periodo = $this->periodoPadrao();
        $data = now()->addDay()->startOfDay();

        while (Reserva::query()
            ->where('secretaria_id', $secretaria->id)
            ->where('periodo_id', $periodo->id)
            ->whereDate('data', $data)
            ->whereNull('cancelada_at')
            ->exists()) {
            $data->addDay();
        }

        $data = $data->format('Y-m-d');

        return [
            'user_id' => User::factory(),
            'secretaria_id' => $secretaria->id,
            'periodo_id' => $periodo->id,
            'estado_reserva_id' => $this->estadoPadrao()->id,
            'data' => $data,
            'tipo_duracao' => 'diaria',
            'data_fim' => $data,
            'check_in_at' => null,
            'cancelada_at' => null,
            'observacoes' => null,
        ];
    }

    public function comCheckIn(): static
    {
        return $this->state(fn (): array => [
            'check_in_at' => now(),
        ]);
    }

    public function cancelada(): static
    {
        return $this->state(fn (): array => [
            'cancelada_at' => now(),
        ]);
    }

    private function secretariaPadrao(): Secretaria
    {
        $existente = Secretaria::where('reservavel', true)
            ->where('ativo', true)
            ->first();

        if ($existente) {
            return $existente;
        }

        $edificio = Edificio::create([
            'nome' => 'Edifício Demo',
            'codigo' => 'ED-FACTORY',
            'morada' => 'Rua Demo, 1',
            'cidade' => 'Lisboa',
        ]);

        $piso = $edificio->pisos()->create([
            'nome' => 'Piso 1',
            'codigo' => 'P1',
            'numero' => 1,
        ]);

        $setor = $piso->setores()->create([
            'nome' => 'Setor Demo',
            'codigo' => 'SETOR-FACTORY',
            'tipo' => 'coworking',
            'reservavel' => true,
            'preco_meio_dia' => 8.00,
            'preco_dia_inteiro' => 14.00,
        ]);

        return $setor->secretarias()->create([
            'codigo' => 'SEC-FACTORY',
            'reservavel' => true,
            'ativo' => true,
        ]);
    }

    private function periodoPadrao(): Periodo
    {
        return Periodo::firstOrCreate(
            ['nome' => 'Dia inteiro'],
            [
                'hora_inicio' => '08:00:00',
                'hora_fim' => '18:00:00',
                'ativo' => true,
            ]
        );
    }

    private function estadoPadrao(): EstadoReserva
    {
        return EstadoReserva::firstOrCreate(
            ['codigo' => 'pendente'],
            ['nome' => 'Pendente']
        );
    }
}
