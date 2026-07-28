import { Search } from 'lucide-react';

import { getEstado } from './mapUtils';

export default function SectorList({
    setoresVisiveis,
    totalSetores,
    selectedSector,
    onSectorClick,
    onClearFilters,
}) {
    return (
        <div className="border-t border-slate-100 px-4 py-3 dark:border-slate-800">
            <div className="mb-2.5 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Setores deste piso
                </h3>

                <span className="text-[11px] font-medium text-slate-400">
                    {setoresVisiveis.length} de {totalSetores}{' '}
                    apresentados
                </span>
            </div>

            {setoresVisiveis.length > 0 ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {setoresVisiveis.map((setor) => {
                        const estado = getEstado(setor.status);

                        const isSelected =
                            selectedSector?.id === setor.id;

                        return (
                            <button
                                key={setor.id}
                                type="button"
                                onClick={() =>
                                    onSectorClick?.(setor)
                                }
                                className={`group/setor flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                                    isSelected
                                        ? 'border-teal-500/40 bg-teal-500/10 ring-2 ring-teal-500/10'
                                        : 'border-slate-100 bg-slate-50/70 hover:border-teal-500/30 hover:bg-teal-500/5 dark:border-slate-800 dark:bg-slate-800/40'
                                }`}
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

                                    {setor.totalSecretarias > 0 && (
                                        <span className="mt-0.5 block text-[11px] text-slate-400">
                                            {setor.livres}/
                                            {setor.totalSecretarias}{' '}
                                            livres
                                        </span>
                                    )}
                                </span>

                                <span
                                    className={`h-2 w-2 shrink-0 rounded-full ${estado.marker}`}
                                />
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center dark:border-slate-700">
                    <Search
                        size={22}
                        strokeWidth={1.8}
                        className="mx-auto text-slate-300 dark:text-slate-600"
                    />

                    <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                        Nenhum setor encontrado
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                        Altera a pesquisa ou remove os filtros
                        aplicados.
                    </p>

                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="mt-3 text-xs font-bold text-teal-600 transition hover:text-teal-700 dark:text-teal-400"
                    >
                        Limpar filtros
                    </button>
                </div>
            )}
        </div>
    );
}
