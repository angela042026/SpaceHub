import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { estadoNormalizado } from './mapUtils';

/**
 * Card flutuante com o resumo do setor selecionado, sobreposto ao
 * mapa (nunca uma coluna lateral) — usado apenas na página "Mapa do
 * Escritório" (OfficeMap com somenteMapa). Todos os números vêm das
 * secretárias reais do próprio setor, nunca escritos aqui.
 */
export default function SelectedSectorFloatingCard({
    setor,
    piso,
    onVerSecretarias,
    onClose,
}) {
    const { t } = useTranslation('dashboard');

    if (!setor) {
        return null;
    }

    const secretariasDoSetor = setor.secretarias ?? [];
    const total = secretariasDoSetor.length;
    const livres = secretariasDoSetor.filter(
        (secretaria) => estadoNormalizado(secretaria.status) === 'livre',
    ).length;

    return (
        <div
            data-map-control="true"
            className="absolute inset-x-3 bottom-3 z-40 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.16)] dark:border-[#2a5069] dark:bg-[#101f34] sm:inset-x-auto sm:right-3 sm:w-72"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-slate-900 dark:text-[#f8fafc]">
                        {setor.nome}
                    </h3>

                    <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-[#8fa7bd]">
                        {piso?.nome}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('officeMap.fechar')}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:text-[#8fa7bd] dark:hover:bg-[#183f5d]"
                >
                    <X size={15} strokeWidth={2} />
                </button>
            </div>

            <div className="mt-3 space-y-1">
                <p className="text-sm text-slate-600 dark:text-[#b5c5d5]">
                    {t('officeMap.secretariaCount', { count: total })}
                </p>

                <p className="text-sm font-bold text-teal-600 dark:text-[#18c3b3]">
                    {t('officeMap.disponivelAgora', { count: livres })}
                </p>
            </div>

            <button
                type="button"
                onClick={onVerSecretarias}
                className="mt-3 flex h-10 w-full items-center justify-center rounded-xl bg-teal-500 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600 dark:bg-[#18c3b3] dark:text-[#03172b] dark:hover:bg-[#5eead4]"
            >
                {t('officeMap.verSecretarias')}
            </button>
        </div>
    );
}
