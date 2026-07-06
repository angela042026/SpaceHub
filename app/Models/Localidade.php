<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Localidade extends Model
{
    protected $table = 'localidades';

    protected $fillable = [
        'nome',
        'codigo',
    ];
}
