import { useEffect, useState } from 'react';

import {
    Armchair,
    Building2,
    ChevronDown,
    Layers3,
    MapPinned,
} from 'lucide-react';

const ESTADOS = {
    livre: {
        marker: 'bg-status-livre',
        soft: 'bg-teal-500/10',
        text: 'text-teal-600 dark:text-teal-400',
        label: 'Livre',
    },

    reservada: {
        marker: 'bg-status-reservada',
        soft: 'bg-blue-500/10',
        text: 'text-blue-600 dark:text-blue-400',
        label: 'Parcialmente ocupada',
    },

    ocupada: {
        marker: 'bg-status-ocupada',
        soft: 'bg-red-500/10',
        text: 'text-red-600 dark:text-red-400',
        label: 'Ocupada',
    },

    indisponivel: {
        marker: 'bg-status-indisponivel',
        soft: 'bg-slate-500/10',
        text: 'text-slate-500 dark:text-slate-400',
        label: 'Sem secretárias',
    },
};

function getEstado(status) {
    return ESTADOS[status] ?? ESTADOS.indisponivel;
}

export default function OfficeMap({
    pisos,
    selectedFloor,
    setSelectedFloor,
}) {
    const [selectedSector, setSelectedSector] = useState(null);

    const pisoAtual =
        pisos?.find((piso) => piso.codigo === selectedFloor) ??
        pisos?.[0];

    useEffect(() => {
        setSelectedSector(null);
    }, [selectedFloor]);

    if (!pisoAtual) {
        return (
            <section className="dashboard-card mx-auto w-full max-w-5xl p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                        <MapPinned size={21} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Mapa do Escritório
                        </h2>

                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                            Ainda não existem pisos registados.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    const setores = pisoAtual.setores ?? [];

    const setoresComPosicao = setores.filter((setor) => {
        const hasX =
            setor.planta_x !== null &&
            setor.planta_x !== undefined;

        const hasY =
            setor.planta_y !== null &&
            setor.planta_y !== undefined;

        return hasX && hasY;
    });

    const totalSecretarias = pisoAtual.totalSecretarias ?? 0;

    const totalLivres = setores.reduce(
        (total, setor) => total + (setor.livres ?? 0),
        0,
    );

    function handleSectorClick(setor) {
        setSelectedSector(setor);
    }

    return (
        <section className="dashboard-card mx-auto w-full max-w-5xl overflow-hidden">
            {/* Cabeçalho compacto */}
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                        <MapPinned size={21} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Mapa do Escritório
                        </h2>

                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <Building2 size={13} strokeWidth={1.9} />
                                SpaceHub
                            </span>

                            <span className="text-slate-300 dark:text-slate-700">
                                •
                            </span>

                            <span className="flex items-center gap-1">
                                <Layers3 size={13} strokeWidth={1.9} />
                                {pisoAtual.nome}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative w-full sm:w-[200px]">
                    <Layers3
                        size={16}
                        strokeWidth={1.9}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-teal-500"
                    />

                    <select
                        value={selectedFloor}
                        onChange={(event) =>
                            setSelectedFloor(event.target.value)
                        }
                        aria-label="Selecionar piso"
                        className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
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

                    <ChevronDown
                        size={16}
                        strokeWidth={1.9}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                </div>
            </div>

            {/* Resumo compacto */}
            <div className="grid grid-cols-2 gap-2 px-4 pt-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Secretárias
                    </p>

                    <div className="mt-0.5 flex items-center gap-2">
                        <Armchair
                            size={15}
                            strokeWidth={1.9}
                            className="text-teal-500"
                        />

                        <strong className="text-lg text-slate-900 dark:text-white">
                            {totalSecretarias}
                        </strong>
                    </div>
                </div>

                <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Livres
                    </p>

                    <div className="mt-0.5 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-status-livre" />

                        <strong className="text-lg text-slate-900 dark:text-white">
                            {totalLivres}
                        </strong>
                    </div>
                </div>

                <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60 sm:col-span-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Setores
                    </p>

                    <strong className="mt-0.5 block text-lg text-slate-900 dark:text-white">
                        {setores.length}
                    </strong>
                </div>
            </div>

            {/* Planta compacta */}
            <div className="px-4 py-3">
                <div className="relative mx-auto w-fit max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-inner dark:border-slate-800 dark:bg-slate-900">
                    {pisoAtual.planta ? (
                        <img
                            src={pisoAtual.planta}
                            alt={`Planta do ${pisoAtual.nome}`}
                            className="mx-auto max-h-[430px] w-auto max-w-full object-contain"
                        />
                    ) : (
                        <div className="flex h-[320px] w-[680px] max-w-full flex-col items-center justify-center gap-3 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200/60 text-slate-400 dark:bg-slate-800">
                                <MapPinned
                                    size={23}
                                    strokeWidth={1.8}
                                />
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                    Planta não disponível
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Este piso ainda não tem uma planta associada.
                                </p>
                            </div>
                        </div>
                    )}

                    {setoresComPosicao.map((setor) => {
                        const estado = getEstado(setor.status);
                        const isSelected =
                            selectedSector?.id === setor.id;

                        let markerStateClass =
                            'ring-white/90 dark:ring-slate-950/80';

                        if (isSelected) {
                            markerStateClass =
                                'z-20 scale-125 ring-teal-300/70';
                        }

                        return (
                            <button
                                key={setor.id}
                                type="button"
                                onClick={() =>
                                    handleSectorClick(setor)
                                }
                                aria-label={`Ver detalhes do setor ${setor.nome}`}
                                title={setor.nome}
                                className={`absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-extrabold text-white shadow-lg ring-3 transition duration-200 hover:z-20 hover:scale-125 focus:outline-none focus:ring-4 focus:ring-teal-300 ${estado.marker} ${markerStateClass}`}
                                style={{
                                    left: `${setor.planta_x}%`,
                                    top: `${setor.planta_y}%`,
                                }}
                            >
                                {setor.numero}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Setor selecionado compacto */}
            {selectedSector && (
                <div className="mx-4 mb-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                                    getEstado(selectedSector.status).marker
                                }`}
                            >
                                {selectedSector.numero}
                            </span>

                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {selectedSector.nome}
                                </h3>

                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {selectedSector.livres ?? 0} de{' '}
                                    {selectedSector.totalSecretarias ?? 0}{' '}
                                    secretárias disponíveis
                                </p>
                            </div>
                        </div>

                        <span
                            className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                getEstado(selectedSector.status).soft
                            } ${
                                getEstado(selectedSector.status).text
                            }`}
                        >
                            {getEstado(selectedSector.status).label}
                        </span>
                    </div>
                </div>
            )}

            {/* Lista compacta dos setores */}
            <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Setores deste piso
                    </h3>

                    <span className="text-[11px] font-medium text-slate-400">
                        {setores.length} registados
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {setores.map((setor) => {
                        const estado = getEstado(setor.status);

                        return (
                            <button
                                key={setor.id}
                                type="button"
                                onClick={() =>
                                    handleSectorClick(setor)
                                }
                                className="group/setor flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-left transition hover:border-teal-500/30 hover:bg-teal-500/5 dark:border-slate-800 dark:bg-slate-800/40"
                            >
                                <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white ${estado.marker}`}
                                >
                                    {setor.numero}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-xs font-semibold text-slate-700 transition group-hover/setor:text-teal-600 dark:text-slate-200 dark:group-hover/setor:text-teal-400">
                                        {setor.nome}
                                    </span>

                                    <span className="mt-0.5 block text-[11px] text-slate-400">
                                        {setor.totalSecretarias > 0
                                            ? `${setor.livres}/${setor.totalSecretarias} livres`
                                            : 'Sem secretárias'}
                                    </span>
                                </span>

                                <span
                                    className={`h-2 w-2 shrink-0 rounded-full ${estado.marker}`}
                                />
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
