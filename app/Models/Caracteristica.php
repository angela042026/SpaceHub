<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Secretaria;

class Caracteristica extends Model
{
    protected $fillable = [
        'nome',
    ];

    /**
     * Secretárias que possuem esta característica.
     */
    public function secretarias()
    {
        return $this->belongsToMany(
            Secretaria::class,
            'caracteristica_secretaria'
        );
    }
}