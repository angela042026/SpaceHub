<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Edificio extends Model
{
    protected $appends = [
        'imagem_url',
    ];

    protected $fillable = [
        'nome',
        'codigo',
        'morada',
        'codigo_postal',
        'cidade',
        'pais',
        'telefone',
        'email',
        'imagem',
        'hora_abertura',
        'hora_fecho',
        'ativo',
        'descricao',
    ];

    protected function casts(): array
    {
        return [
            'ativo' => 'boolean',
        ];
    }

    public function pisos(): HasMany
    {
        return $this->hasMany(Piso::class);
    }

    /**
     * URL pública da imagem do edifício, gerada a partir do caminho
     * relativo guardado em `imagem` (storage/app/public/...). Mesmo
     * padrão de User::fotografiaUrl().
     */
    protected function imagemUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->imagem ? asset('storage/'.$this->imagem) : null,
        );
    }
}
