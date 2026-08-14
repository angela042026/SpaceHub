import { Inbox } from 'lucide-react';

export default function Table({
    columns,
    data = [],
    keyField = 'id',
    emptyMessage = 'Nenhum registo encontrado.',
    onRowClick,
}) {
    if (data.length === 0) {
        return (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                    <Inbox size={23} strokeWidth={1.8} />
                </div>

                <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
                    {emptyMessage}
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/60">
                    <tr>
                        {columns.map((coluna) => (
                            <th
                                key={coluna.key}
                                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 ${
                                    coluna.align === 'right' ? 'text-right' : 'text-left'
                                }`}
                            >
                                {coluna.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.map((linha) => (
                        <tr
                            key={linha[keyField]}
                            onClick={onRowClick ? () => onRowClick(linha) : undefined}
                            tabIndex={onRowClick ? 0 : undefined}
                            role={onRowClick ? 'button' : undefined}
                            onKeyDown={
                                onRowClick
                                    ? (event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            onRowClick(linha);
                                        }
                                    }
                                    : undefined
                            }
                            className={`bg-white transition dark:bg-card ${
                                onRowClick
                                    ? 'cursor-pointer hover:bg-teal-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-inset dark:hover:bg-teal-400/5'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                            }`}
                        >
                            {columns.map((coluna) => (
                                <td
                                    key={coluna.key}
                                    className={`px-4 py-3 text-slate-700 dark:text-slate-200 ${
                                        coluna.align === 'right' ? 'text-right' : 'text-left'
                                    }`}
                                >
                                    {coluna.render ? coluna.render(linha) : linha[coluna.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
