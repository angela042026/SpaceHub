<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Secretaria extends Model
{
    protected $table = 'secretarias';

protected $fillable = [
    'setor_id',
    'codigo',
    'planta_x',
    'planta_y',
    'angulo',
    // Características
    'monitor',
    'dois_monitores',
    'dock_usb',
    'hdmi',
    'ergonomica',
    'junto_janela',
    'luz_natural',
    'zona_silenciosa',
    'proximo_copa',
    // Estado
    'reservavel',
    'ativo',
    // Outros
    'descricao',
    'imagem',
];

    protected function casts(): array
    {
    return [
        'setor_id' => 'integer',
        'planta_x' => 'integer',
        'planta_y' => 'integer',
        'angulo' => 'decimal:2',

        'monitor' => 'boolean',
        'dois_monitores' => 'boolean',
        'dock_usb' => 'boolean',
        'hdmi' => 'boolean',
        'ergonomica' => 'boolean',
        'junto_janela' => 'boolean',
        'luz_natural' => 'boolean',
        'zona_silenciosa' => 'boolean',
        'proximo_copa' => 'boolean',
        
        'reservavel' => 'boolean',
        'ativo' => 'boolean',
    ];
    }

    protected static function booted(): void
    {
        static::creating(function (Secretaria $secretaria): void {
            if (empty($secretaria->qr_token)) {
                $secretaria->qr_token = (string) Str::uuid();
            }
        });
    }

    public function setor(): BelongsTo
    {
        return $this->belongsTo(Setor::class);
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }

    public function checkinUrl(): string
    {
        return route('checkin.scan', $this->qr_token);
    }
}