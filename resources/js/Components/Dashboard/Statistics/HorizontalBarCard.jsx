import { Fragment, useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

/**
 * "Reservas por Setor" — em largura total (o Mapa de Ocupação saiu
 * desta página). Mesma grelha-mãe única usada em EstadoProgressList
 * (nome | barra | quantidade | %) para colunas sempre alinhadas entre
 * linhas, com a coluna do nome a crescer conforme o setor mais
 * comprido (minmax(180px,auto)) — nenhum nome é cortado ou quebrado.
 *
 * Filtro por piso: puramente local (useState), sem qualquer pedido ao
 * servidor — o backend já devolve pisoId/pisoNome em cada linha de
 * `data` (EstatisticasService::calcularDashboard()), por isso trocar
 * de piso é só filtrar o array e recalcular localmente, sem reload da
 * página. A percentagem é sempre recalculada a partir do subconjunto
 * visível (soma dos totais filtrados), nunca do campo `percentual`
 * vindo do backend — esse campo é relativo ao total global, que deixa
 * de fazer sentido quando um piso específico está selecionado.
 */
function formatarPercentual(valor) {
    return `${valor}`.replace('.', ',');
}

const COLUNAS = 'grid-cols-[minmax(180px,auto)_minmax(0,1fr)_56px_64px]';

export default function HorizontalBarCard({
    icon: Icon,
    title,
    subtitle,
    data = [],
    color = '#14b8a6',
    emptyMessage,
    verTodosHref,
}) {
    const { t } = useTranslation('dashboard');
    const mensagemVazia = emptyMessage ?? t('statistics.semReservasPeriodo');
    const [pisoSelecionado, setPisoSelecionado] = useState(null);

    const pisosDisponiveis = useMemo(() => {
        const mapa = new Map();

        data.forEach((item) => {
            if (item.pisoId != null && !mapa.has(item.pisoId)) {
                mapa.set(item.pisoId, {
                    id: item.pisoId,
                    nome: item.pisoNome,
                    numero: item.pisoNumero ?? 0,
                });
            }
        });

        return Array.from(mapa.values()).sort((a, b) => a.numero - b.numero);
    }, [data]);

    const dadosFiltrados = pisoSelecionado === null
        ? data
        : data.filter((item) => item.pisoId === pisoSelecionado);

    const ordenados = [...dadosFiltrados].sort((a, b) => b.total - a.total);
    const top6 = ordenados.slice(0, 6);
    const somaFiltrada = dadosFiltrados.reduce((soma, item) => soma + item.total, 0);
    const maxTotal = Math.max(...top6.map((item) => item.total), 1);

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
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
                </div>

                {pisosDisponiveis.length > 0 && (
                    <div className="flex shrink-0 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                        <button
                            type="button"
                            onClick={() => setPisoSelecionado(null)}
                            aria-label={t('statistics.todosOsPisos')}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                pisoSelecionado === null
                                    ? 'bg-white text-teal-600 shadow-sm dark:bg-slate-700 dark:text-teal-400'
                                    : 'text-slate-500 hover:text-teal-600 dark:text-slate-400'
                            }`}
                        >
                            {t('statistics.todos')}
                        </button>

                        {pisosDisponiveis.map((piso) => (
                            <button
                                key={piso.id}
                                type="button"
                                onClick={() => setPisoSelecionado(piso.id)}
                                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                    pisoSelecionado === piso.id
                                        ? 'bg-white text-teal-600 shadow-sm dark:bg-slate-700 dark:text-teal-400'
                                        : 'text-slate-500 hover:text-teal-600 dark:text-slate-400'
                                }`}
                            >
                                {piso.nome}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
                {top6.length > 0 ? (
                    <div className={`grid ${COLUNAS} items-center gap-x-6 gap-y-3`}>
                        {top6.map((item, indice) => {
                            const largura = Math.round((item.total / maxTotal) * 100);
                            const percentual = somaFiltrada > 0
                                ? (item.total / somaFiltrada * 100).toFixed(1)
                                : '0.0';

                            return (
                                <Fragment key={`${item.id ?? item.nome}-${indice}`}>
                                    <span
                                        className="whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-200"
                                        title={item.nome}
                                    >
                                        {item.nome}
                                    </span>

                                    <div className="h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${largura}%`, backgroundColor: color }}
                                        />
                                    </div>

                                    <span className="text-right text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
                                        {item.total}
                                    </span>

                                    <span className="text-right text-xs tabular-nums text-slate-500">
                                        {formatarPercentual(percentual)}%
                                    </span>
                                </Fragment>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex min-h-[150px] flex-1 items-center justify-center">
                        <p className="text-sm text-slate-400">{mensagemVazia}</p>
                    </div>
                )}

                {dadosFiltrados.length > top6.length && verTodosHref && (
                    <div className="mt-4 border-t border-slate-100 pt-2.5 text-center dark:border-slate-800">
                        <Link
                            href={verTodosHref}
                            className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                        >
                            {t('statistics.verTodosSetores')}
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
