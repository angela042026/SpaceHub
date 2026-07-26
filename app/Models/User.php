<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'google_id',
        'password',
        'role_id',
        'ativo',
        'fotografia',
    ];

    protected $appends = [
        'fotografia_url',
    ];

    /**
     * Espelha o DEFAULT true da coluna "ativo" na instância em memória,
     * para que uma nova instância criada sem indicar "ativo" explicitamente
     * (ex.: User::factory()->create()) já reflita o valor correto sem
     * precisar de um refresh() após o INSERT.
     */
    protected $attributes = [
        'ativo' => true,
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'ativo' => 'boolean',
            'role_id' => 'integer',
        ];
    }

    protected function fotografiaUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->fotografia ? asset('storage/' . $this->fotografia) : null,
        );
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function reservas(): HasMany
    {
        return $this->hasMany(Reserva::class);
    }
}