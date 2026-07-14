<?php

namespace Tests\Feature\Concerns;

use App\Models\EstadoReserva;
use App\Models\Periodo;
use App\Models\Role;
use App\Models\Secretaria;
use App\Models\User;

trait CriaEstruturaEspacial
{
    protected function criarRole(string $nome): Role
    {
        return Role::firstOrCreate(['nome' => $nome], ['descricao' => $nome]);
    }

    protected function criarUsuarioComRole(string $nomeRole): User
    {
        return User::factory()->create([
            'role_id' => $this->criarRole($nomeRole)->id,
        ]);
    }

    protected function criarSecretaria(): Secretaria
    {
        $edificio = \App\Models\Edificio::create([
            'nome' => 'Edifício Central',
            'codigo' => 'ED-'.uniqid(),
            'morada' => 'Rua Principal, 1',
            'cidade' => 'Lisboa',
        ]);

        $piso = $edificio->pisos()->create([
            'nome' => 'Piso 1',
            'codigo' => 'P1',
            'numero' => 1,
        ]);

        $setor = $piso->setores()->create([
            'nome' => 'Setor A',
            'codigo' => 'A',
            'tipo' => 'coworking',
            'reservavel' => true,
        ]);

        return $setor->secretarias()->create([
            'codigo' => 'SEC-'.uniqid(),
            'reservavel' => true,
            'ativo' => true,
        ]);
    }

    protected function criarPeriodo(string $horaInicio = '08:00:00', string $horaFim = '13:00:00'): Periodo
    {
        return Periodo::create([
            'nome' => 'Manhã',
            'hora_inicio' => $horaInicio,
            'hora_fim' => $horaFim,
            'ativo' => true,
        ]);
    }

    protected function criarEstadoReserva(string $codigo): EstadoReserva
    {
        return EstadoReserva::firstOrCreate(
            ['codigo' => $codigo],
            ['nome' => ucfirst($codigo)]
        );
    }
}
