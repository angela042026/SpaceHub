<?php

namespace App\Models;

use App\Enums\RoleName;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'google_id',
        'password',
        'role_id',
        'ativo',
        'fotografia',
        'email_verified_at',
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
            'deleted_at' => 'datetime',
            'password' => 'hashed',
            'ativo' => 'boolean',
            'role_id' => 'integer',
        ];
    }

    /**
     * "fotografia" guarda ou um caminho relativo do disco "public" (upload
     * feito pelo próprio utilizador) ou já uma URL completa (ex.: avatar
     * de demonstração gerado externamente) — devolve como está nesse
     * segundo caso, em vez de a tratar sempre como caminho local.
     */
    protected function fotografiaUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => match (true) {
                blank($this->fotografia) => null,
                str_starts_with($this->fotografia, 'http://'),
                str_starts_with($this->fotografia, 'https://') => $this->fotografia,
                default => asset('storage/' . $this->fotografia),
            },
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

    /**
     * Único sítio que compara o nome do papel guardado na BD com o
     * enum — Policies e Middleware passam a chamar isto (ou os atalhos
     * abaixo) em vez de repetir `$user->role?->nome === 'Administrador'`.
     */
    public function hasRole(RoleName $role): bool
    {
        return $this->role?->nome === $role->value;
    }

    public function isAdministrador(): bool
    {
        return $this->hasRole(RoleName::Administrador);
    }

    public function isGestor(): bool
    {
        return $this->hasRole(RoleName::Gestor);
    }
}