<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Avaliacao extends Model
{
    /**
     * O Eloquent pluraliza "avaliacao" para "avaliacaos" (regra em inglês),
     * mas a tabela chama-se "avaliacoes" — não há forma de adivinhar o
     * plural em português automaticamente.
     */
    protected $table = 'avaliacoes';

    protected $fillable = [
        'reserva_id',
        'nota',
        'comentario',
        'estado',
    ];

    protected function casts(): array
    {
        return [
            'reserva_id' => 'integer',
            'nota' => 'integer',
        ];
    }

    public function reserva(): BelongsTo
    {
        return $this->belongsTo(Reserva::class);
    }
}
