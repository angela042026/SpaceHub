import { RotateCw } from 'lucide-react';

const PERIODOS = [
    { codigo: '7dias', label: 'Últimos 7 dias' },
    { codigo: '30dias', label: 'Últimos 30 dias' },
    { codigo: '90dias', label: 'Últimos 90 dias' },
    { codigo: 'ano', label: 'Último ano' },
];

export default function PeriodFilter({ periodo, onChange, onRefresh, aAtualizar = false }) {
    return (
        <div className="flex items-center gap-2">
            <select
                value={periodo}
                onChange={(event) => onChange(event.target.value)}
                aria-label="Filtrar por período"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
                {PERIODOS.map((opcao) => (
                    <option key={opcao.codigo} value={opcao.codigo}>
                        {opcao.label}
                    </option>
                ))}
            </select>

            <button
                type="button"
                onClick={onRefresh}
                disabled={aAtualizar}
                title="Atualizar"
                aria-label="Atualizar"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
            >
                <RotateCw size={17} strokeWidth={1.9} className={aAtualizar ? 'animate-spin' : ''} />
            </button>
        </div>
    );
}
