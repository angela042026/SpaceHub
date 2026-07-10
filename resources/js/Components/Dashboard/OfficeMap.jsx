const ESTADOS = {
    livre: {
        cor: 'bg-status-livre',
        label: 'Livre',
    },
    reservada: {
        cor: 'bg-status-reservada',
        label: 'Parcialmente ocupada',
    },
    ocupada: {
        cor: 'bg-status-ocupada',
        label: 'Ocupada',
    },
    indisponivel: {
        cor: 'bg-status-indisponivel',
        label: 'Sem secretárias',
    },
};

export default function OfficeMap({
    pisos,
    selectedFloor,
    setSelectedFloor,
}) {
    const pisoAtual =
        pisos?.find((piso) => piso.codigo === selectedFloor)
        || pisos?.[0];

    if (!pisoAtual) {
        return (
            <div className="dashboard-card p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Mapa do Escritório
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Ainda não existem pisos registados.
                </p>
            </div>
        );
    }

    const setoresComPosicao =
        pisoAtual.setores?.filter(
            (setor) =>
                setor.planta_x !== null
                && setor.planta_y !== null
        ) ?? [];

    return (
        <div className="dashboard-card p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        Mapa do Escritório
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Planta atual: {pisoAtual.nome}
                    </p>
                </div>

                <select
                    value={selectedFloor}
                    onChange={(event) =>
                        setSelectedFloor(event.target.value)
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                    {pisos?.map((piso) => (
                        <option
                            key={piso.id}
                            value={piso.codigo}
                        >
                            {piso.nome}
                        </option>
                    ))}
                </select>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800">
                {pisoAtual.planta ? (
                    <img
                        src={pisoAtual.planta}
                        alt={pisoAtual.nome}
                        className="h-[430px] w-full object-contain"
                    />
                ) : (
                    <div className="flex h-[430px] items-center justify-center bg-slate-50 text-sm text-slate-400 dark:bg-slate-800">
                        Este piso ainda não tem planta associada.
                    </div>
                )}

                {setoresComPosicao.map((setor) => {
                    const estado =
                        ESTADOS[setor.status]
                        ?? ESTADOS.indisponivel;

                    return (
                        <div
                            key={setor.id}
                            className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg ring-4 ring-white/80 dark:ring-slate-900/60 ${estado.cor}`}
                            style={{
                                left: `${setor.planta_x}%`,
                                top: `${setor.planta_y}%`,
                            }}
                            title={`${setor.nome}: ${estado.label}`}
                        >
                            {setor.numero}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {pisoAtual.setores?.map((setor) => {
                    const estado =
                        ESTADOS[setor.status]
                        ?? ESTADOS.indisponivel;

                    return (
                        <div
                            key={setor.id}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-300"
                        >
                            <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${estado.cor}`}
                            >
                                {setor.numero}
                            </span>

                            <span className="truncate">
                                {setor.nome}

                                {setor.totalSecretarias > 0 && (
                                    <span className="text-slate-400 dark:text-slate-500">
                                        {' '}
                                        · {setor.livres}/{setor.totalSecretarias} livres
                                    </span>
                                )}
                            </span>
                        </div>
                    );
                })}
            </div>

            <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                Total de secretárias neste piso:{' '}
                {pisoAtual.totalSecretarias ?? 0}
            </p>
        </div>
    );
}