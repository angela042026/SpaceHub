<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Setor extends Model
{
    protected $table = 'setores';

    protected $fillable = [
        'piso_id',
        'nome',
        'nome_en',
        'codigo',
        'tipo',
        'reservavel',
        'capacidade',
        'preco_meio_dia',
        'preco_dia_inteiro',
        'preco_semanal',
        'preco_mensal',
        'preco_anual',
        'descricao',
        'ativo',
        'planta_x',
        'planta_y',
    ];

    protected function casts(): array
    {
        return [
            'piso_id' => 'integer',
            'capacidade' => 'integer',

            'preco_meio_dia' => 'decimal:2',
            'preco_dia_inteiro' => 'decimal:2',
            'preco_semanal' => 'decimal:2',
            'preco_mensal' => 'decimal:2',
            'preco_anual' => 'decimal:2',

            'reservavel' => 'boolean',
            'ativo' => 'boolean',

            'planta_x' => 'integer',
            'planta_y' => 'integer',

            /*
             * Colunas calculadas pelo ReservaDisponibilidadeService, só
             * presentes quando esse serviço as pede. Sem os casts, o
             * MySQL devolve-as como string e o SQLite como número.
             */
            'avaliacao_total' => 'integer',
            'avaliacao_media' => 'float',
        ];
    }

    /**
     * Nome a apresentar no idioma ativo — cai em `nome` (PT) sempre que
     * `nome_en` não estiver preenchido, tal como Faq::pergunta/resposta.
     * Ao contrário dessas colunas, aqui é um accessor (não resolvido só
     * num controller) porque o nome do setor é lido a partir de dezenas
     * de sítios diferentes (dashboard, relatórios, mapa, reservas...).
     */
    protected function nomeLocalizado(): Attribute
    {
        return Attribute::make(
            get: fn () => app()->getLocale() === 'en' && $this->nome_en
                ? $this->nome_en
                : $this->nome,
        );
    }

    public function piso(): BelongsTo
    {
        return $this->belongsTo(Piso::class);
    }

    public function secretarias(): HasMany
    {
        return $this->hasMany(Secretaria::class);
    }
}