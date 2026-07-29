import { router } from '@inertiajs/react';
import {
    Activity,
    CalendarPlus,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { LoadingBadge } from '@/Components/Loading';

const TIPOS = {
    criada: {
        icon: CalendarPlus,
        className: 'bg-teal-500/10 text-teal-500',
        texto: (utilizador, secretaria) =>
            `${utilizador} reservou a secretária ${secretaria}`,
    },
    checkin: {
        icon: CheckCircle2,
        className: 'bg-blue-500/10 text-blue-500',
        texto: (utilizador, secretaria) =>
            `${utilizador} fez check-in na secretária ${secretaria}`,
    },
    cancelada: {
        icon: XCircle,
        className: 'bg-red-500/10 text-red-500',
        texto: (utilizador, secretaria) =>
            `${utilizador} cancelou a reserva da secretária ${secretaria}`,
    },
};

function tempoRelativo(timestamp) {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const minutos = Math.max(0, Math.round(diffMs / 60000));

    if (minutos < 1) {
        return 'agora mesmo';
    }

    if (minutos < 60) {
        return `há ${minutos} min`;
    }

    const horas = Math.round(minutos / 60);

    if (horas < 24) {
        return `há ${horas} h`;
    }

    const dias = Math.round(horas / 24);

    return `há ${dias} dia${dias === 1 ? '' : 's'}`;
}

export default function RecentActivity({ eventos = [] }) {
    const [atualizando, setAtualizando] = useState(false);

    const eventosVisiveis = eventos.slice(0, 5);

    useEffect(() => {
        const intervalo = setInterval(() => {
            if (document.hidden) {
                return;
            }

            router.reload({
                only: ['atividadeRecente'],
                preserveScroll: true,
                preserveState: true,
                onStart: () => setAtualizando(true),
                onFinish: () => setAtualizando(false),
            });
        }, 20000);

        return () => clearInterval(intervalo);
    }, []);

    return (
        <section className="dashboard-card h-full overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                    <Activity size={20} strokeWidth={1.9} />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Atividade Recente
                        </h2>

                        <LoadingBadge
                            show={atualizando}
                            label="A atualizar"
                        />
                    </div>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Últimas ações no sistema.
                    </p>
                </div>
            </div>

            <div className="p-5">
                {eventosVisiveis.length > 0 ? (
                    <ul className="space-y-2.5">
                        {eventosVisiveis.map((evento) => {
                            const config =
                                TIPOS[evento.tipo] ??
                                TIPOS.criada;

                            const utilizador =
                                evento.utilizador ??
                                'Utilizador removido';

                            const secretaria =
                                evento.secretaria ??
                                'secretária removida';

                            return (
                                <li
                                    key={evento.id}
                                    className="flex items-start gap-3 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-slate-800/60"
                                >
                                    <div
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.className}`}
                                    >
                                        <config.icon
                                            size={15}
                                            strokeWidth={1.9}
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm text-slate-700 dark:text-slate-200">
                                            {config.texto(
                                                utilizador,
                                                secretaria,
                                            )}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {tempoRelativo(
                                                evento.timestamp,
                                            )}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                            <Activity
                                size={23}
                                strokeWidth={1.8}
                            />
                        </div>

                        <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
                            Ainda não existe atividade registada.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
