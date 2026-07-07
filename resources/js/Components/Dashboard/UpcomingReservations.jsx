export default function UpcomingReservations() {
    const reservas = [
        {
            data: '07 Jul',
            secretaria: 'A-12',
            piso: 'Piso 2',
            periodo: 'Manhã',
        },
        {
            data: '08 Jul',
            secretaria: 'B-05',
            piso: 'Piso 1',
            periodo: 'Tarde',
        },
        {
            data: '10 Jul',
            secretaria: 'C-08',
            piso: 'Piso 0',
            periodo: 'Manhã',
        },
    ];

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                    Próximas Reservas
                </h2>

                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                    Ver todas
                </button>
            </div>

            <div className="space-y-4">
                {reservas.map((reserva, index) => (
                    <div
                        key={index}
                        className="rounded-xl border border-slate-100 p-4 hover:bg-slate-50"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-slate-900">
                                    {reserva.secretaria}
                                </p>

                                <p className="text-sm text-slate-500">
                                    {reserva.piso}
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                                {reserva.periodo}
                            </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-600">
                            📅 {reserva.data}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
