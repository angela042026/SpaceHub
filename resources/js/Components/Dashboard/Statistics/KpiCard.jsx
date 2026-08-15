import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

/*
 * Cores fixas (não reagem ao tema, ver nota em PremiumChart/Panel) —
 * mesmos pares de gradiente turquesa/azul já usados no resto do
 * dashboard, para os KPIs não introduzirem uma paleta nova.
 */
const CORES = {
    turquesa: { icone: 'bg-teal-500/10 text-teal-600', linha: '#14b8a6' },
    azul: { icone: 'bg-blue-500/10 text-blue-600', linha: '#3b82f6' },
};

/**
 * Card de KPI com sparkline real (dados do próprio período, não uma
 * decoração fixa) e comparação com o período anterior.
 */
export default function KpiCard({
    icon: Icon,
    label,
    value,
    variacao,
    variacaoSufixo = '%',
    sparkline = [],
    color = 'turquesa',
}) {
    const paleta = CORES[color] ?? CORES.turquesa;
    const temVariacao = variacao !== null && variacao !== undefined;
    const positiva = temVariacao && variacao > 0;
    const negativa = temVariacao && variacao < 0;

    const corVariacao = positiva
        ? 'text-emerald-600 dark:text-emerald-400'
        : negativa
            ? 'text-red-500 dark:text-red-400'
            : 'text-slate-500';

    const dadosGrafico = sparkline.map((valor, indice) => ({ indice, valor }));
    const gradientId = `kpi-sparkline-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="dashboard-card flex h-full flex-col justify-between gap-3 p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${paleta.icone}`}>
                        <Icon size={18} strokeWidth={1.9} />
                    </div>

                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {label}
                    </p>

                    <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                        {value}
                    </p>
                </div>

                {dadosGrafico.length > 1 && (
                    <div className="h-12 w-20 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dadosGrafico} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={paleta.linha} stopOpacity={0.35} />
                                        <stop offset="100%" stopColor={paleta.linha} stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <Area
                                    type="monotone"
                                    dataKey="valor"
                                    stroke={paleta.linha}
                                    strokeWidth={1.75}
                                    fill={`url(#${gradientId})`}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className={`flex items-center gap-1 text-xs font-bold ${corVariacao}`}>
                {positiva && <TrendingUp size={13} strokeWidth={2.2} />}
                {negativa && <TrendingDown size={13} strokeWidth={2.2} />}
                {!temVariacao && <Minus size={13} strokeWidth={2.2} />}

                {temVariacao
                    ? `${positiva ? '+' : ''}${variacao}${variacaoSufixo}`
                    : 'Sem dados do período anterior'}

                {temVariacao && (
                    <span className="font-medium text-slate-500"> vs. período anterior</span>
                )}
            </div>
        </div>
    );
}
