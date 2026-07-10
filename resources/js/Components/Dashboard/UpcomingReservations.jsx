function formatarData(data) {
    if (!data) {
        return '-';
    }

    return new Date(data).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
    });
}

export default function UpcomingReservations({ reservas = [] }) {
    return (
        <div className="dashboard-card">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Próximas Reservas
                </h2>
            </div>

            <div className="space-y-4">
                {reservas.length > 0 ? (
                    reservas.map((reserva) => (
                        <div
                            key={reserva.id}
                            className="rounded-xl border border-slate-100 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {reserva.secretaria?.codigo ?? 'Secretária removida'}
                                    </p>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {reserva.secretaria?.setor?.piso?.nome}
                                    </p>
                                </div>

                                <span className="badge-status bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400">
                                    {reserva.periodo?.nome}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                📅 {formatarData(reserva.data)}
                            </p>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-slate-400">
                        Ainda não tens reservas futuras.
                    </p>
                )}
            </div>
        </div>
    );
}
