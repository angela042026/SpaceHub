import { router } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

function EmptyState({ text }) {
    return <p className="text-sm text-slate-400">{text}</p>;
}

function formatarData(data) {
    if (!data) {
        return '-';
    }

    return new Date(data).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
    });
}

function RankingChart({ data, color }) {
    if (!data?.length) {
        return null;
    }

    return (
        <div className="mb-4 h-36">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={88}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) =>
                            value.length > 12 ? `${value.slice(0, 11)}…` : value
                        }
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
                        contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                            fontSize: 12,
                        }}
                    />
                    <Bar dataKey="total" radius={[0, 8, 8, 0]} fill={color} maxBarSize={16} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function RankingList({ title, items, chartData, chartColor, getKey, renderItem, getTotal }) {
    return (
        <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {title}
            </h3>

            {items?.length > 0 ? (
                <>
                    <RankingChart data={chartData} color={chartColor} />

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div
                                key={getKey(item, index)}
                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/60"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                        {index + 1}
                                    </div>

                                    <div>{renderItem(item)}</div>
                                </div>

                                <span className="badge-status bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400">
                                    {getTotal ? getTotal(item) : item.total}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <EmptyState text="Ainda não existem dados suficientes." />
            )}
        </div>
    );
}

export default function StatisticsPanel({ estatisticas, periodo = 'geral' }) {
    function mudarPeriodo(event) {
        router.get(
            route('dashboard'),
            { periodo: event.target.value },
            { preserveState: true, preserveScroll: true, only: ['estatisticas', 'periodo'] },
        );
    }

    const secretariasMaisChart = estatisticas?.secretariasMaisUtilizadas?.map((item) => ({
        name: item.secretaria?.codigo ?? '—',
        total: item.total,
    }));

    const secretariasMenosChart = estatisticas?.secretariasMenosUtilizadas?.map((item) => ({
        name: item.codigo,
        total: item.reservas_count,
    }));

    const utilizadoresChart = estatisticas?.utilizadoresComMaisReservas?.map((item) => ({
        name: item.user?.name ?? '—',
        total: item.total,
    }));

    const diasChart = estatisticas?.diasComMaiorOcupacao?.map((item) => ({
        name: formatarData(item.data),
        total: item.total,
    }));

    return (
        <div className="dashboard-card p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Estatísticas de ocupação
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Dados calculados com base nas reservas registadas.
                    </p>
                </div>

                <select
                    value={periodo}
                    onChange={mudarPeriodo}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                    <option value="geral">Geral</option>
                    <option value="semana">Esta semana</option>
                    <option value="mes">Este mês</option>
                </select>
            </div>

            <div className="mb-6 rounded-2xl border border-teal-500/20 bg-teal-500/10 p-5 dark:border-teal-500/20 dark:bg-teal-500/10">
                <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                    Piso mais utilizado
                </p>

                <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {estatisticas?.pisoMaisUtilizado?.nome ?? 'Sem dados'}
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {estatisticas?.pisoMaisUtilizado?.total
                        ? `${estatisticas.pisoMaisUtilizado.total} reservas registadas`
                        : 'Ainda não existem reservas suficientes.'}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <RankingList
                    title="Secretárias mais utilizadas"
                    items={estatisticas?.secretariasMaisUtilizadas}
                    chartData={secretariasMaisChart}
                    chartColor="#14b8a6"
                    getKey={(item) => item.secretaria_id}
                    renderItem={(item) => (
                        <>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {item.secretaria?.codigo ?? 'Secretária removida'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.total} reservas
                            </p>
                        </>
                    )}
                />

                <RankingList
                    title="Secretárias menos utilizadas"
                    items={estatisticas?.secretariasMenosUtilizadas}
                    chartData={secretariasMenosChart}
                    chartColor="#64748b"
                    getKey={(item) => item.id}
                    getTotal={(item) => item.reservas_count}
                    renderItem={(item) => (
                        <>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {item.codigo}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.reservas_count} reservas
                            </p>
                        </>
                    )}
                />

                <RankingList
                    title="Utilizadores com mais reservas"
                    items={estatisticas?.utilizadoresComMaisReservas}
                    chartData={utilizadoresChart}
                    chartColor="#1e3a5f"
                    getKey={(item) => item.user_id}
                    renderItem={(item) => (
                        <>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {item.user?.name ?? 'Utilizador removido'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.total} reservas
                            </p>
                        </>
                    )}
                />

                <RankingList
                    title="Dias com maior ocupação"
                    items={estatisticas?.diasComMaiorOcupacao}
                    chartData={diasChart}
                    chartColor="#1e3a5f"
                    getKey={(item) => item.data}
                    renderItem={(item) => (
                        <>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {formatarData(item.data)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {item.total} reservas
                            </p>
                        </>
                    )}
                />
            </div>
        </div>
    );
}
