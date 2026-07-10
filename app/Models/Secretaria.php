<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Secretaria extends Model
{
    protected $table = 'secretarias';

    protected $fillable = [
        'setor_id',
        'codigo',
        'qr_token',
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

    protected static function booted(): void
    {
        static::creating(function (Secretaria $secretaria) {
            if (empty($secretaria->qr_token)) {
                $secretaria->qr_token = (string) Str::uuid();
            }
        });
    }

    public function setor()
    {
        return $this->belongsTo(Setor::class);
    }

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }

    /**
     * URL de check-in codificada no QR Code desta secretária.
     */
    public function checkinUrl(): string
    {
        return route('checkin.scan', $this->qr_token);
    }
}