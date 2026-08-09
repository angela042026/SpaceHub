import { Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    CalendarPlus,
    CheckCircle2,
    TimerOff,
    XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { LoadingBadge } from '@/Components/Loading';

const TIPOS = {
    criada: {
        icon: CalendarPlus,
        dot: 'bg-teal-500',
        texto: (utilizador, secretaria) =>
            `${utilizador} reservou a secretária ${secretaria}`,
    },
    checkin: {
        icon: CheckCircle2,
        dot: 'bg-blue-500',
        texto: (utilizador, secretaria) =>
            `${utilizador} fez check-in na secretária ${secretaria}`,
    },
    cancelada: {
        icon: XCircle,
        dot: 'bg-red-500',
        texto: (utilizador, secretaria) =>
            `${utilizador} cancelou a reserva da secretária ${secretaria}`,
    },
    expirada: {
        icon: TimerOff,
        dot: 'bg-amber-500',
        texto: (utilizador, secretaria) =>
            `A reserva de ${utilizador} para a secretária ${secretaria} expirou`,
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
        // Impede que um novo reload arranque enquanto o anterior ainda
        // não terminou — sem isto, pedidos sobrepostos (ex: rede lenta)
        // podiam nunca deixar "atualizando" voltar a false, e o badge
        // ficava permanentemente visível.
        let emCurso = false;

        const intervalo = setInterval(() => {
            if (document.hidden || emCurso) {
                return;
            }

            emCurso = true;

            router.reload({
                only: ['atividadeRecente'],
                preserveScroll: true,
                preserveState: true,
                onStart: () => setAtualizando(true),
                onFinish: () => {
                    setAtualizando(false);
                    emCurso = false;
                },
            });
        }, 20000);

        return () => clearInterval(intervalo);
    }, []);

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-[#2a5069]">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500 dark:bg-[#18c3b3]/15 dark:text-[#18c3b3]">
                    <Activity size={20} strokeWidth={1.9} />
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-[#f8fafc]">
                            Atividade recente
                        </h2>

                        <LoadingBadge
                            show={atualizando}
                            label="A atualizar"
                        />
                    </div>

                    <p className="text-sm text-slate-500 dark:text-[#8fa7bd]">
                        Últimas ações no sistema.
                    </p>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5 pb-6">
                {eventosVisiveis.length > 0 ? (
                    <ul className="divide-y divide-slate-100 dark:divide-[#2a5069]/60">
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
                                    className="flex items-center gap-3 py-2.5"
                                >
                                    <div className="relative shrink-0">
                                        {evento.utilizadorFoto ? (
                                            <img
                                                src={
                                                    evento.utilizadorFoto
                                                }
                                                alt={utilizador}
                                                className="h-9 w-9 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-500 text-sm font-bold text-white">
                                                {utilizador
                                                    ?.charAt(0)
                                                    ?.toUpperCase() ??
                                                    '?'}
                                            </div>
                                        )}

                                        <span
                                            className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-[#163a56] ${config.dot}`}
                                        >
                                            <config.icon
                                                size={9}
                                                strokeWidth={2.6}
                                                className="text-white"
                                            />
                                        </span>
                                    </div>

                                    <p
                                        className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-[#d7e3ed]"
                                        title={config.texto(
                                            utilizador,
                                            secretaria,
                                        )}
                                    >
                                        {config.texto(
                                            utilizador,
                                            secretaria,
                                        )}
                                    </p>

                                    <span className="shrink-0 text-xs text-slate-400 dark:text-[#8fa7bd]">
                                        {tempoRelativo(
                                            evento.timestamp,
                                        )}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center dark:border-[#2a5069] dark:bg-[#101f34]/40">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-[#183f5d] dark:text-[#8fa7bd]">
                            <Activity
                                size={23}
                                strokeWidth={1.8}
                            />
                        </div>

                        <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400 dark:text-[#8fa7bd]">
                            Ainda não existe atividade registada.
                        </p>
                    </div>
                )}

                {eventosVisiveis.length > 0 && (
                    <Link
                        href={route('reservas.history')}
                        className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-teal-500 bg-white py-2.5 text-sm font-bold text-teal-600 transition hover:bg-gradient-to-r hover:from-teal-50 hover:to-teal-100 hover:text-teal-700 dark:border-[#36566f] dark:bg-transparent dark:text-[#d7e3ed] dark:hover:border-[#18c3b3] dark:hover:bg-none dark:hover:bg-[#18c3b3]/[0.06] dark:hover:text-[#18c3b3]"
                    >
                        Ver histórico completo
                        <ArrowRight size={15} strokeWidth={1.9} />
                    </Link>
                )}
            </div>
        </section>
    );
}
