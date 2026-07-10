import {
    Armchair,
    CalendarDays,
    ChevronRight,
    Clock3,
    Layers3,
    MapPinned,
} from 'lucide-react';

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
            dot: 'bg-amber-500',
        },
        confirmada: {
            label: 'Confirmada',
            badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
            dot: 'bg-teal-500',
        },
        cancelada: {
            label: 'Cancelada',
            badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
            dot: 'bg-red-500',
        },
        expirada: {
            label: 'Expirada',
            badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
            dot: 'bg-slate-400',
        },
        concluida: {
            label: 'Concluída',
            badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
            dot: 'bg-blue-500',
        },
    };

    return (
        estados[codigo] ?? {
            label: reserva.estado_reserva?.nome ?? 'Sem estado',
            badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
            dot: 'bg-slate-400',
        }
    );
}

export default function UpcomingReservations({ reservas = [] }) {
    return (
        <section className="dashboard-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <CalendarDays size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Próximas Reservas
                        </h2>

                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            Reservas futuras já confirmadas.
                        </p>
                    </div>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {reservas.length}
                </span>
            </div>

            <div className="p-6">
                {reservas.length > 0 ? (
                    <div className="space-y-3">
                        {reservas.map((reserva) => {
                            const estado = getEstadoReserva(reserva);

                            return (
                                <article
                                    key={reserva.id}
                                    className="group rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500/20 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-900"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-sm">
                                                <Armchair size={21} strokeWidth={1.9} />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                        {reserva.secretaria?.codigo ??
                                                            'Secretária removida'}
                                                    </h3>

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${estado.badge}`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${estado.dot}`}
                                                        />

                                                        {estado.label}
                                                    </span>
                                                </div>

                                                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1.5">
                                                        <Layers3
                                                            size={14}
                                                            strokeWidth={1.9}
                                                            className="text-teal-500"
                                                        />

                                                        {reserva.secretaria?.setor?.piso?.nome ??
                                                            '-'}
                                                    </span>

                                                    <span className="flex items-center gap-1.5">
                                                        <MapPinned
                                                            size={14}
                                                            strokeWidth={1.9}
                                                            className="text-teal-500"
                                                        />

                                                        {reserva.secretaria?.setor?.nome ??
                                                            '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <ChevronRight
                                            size={19}
                                            strokeWidth={1.9}
                                            className="mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-500"
                                        />
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-white px-3 py-2.5 dark:bg-slate-900">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Data
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                                <CalendarDays
                                                    size={15}
                                                    strokeWidth={1.9}
                                                    className="text-teal-500"
                                                />

                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {formatarData(reserva.data)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-white px-3 py-2.5 dark:bg-slate-900">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Período
                                            </p>

                                            <div className="mt-1 flex items-center gap-2">
                                                <Clock3
                                                    size={15}
                                                    strokeWidth={1.9}
                                                    className="text-teal-500"
                                                />

                                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {reserva.periodo?.nome ?? '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
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
            </div>
        </section>
    );
}
