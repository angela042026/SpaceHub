import { RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PERIODOS = ['7dias', '30dias', '90dias', 'ano'];

export default function PeriodFilter({ periodo, onChange, onRefresh, aAtualizar = false }) {
    const { t } = useTranslation('dashboard');

    return (
        <div className="flex items-center gap-2">
            <select
                value={periodo}
                onChange={(event) => onChange(event.target.value)}
                aria-label={t('statistics.periodFilter.filtrarPorPeriodo')}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
                {PERIODOS.map((codigo) => (
                    <option key={codigo} value={codigo}>
                        {t(`statistics.periodFilter.periodos.${codigo}`)}
                    </option>
                ))}
            </select>

            <button
                type="button"
                onClick={onRefresh}
                disabled={aAtualizar}
                title={t('statistics.periodFilter.atualizar')}
                aria-label={t('statistics.periodFilter.atualizar')}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
            >
                <RotateCw size={17} strokeWidth={1.9} className={aAtualizar ? 'animate-spin' : ''} />
            </button>
        </div>
    );
}
