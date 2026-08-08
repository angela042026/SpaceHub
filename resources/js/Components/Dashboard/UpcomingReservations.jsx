import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Armchair,
    CalendarDays,
    ChevronRight,
} from 'lucide-react';

import { resolverImagemSecretaria } from '@/utils/imagemSetor';

function formatarData(data) {
    if (!data) {
        return '-';
    }

    return new Date(data).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
    });
}

function getEstadoReserva(reserva) {
    const codigo = reserva.estado_reserva?.codigo;

    const estados = {
        pendente: {
            label: 'Pendente',
            badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        confirmada: {
            label: 'Confirmada',
            badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
        },
        cancelada: {
            label: 'Cancelada',
            badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
        },
        expirada: {
            label: 'Expirada',
            badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        },
        concluida: {
            label: 'Concluída',
            badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        },
    };

    return (
        estados[codigo] ?? {
            label: reserva.estado_reserva?.nome ?? 'Sem estado',
            badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
        }
    );
}

export default function UpcomingReservations({ reservas = [] }) {
    const reservasVisiveis = reservas.slice(0, 4);

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <CalendarDays size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Próximas reservas
                        </h2>

                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            Reservas futuras confirmadas
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5 pb-6">
                {reservas.length > 0 ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {reservasVisiveis.map((reserva) => {
                            const estado = getEstadoReserva(reserva);
                            const imagem =
                                resolverImagemSecretaria(
                                    reserva.secretaria,
                                );

                            return (
                                <li key={reserva.id}>
                                    <Link
                                        href={route(
                                            'reservas.index',
                                        )}
                                        className="flex items-center gap-3 py-3"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-navy-900 text-white">
                                            {imagem ? (
                                                <img
                                                    src={imagem}
                                                    alt={
                                                        reserva
                                                            .secretaria
                                                            ?.codigo ??
                                                        'Espaço reservado'
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Armchair
                                                    size={19}
                                                    strokeWidth={
                                                        1.9
                                                    }
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                    {reserva.secretaria?.codigo ??
                                                        'Secretária removida'}
                                                </h3>

                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${estado.badge}`}
                                                >
                                                    {estado.label}
                                                </span>
                                            </div>

                                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                                {reserva.secretaria?.setor?.piso?.nome ??
                                                    '-'}{' '}
                                                ·{' '}
                                                {reserva.secretaria?.setor?.nome ??
                                                    '-'}
                                            </p>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {formatarData(
                                                    reserva.data,
                                                )}
                                            </p>

                                            <p className="text-xs text-slate-400">
                                                {reserva.periodo?.nome ??
                                                    '-'}
                                            </p>
                                        </div>

                                        <ChevronRight
                                            size={18}
                                            strokeWidth={1.9}
                                            className="shrink-0 text-slate-300"
                                        />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-500">
                            <CalendarDays size={30} strokeWidth={1.8} />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                            Sem reservas futuras
                        </h3>

                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Ainda não tens reservas agendadas para os próximos dias.
                        </p>
                    </div>
                )}

                {reservas.length > 0 && (
                    <Link
                        href={route('reservas.index')}
                        className="mt-auto flex items-center justify-center gap-2 rounded-xl border border-teal-500 bg-white py-2.5 text-sm font-bold text-teal-600 transition hover:bg-teal-500 hover:text-white dark:border-teal-400 dark:bg-slate-900 dark:text-teal-400"
                    >
                        Ver todas as reservas
                        <ArrowRight size={15} strokeWidth={1.9} />
                    </Link>
                )}
            </div>
        </section>
    );
}
