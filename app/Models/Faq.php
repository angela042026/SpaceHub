<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    protected $fillable = [
        'categoria',
        'pergunta',
        'resposta',
        'keywords',
        'ordem',
        'ativo',
    ];
}
