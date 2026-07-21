<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = [
        'nome',
        'descricao',
    ];

    /**
     * Um Role pode estar associado a vários utilizadores.
     */
   public function users(): HasMany
{
    return $this->hasMany(User::class);
}

}
