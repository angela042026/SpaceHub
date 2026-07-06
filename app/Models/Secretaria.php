<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Secretaria extends Model
{
    protected $table = 'secretarias';
    protected $fillable = [
        'setor_id',
        'codigo',
        'planta_x',
        'planta_y',
        'angulo',
        'monitor',
        'dock_usb',
        'junto_janela',
        'ergonomica',
        'reservavel',
        'ativo',
        'descricao',
    ];

    public function setor()
    {
        return $this->belongsTo(Setor::class);
    }
    public function reservas()
{
    return $this->hasMany(Reserva::class);
}
}
