<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setor extends Model
{
    protected $table = 'setores';
    
    protected $fillable = [
        'piso_id',
        'nome',
        'codigo',
        'planta_x',
        'planta_y',
        'tipo',
        'reservavel',
        'capacidade',
        'descricao',
        'ativo',
    ];

    /**
     * Um setor pertence a um piso.
     */
    public function piso()
    {
        return $this->belongsTo(Piso::class);
    }

    /**
     * Um setor possui várias secretárias.
     */
    public function secretarias()
    {
        return $this->hasMany(Secretaria::class);
    }
}
