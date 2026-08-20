<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    protected $fillable = [
        'categoria',
        'pergunta',
        'resposta',
        'pergunta_en',
        'resposta_en',
        'ordem',
        'ativo',
    ];
}