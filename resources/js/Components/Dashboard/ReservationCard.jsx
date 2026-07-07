export default function ReservationCard() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        A tua reserva de hoje
                    </h2>
                    <p className="text-sm text-slate-500">
                        Informação da reserva ativa.
                    </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Ativa
                </span>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
                <div className="space-y-4 text-sm">
                    <p>
                        <span className="text-slate-400">📍 Localidade</span>
                        <br />
                        <strong>CESAE Braga</strong>
                    </p>

                    <p>
                        <span className="text-slate-400">▤ Piso</span>
                        <br />
                        <strong>2</strong>
                    </p>

                    <p>
                        <span className="text-slate-400">🏢 Setor</span>
                        <br />
                        <strong>Desenvolvimento</strong>
                    </p>

                    <p>
                        <span className="text-slate-400">🪑 Secretária</span>
                        <br />
                        <strong>A-18</strong>
                    </p>

                    <p>
                        <span className="text-slate-400">📅 Período</span>
                        <br />
                        <strong>Manhã (08:30 - 12:30)</strong>
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <div className="flex h-36 w-36 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-6xl">
                        ▦
                    </div>

                    <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-xs text-emerald-700">
                        Faz o check-in até às <strong>08:45</strong>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 px-6 pb-6 md:grid-cols-2">
                <button className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">
                    ⌗ Fazer check-in
                </button>

                <button className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50">
                    🗑 Cancelar reserva
                </button>
            </div>
        </div>
    );
}
