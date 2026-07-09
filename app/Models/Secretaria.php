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
protected $casts = [
    'planta_x' => 'integer',
    'planta_y' => 'integer',
    'angulo' => 'decimal:2',
    'monitor' => 'boolean',
    'dock_usb' => 'boolean',
    'junto_janela' => 'boolean',
    'ergonomica' => 'boolean',
    'reservavel' => 'boolean',
    'ativo' => 'boolean',
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
