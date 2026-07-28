import { X } from 'lucide-react';

import { getEstado } from './mapUtils';

export default function SelectedSectorCard({
    selectedSector,
    selectedSecretaria,
    onClose,
}) {
    if (!selectedSector) {
        return null;
    }

    const estadoSetor = getEstado(selectedSector.status);

    return (
        <div className="mx-4 mb-3 rounded-xl border border-teal-500/20 bg-teal-500/5 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white ${estadoSetor.marker}`}
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
                            secretárias disponíveis — clica numa
                            bolinha para ver o lugar
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${estadoSetor.soft} ${estadoSetor.text}`}
                    >
                        {estadoSetor.label}
                    </span>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar zona selecionada"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700/60 dark:hover:text-slate-200"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {selectedSecretaria && (
                <SelectedDeskInfo
                    selectedSecretaria={selectedSecretaria}
                />
            )}
        </div>
    );
}

function SelectedDeskInfo({ selectedSecretaria }) {
    const estadoSecretaria = getEstado(
        selectedSecretaria.status,
    );

    return (
        <div className="mt-3 flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 dark:bg-slate-900/40">
            <div className="flex items-center gap-2">
                <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${estadoSecretaria.marker}`}
                >
                    {selectedSecretaria.numero}
                </span>

                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {selectedSecretaria.codigo}
                </span>
            </div>

            <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${estadoSecretaria.soft} ${estadoSecretaria.text}`}
            >
                {estadoSecretaria.label}
            </span>
        </div>
    );
}
