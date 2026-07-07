export default function ReservationTodayCard() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">
                        Reserva de Hoje
                    </h2>

                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Confirmada
                    </span>
                </div>
            </div>

            <div className="space-y-4 p-6">
                <div>
                    <p className="text-xs uppercase text-slate-400">Localidade</p>
                    <p className="font-semibold">SpaceHub Braga</p>
                </div>

                <div>
                    <p className="text-xs uppercase text-slate-400">Piso</p>
                    <p className="font-semibold">Piso 2</p>
                </div>

                <div>
                    <p className="text-xs uppercase text-slate-400">Setor</p>
                    <p className="font-semibold">Open Space</p>
                </div>

                <div>
                    <p className="text-xs uppercase text-slate-400">Secretária</p>
                    <p className="font-semibold">A-18</p>
                </div>

                <div>
                    <p className="text-xs uppercase text-slate-400">Período</p>
                    <p className="font-semibold">08:30 - 12:30</p>
                </div>

                <button className="mt-4 w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700">
                    Fazer Check-in
                </button>
            </div>
        </div>
    );
}
