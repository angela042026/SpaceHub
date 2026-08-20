import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

/**
 * Painel de características filtráveis (Monitor, Janela, etc.) — a
 * lista é fixa (igual para qualquer piso/setor) e aparece sempre,
 * recolhida por omissão, para não ocupar espaço quando não é usada.
 */
export default function PreferenciasPanel({
    preferenciasDisponiveis,
    preferencias,
    onAlternarPreferencia,
}) {
    const { t } = useTranslation('reservas');
    const [aberto, setAberto] = useState(false);

    const quantidadeAtiva = preferenciasDisponiveis.filter(
        (preferencia) => preferencias[preferencia.key],
    ).length;

    return (
        <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
                type="button"
                onClick={() => setAberto((atual) => !atual)}
                aria-expanded={aberto}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
                <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                    <SlidersHorizontal
                        size={16}
                        strokeWidth={1.9}
                        className="text-slate-400"
                    />
                    {t('preferencias.filtrosAdicionais')}
                    {quantidadeAtiva > 0 && (
                        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-teal-500 px-1.5 text-[11px] font-bold text-white">
                            {quantidadeAtiva}
                        </span>
                    )}
                </span>

                <ChevronDown
                    size={18}
                    strokeWidth={2}
                    className={`text-slate-400 transition-transform duration-200 ${
                        aberto ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {aberto && (
                <div className="flex flex-wrap gap-2.5 border-t border-slate-100 px-4 py-4 dark:border-slate-800">
                    {preferenciasDisponiveis.map((preferencia) => (
                        <label
                            key={preferencia.key}
                            className="cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={preferencias[preferencia.key]}
                                onChange={() =>
                                    onAlternarPreferencia(preferencia.key)
                                }
                                className="peer sr-only"
                            />

                            <span
                                className="
                                    inline-flex
                                    items-center
                                    rounded-full
                                    border
                                    border-slate-300
                                    bg-white
                                    px-4
                                    py-2
                                    text-sm
                                    font-medium
                                    text-slate-700
                                    transition-all
                                    duration-200
                                    hover:border-teal-500
                                    hover:bg-teal-50
                                    hover:text-teal-600
                                    peer-checked:border-teal-500
                                    peer-checked:bg-teal-500
                                    peer-checked:text-white
                                    peer-checked:shadow-md
                                    peer-focus-visible:ring-2
                                    peer-focus-visible:ring-teal-500/60
                                    peer-focus-visible:ring-offset-2
                                    dark:border-slate-700
                                    dark:bg-slate-900
                                    dark:text-slate-200
                                    dark:hover:bg-slate-800
                                    dark:peer-focus-visible:ring-offset-slate-900
                                "
                            >
                                {t(preferencia.label)}
                            </span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}
