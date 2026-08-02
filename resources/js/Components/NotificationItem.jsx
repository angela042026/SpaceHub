import React, { useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { Trash2, Bell } from 'lucide-react';

export default function NotificationItem({
    notificacao,
    isNova,
    onVisible,
    onNotificationClick,
    onDelete,
}) {
    const itemRef = useRef(null);

    // Formatação de data/hora: <24h mostra HH:mm | >=24h mostra ex: 29 Jul
    const formatarData = (dataString) => {
        if (!dataString) return '';
        const dataNotif = new Date(dataString);
        const agora = new Date();
        const diferencaHoras = (agora - dataNotif) / (1000 * 60 * 60);

        if (diferencaHoras < 24) {
            return dataNotif.toLocaleTimeString('pt-PT', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }

        const dia = dataNotif.getDate().toString().padStart(2, '0');
        const mesAbrev = dataNotif.toLocaleDateString('pt-PT', { month: 'short' });
        const mesFormatado =
            mesAbrev.replace('.', '').charAt(0).toUpperCase() + mesAbrev.slice(1);

        return `${dia} ${mesFormatado}`;
    };

    // Observer para marcar como vista quando entra no viewport
    useEffect(() => {
        if (!isNova || !onVisible) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        onVisible(notificacao.id, notificacao.realId);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.6 }
        );

        if (itemRef.current) {
            observer.observe(itemRef.current);
        }

        return () => observer.disconnect();
    }, [isNova, notificacao.id, notificacao.realId, onVisible]);

    const handleClick = () => {
        if (onNotificationClick) {
            onNotificationClick();
        }

        // Marcar como lida na BD
        if (!notificacao.lida) {
            if (notificacao.isLaravelNotif) {
                axios.post(`/notificacoes/${notificacao.id}/marcar-lida`).catch(() => { });
            }
        }

        // Encaminhamento de Rotas
        const tipo = notificacao.tipo || notificacao.data?.tipo;
        const classeLaravel = notificacao.type || notificacao.data?.type || '';
        const jsonString = JSON.stringify(notificacao).toLowerCase();

        const ehCheckIn =
            ['checkin_disponivel', 'checkin_confirmado', 'checkin'].includes(tipo) ||
            classeLaravel.includes('CheckIn') ||
            jsonString.includes('check-in') ||
            jsonString.includes('checkin');

        const ehPagamento =
            ['pagamento', 'pagamento_confirmado', 'pagamento_pendente'].includes(tipo) ||
            classeLaravel.includes('Pagamento') ||
            jsonString.includes('pagamento');

        const ehReserva =
            ['reserva_criada', 'reserva_cancelada', 'reserva_expirada'].includes(tipo) ||
            classeLaravel.includes('Reserva') ||
            jsonString.includes('reserva');

        if (ehCheckIn) {
            router.visit(route('checkin.camera'));
        } else if (ehPagamento) {
            router.visit(route('pagamentos.index'));
        } else if (ehReserva) {
            router.visit(route('reservas.index'));
        } else if (notificacao.action_url || notificacao.data?.action_url) {
            router.visit(notificacao.action_url || notificacao.data.action_url);
        } else {
            router.visit(route('reservas.index'));
        }
    };

    const handleEliminar = (e) => {
        e.stopPropagation(); // Impede o clique no card ao apagar
        if (onDelete) {
            onDelete(notificacao.id);
        }
    };

    const Icone = notificacao.icon || Bell;
    const dataCriacao = notificacao.created_at || notificacao.created_at_laravel || notificacao.data?.created_at || new Date().toISOString();
    const tituloText = notificacao.titulo || notificacao.data?.titulo || 'Notificação';
    const mensagemText = notificacao.mensagem || notificacao.data?.mensagem || '';

    return (
        <div
            ref={itemRef}
            onClick={handleClick}
            className={`group relative flex items-start gap-3 rounded-xl p-3 cursor-pointer transition-colors ${isNova
                ? 'bg-teal-500/10 hover:bg-teal-500/15 dark:bg-teal-500/15 dark:hover:bg-teal-500/20'
                : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/50'
                }`}
        >
            {/* Ícone com o destaque do teu design original */}
            <Icone
                size={18}
                strokeWidth={1.9}
                className="mt-0.5 shrink-0 text-teal-500 transition-transform group-hover:scale-110"
            />

            {/* Conteúdo da Notificação */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 pr-6">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {tituloText}
                    </p>
                    {isNova && (
                        <span className="shrink-0 rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            Nova
                        </span>
                    )}
                </div>

                {mensagemText && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 pr-12 line-clamp-1">
                        {mensagemText}
                    </p>
                )}
            </div>

            {/* Botão Eliminar (Lata do lixo no canto superior direito) */}
            <button
                type="button"
                onClick={handleEliminar}
                title="Eliminar notificação"
                className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
                <Trash2 size={14} strokeWidth={2} />
            </button>

            {/* Tag de Data/Hora (Aparece na mesma linha da mensagem, à direita) */}
            {dataCriacao && (
                <span className="absolute bottom-2 right-2.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">
                    {formatarData(dataCriacao)}
                </span>
            )}
        </div>
    );
}
