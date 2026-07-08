<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Secretaria extends Model
{
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
     * URL de check-in que o QR Code desta secretária codifica.
     */
    public function checkinUrl(): string
    {
        return route('checkin.scan', $this->qr_token);
    }
}
