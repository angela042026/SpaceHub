<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Edificio extends Model
{
    protected $fillable = [

    ];

    public function pisos()
    {
        return $this->hasMany(Piso::class);
    }
}