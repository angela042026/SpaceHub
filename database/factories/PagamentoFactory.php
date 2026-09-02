<?php

namespace Database\Factories;

use App\Models\Pagamento;
use App\Models\Reserva;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Pagamento>
 */
class PagamentoFactory extends Factory
{
    protected $model = Pagamento::class;

    public function definition(): array
    {
        $estado = fake()->randomElement([
            'pendente',
            'pago',
            'recusado',
        ]);

        return [
            'reserva_id' => Reserva::factory(),

            'valor' => fake()->randomFloat(
                2,
                5,
                100
            ),

            'metodo_pagamento' => fake()->randomElement([
                'cartao',
                'mbway',
                'transferencia',
            ]),

            'estado' => $estado,

            'referencia' => sprintf(
                'PAG-%s-%s',
                now()->format('Ymd'),
                Str::upper(Str::random(8))
            ),

            'data_pagamento' => $estado === 'pago'
                ? now()
                : null,

            'observacoes' => null,
        ];
    }

    public function pendente(): static
    {
        return $this->state(fn (): array => [
            'estado' => 'pendente',
            'data_pagamento' => null,
        ]);
    }

    public function pago(): static
    {
        return $this->state(fn (): array => [
            'estado' => 'pago',
            'data_pagamento' => now(),
        ]);
    }

    public function recusado(): static
    {
        return $this->state(fn (): array => [
            'estado' => 'recusado',
            'data_pagamento' => null,
        ]);
    }
}
