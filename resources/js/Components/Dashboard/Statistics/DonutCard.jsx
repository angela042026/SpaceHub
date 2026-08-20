import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

/**
 * Donut genérico com total ao centro + legenda — usado por "Reservas por
 * Piso", "Reservas por Período do Dia" e "Reservas por Estado" na página
 * de Estatísticas. Mesma linguagem visual do OccupancyDonutChart do
 * dashboard principal (innerRadius/outerRadius, gradiente por fatia),
 * mas com o número de segmentos, cores e legenda vindos de fora.
 *
 * h-full + flex-1 de propósito: quando o grid da linha estica este
 * cartão para igualar a altura de um vizinho maior (items-stretch, o
 * comportamento por omissão do CSS Grid), o conteúdo centra-se no
 * espaço extra em vez de deixar um vazio parado entre o cabeçalho e o
 * donut — ao contrário de antes, agora as alturas naturais dos três
 * cartões da linha já ficam próximas, por isso o "esticão" é sempre
 * pequeno.
 */
function formatarPercentual(valor) {
    return `${valor}`.replace('.', ',');
}
function DonutTooltip({ active, payload }) {
    const { t } = useTranslation('dashboard');

    if (!active || !payload?.length) {
        return null;
    }

    const item = payload[0];

    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {item.name}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {t('statistics.reservasCount', { count: item.value })}
            </p>
        </div>
    );
}

export default function DonutCard({
    icon: Icon,
    title,
    subtitle,
    data = [],
    emptyMessage,
    headerExtra,
    legendaDuasColunas = false,
    // Tamanho do donut em píxeis — só afeta o card que o define
    // explicitamente (Piso, na linha 3, continua a usar o valor por
    // omissão e fica inalterado).
    tamanhoDonut = 140,
    // Quando true, o donut fica sempre centrado por cima da legenda, a
    // toda a largura do card, em vez de partilhar a linha com uma
    // coluna fixa de 140px — era essa partilha, com "Não compareceu" a
    // disputar espaço com a percentagem numa coluna estreita, que
    // forçava o truncate a cortar os nomes dos estados para 1-2 letras.
    empilhado = false,
}) {
    const { t } = useTranslation('dashboard');
    const mensagemVazia = emptyMessage ?? t('statistics.semReservasPeriodo');
    const total = data.reduce((soma, item) => soma + item.total, 0);
    const innerRadius = Math.round(tamanhoDonut * 0.314);
    const outerRadius = Math.round(tamanhoDonut * 0.457);

    const gridClass = empilhado
        ? 'grid gap-4 p-5'
        : 'grid gap-5 p-5 sm:grid-cols-[var(--donut-w)_1fr] xl:grid-cols-1 2xl:grid-cols-[var(--donut-w)_1fr]';

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                        <Icon size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold leading-snug text-slate-900 dark:text-white">
                            {title}
                        </h3>

                        {subtitle && (
                            <p className="mt-0.5 text-xs text-slate-500">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {headerExtra}
            </header>

            {total === 0 ? (
                <div className="flex min-h-[150px] flex-1 items-center justify-center px-5 py-8">
                    <p className="text-sm text-slate-400">{mensagemVazia}</p>
                </div>
            ) : (
                <div
                    className={`flex-1 content-center ${gridClass}`}
                    style={{ '--donut-w': `${tamanhoDonut}px` }}
                >
                    <div
                        className="relative mx-auto"
                        style={{ height: tamanhoDonut, width: tamanhoDonut }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="total"
                                    nameKey="label"
                                    innerRadius={innerRadius}
                                    outerRadius={outerRadius}
                                    paddingAngle={2}
                                    stroke="none"
                                    isAnimationActive
                                    animationDuration={800}
                                >
                                    {data.map((item) => (
                                        <Cell key={item.label} fill={item.color} />
                                    ))}
                                </Pie>

                                <Tooltip content={<DonutTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <strong className="text-xl font-black text-slate-900 dark:text-white">
                                {total}
                            </strong>

                            <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                                {t('statistics.total')}
                            </span>
                        </div>
                    </div>

                    <div
                        className={`flex flex-col justify-center gap-2.5 ${
                            legendaDuasColunas ? 'sm:grid sm:grid-cols-2 sm:gap-x-6 sm:gap-y-2.5' : ''
                        }`}
                    >
                        {/*
                            Grid explícito por linha (label | valor |
                            percentagem), cada um na sua própria coluna —
                            em vez de flex justify-between, que podia
                            colar o valor ao nome quando a coluna ficava
                            estreita ("Confirmada55"). minmax(0,1fr) dá
                            ao nome espaço para crescer sem invadir as
                            colunas de valor/percentagem (auto) — sem
                            truncate: os nomes têm de aparecer sempre
                            por inteiro, nunca cortados com "...".
                        */}
                        {data.map((item) => (
                            <div
                                key={item.label}
                                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3"
                            >
                                <div className="flex min-w-0 items-center gap-2">
                                    <span
                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />

                                    <span className="text-[13px] font-medium leading-tight text-slate-700 dark:text-slate-200">
                                        {item.label}
                                    </span>
                                </div>

                                <span className="pl-2 text-right text-[13px] font-semibold tabular-nums text-slate-900 dark:text-white">
                                    {item.total}
                                </span>

                                <span className="min-w-[46px] pl-2 text-right text-xs tabular-nums text-slate-500">
                                    {formatarPercentual(item.percent)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
