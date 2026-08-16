<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Ponto central de registo do Registo de Atividade — evita duplicar a
 * criação de ActivityLog espalhada por controllers e comandos.
 *
 * Só deve ser chamado depois de a operação principal terminar com
 * sucesso (nunca antes, para não registar ações que acabam por falhar).
 *
 * Para ações automáticas do sistema (comandos agendados), passa-se
 * $ator = null: o registo fica com actor_name "Sistema" e resultado
 * "automatic" por omissão.
 */
class ActivityLogger
{
    public const RESULTADO_SUCESSO = 'success';
    public const RESULTADO_CANCELADA = 'cancelled';
    public const RESULTADO_AUTOMATICO = 'automatic';
    public const RESULTADO_ERRO = 'error';

    /**
     * Fonte única das ações suportadas: categoria (usada para agrupar) e
     * rótulo em português (usado no badge da tabela, no filtro "Todas as
     * ações" e no CSV exportado).
     */
    public const ACOES = [
        'reserva_criada' => ['categoria' => 'reserva', 'label' => 'Reserva criada'],
        'reserva_editada' => ['categoria' => 'reserva', 'label' => 'Reserva editada'],
        'reserva_cancelada' => ['categoria' => 'reserva', 'label' => 'Reserva cancelada'],
        'reserva_concluida' => ['categoria' => 'reserva', 'label' => 'Reserva concluída'],
        'reserva_nao_compareceu' => ['categoria' => 'reserva', 'label' => 'Reserva - não compareceu'],

        'checkin_efetuado' => ['categoria' => 'checkin', 'label' => 'Check-in efetuado'],

        'pagamento_atualizado' => ['categoria' => 'pagamento', 'label' => 'Pagamento atualizado'],

        'utilizador_criado' => ['categoria' => 'utilizador', 'label' => 'Utilizador criado'],
        'utilizador_atualizado' => ['categoria' => 'utilizador', 'label' => 'Utilizador atualizado'],
        'utilizador_ativado' => ['categoria' => 'utilizador', 'label' => 'Utilizador ativado'],
        'utilizador_desativado' => ['categoria' => 'utilizador', 'label' => 'Utilizador desativado'],

        'espaco_criado' => ['categoria' => 'espaco', 'label' => 'Espaço criado'],
        'espaco_atualizado' => ['categoria' => 'espaco', 'label' => 'Espaço atualizado'],
        'espaco_ativado' => ['categoria' => 'espaco', 'label' => 'Espaço ativado'],
        'espaco_desativado' => ['categoria' => 'espaco', 'label' => 'Espaço desativado'],
    ];

    public static function log(
        ?User $ator,
        string $acao,
        string $descricao,
        ?Model $entidade = null,
        ?array $metadata = null,
        ?string $resultado = null
    ): ActivityLog {
        $info = self::ACOES[$acao] ?? null;

        abort_if($info === null, 500, "Ação de atividade desconhecida: {$acao}");

        return ActivityLog::create([
            'actor_id' => $ator?->id,
            'actor_name' => $ator?->name ?? 'Sistema',
            'actor_email' => $ator?->email,
            'category' => $info['categoria'],
            'action' => $acao,
            'description' => $descricao,
            'subject_type' => $entidade?->getMorphClass(),
            'subject_id' => $entidade?->getKey(),
            'metadata' => $metadata,
            // Só faz sentido para ações de um utilizador real — um
            // comando agendado (sem pedido HTTP associado) não tem IP
            // de cliente para registar.
            'ip_address' => $ator !== null ? request()->ip() : null,
            'result' => $resultado ?? ($ator === null ? self::RESULTADO_AUTOMATICO : self::RESULTADO_SUCESSO),
        ]);
    }
}
