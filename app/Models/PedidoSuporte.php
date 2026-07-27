<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PedidoSuporte extends Model
{
    /** Permite gravar estes campos: */
    protected $fillable = [
        'user_id',
        'assunto',
        'mensagem',
        'resposta',
        'estado',
    ];

    /** Belongs: Cada pedido pertence a um utilizador. */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
