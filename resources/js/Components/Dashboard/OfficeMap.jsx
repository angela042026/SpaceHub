export default function OfficeMap({ pisos, selectedFloor, setSelectedFloor }) {
    const pisoAtual =
        pisos?.find((piso) => piso.codigo === selectedFloor) || pisos?.[0];

    if (!pisoAtual) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">
                    Mapa do Escritório
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Ainda não existem pisos registados.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Mapa do Escritório
                    </h2>

                    <p className="text-sm text-slate-500">
                        Planta atual: {pisoAtual.nome}
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <select className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
                        <option>SpaceHub Braga</option>
                    </select>

                    <select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
                    >
                        {pisos?.map((piso) => (
                            <option key={piso.id} value={piso.codigo}>
                                {piso.nome}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {pisoAtual.planta ? (
                    <img
                        src={pisoAtual.planta}
                        alt={pisoAtual.nome}
                        className="h-[430px] w-full object-contain"
                    />
                ) : (
                    <div className="flex h-[430px] items-center justify-center bg-slate-50 text-sm text-slate-400">
                        Este piso ainda não tem planta associada.
                    </div>
                )}

                {pisoAtual.secretarias
                    ?.filter((secretaria) => secretaria.planta_x !== null && secretaria.planta_y !== null)
                    .map((secretaria) => (
                        <button
                            key={secretaria.id}
                            className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-lg ring-4 transition hover:scale-110 ${
                                secretaria.status === 'ocupada'
                                    ? 'bg-red-500 ring-red-100'
                                    : 'bg-emerald-500 ring-emerald-100'
                            }`}
                            style={{
                                left: `${secretaria.planta_x}%`,
                                top: `${secretaria.planta_y}%`,
                            }}
                            title={`${secretaria.codigo} - ${secretaria.status}`}
                        >
                            {secretaria.codigo.replace(/[A-Z]-/, '')}
                        </button>
                    ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <span>🟢 Livre</span>
                <span>🔴 Ocupada</span>
                <span>
                    Secretárias neste piso: {pisoAtual.secretarias?.length ?? 0}
                </span>
            </div>
        </div>
    );
}
