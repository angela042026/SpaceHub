import { Fragment } from 'react';

/**
 * "Reservas por Estado" — lista com barras horizontais de progresso em
 * vez de donut (pedido explícito: variedade de visualizações na
 * página, só "Reservas por Piso" continua como donut). Uma única
 * grelha-mãe (não uma por linha) garante que a coluna do nome, da
 * barra, da quantidade e da percentagem ficam alinhadas entre todas as
 * linhas — incluindo a linha de Total.
 */
function formatarPercentual(valor) {
    return `${valor}`.replace('.', ',');
}

const COLUNAS = 'grid-cols-[130px_minmax(60px,1fr)_48px_56px]';

export default function EstadoProgressList({
    icon: Icon,
    title,
    subtitle,
    data = [],
    emptyMessage = 'Sem reservas neste período.',
}) {
    const total = data.reduce((soma, item) => soma + item.total, 0);
    const maxTotal = Math.max(...data.map((item) => item.total), 1);
    const ordenados = [...data].sort((a, b) => b.total - a.total);

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                    <Icon size={20} strokeWidth={1.9} />
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>

                    {subtitle && (
                        <p className="mt-0.5 text-xs text-slate-500">
                            {subtitle}
                        </p>
                    )}
                </div>
            </header>

            {total === 0 ? (
                <div className="flex min-h-[150px] flex-1 items-center justify-center px-5 py-8">
                    <p className="text-sm text-slate-400">{emptyMessage}</p>
                </div>
            ) : (
                <div className={`grid flex-1 content-center ${COLUNAS} items-center gap-x-3 gap-y-3 p-5`}>
                    {ordenados.map((item) => {
                        const largura = Math.round((item.total / maxTotal) * 100);

                        return (
                            <Fragment key={item.label}>
                                <span
                                    className="truncate text-[13px] font-medium text-slate-700 dark:text-slate-200"
                                    title={item.label}
                                >
                                    {item.label}
                                </span>

                                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{ width: `${largura}%`, backgroundColor: item.color }}
                                    />
                                </div>

                                <span className="text-right text-[13px] font-semibold tabular-nums text-slate-900 dark:text-white">
                                    {item.total}
                                </span>

                                <span className="text-right text-xs tabular-nums text-slate-500">
                                    {formatarPercentual(item.percent)}%
                                </span>
                            </Fragment>
                        );
                    })}

                    <div key="total-label" className="col-span-4 mt-1 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <div className={`grid ${COLUNAS} items-center gap-x-3`}>
                            <span className="text-[13px] font-bold text-slate-900 dark:text-white">Total</span>
                            <span />
                            <span className="text-right text-[13px] font-bold tabular-nums text-slate-900 dark:text-white">
                                {total}
                            </span>
                            <span className="text-right text-xs font-bold tabular-nums text-slate-500">100%</span>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
