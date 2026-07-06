<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $fillable = [
        'nome',
        'descricao',
    ];

    /**
     * Um Role pode estar associado a vários utilizadores.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

}
