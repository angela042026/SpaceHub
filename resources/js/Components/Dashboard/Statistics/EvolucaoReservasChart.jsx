import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { CalendarRange } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const GRANULARIDADES = ['diario', 'semanal', 'mensal'];

function chaveSemana(data) {
    const dia = new Date(`${data}T00:00:00`);
    const inicioSemana = new Date(dia);
    // Semana começa à segunda-feira.
    const diffParaSegunda = (dia.getDay() + 6) % 7;
    inicioSemana.setDate(dia.getDate() - diffParaSegunda);

    return inicioSemana.toISOString().slice(0, 10);
}

function chaveMes(data) {
    return data.slice(0, 7);
}

function formatarLabel(chave, granularidade, locale) {
    const localeIntl = locale === 'en' ? 'en-GB' : 'pt-PT';

    if (granularidade === 'mensal') {
        const [ano, mes] = chave.split('-');

        return new Date(`${ano}-${mes}-01T00:00:00`).toLocaleDateString(localeIntl, {
            month: 'short',
            year: '2-digit',
        });
    }

    return new Date(`${chave}T00:00:00`).toLocaleDateString(localeIntl, {
        day: '2-digit',
        month: 'short',
    });
}

/**
 * Agrega a série diária vinda do backend (data, total, confirmadas) em
 * semanas ou meses — cálculo feito aqui no cliente porque é só uma
 * re-agrupagem da mesma série já real, sem precisar de nova query.
 */
function agregarSerie(dadosDiarios, granularidade, locale) {
    if (granularidade === 'diario') {
        return dadosDiarios.map((ponto) => ({
            chave: ponto.data,
            label: formatarLabel(ponto.data, 'diario', locale),
            total: ponto.total,
            confirmadas: ponto.confirmadas,
        }));
    }

    const obterChave = granularidade === 'semanal' ? chaveSemana : chaveMes;
    const agrupados = new Map();

    dadosDiarios.forEach((ponto) => {
        const chave = obterChave(ponto.data);
        const atual = agrupados.get(chave) ?? { total: 0, confirmadas: 0 };

        agrupados.set(chave, {
            total: atual.total + ponto.total,
            confirmadas: atual.confirmadas + ponto.confirmadas,
        });
    });

    return Array.from(agrupados.entries())
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([chave, valores]) => ({
            chave,
            label: formatarLabel(chave, granularidade, locale),
            ...valores,
        }));
}

function EvolucaoTooltip({ active, payload, label }) {
    const { t } = useTranslation('dashboard');

    if (!active || !payload?.length) {
        return null;
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>

            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {t('statistics.evolucaoReservas.reservasTotais', { count: payload.find((item) => item.dataKey === 'total')?.value ?? 0 })}
            </p>

            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                {t('statistics.evolucaoReservas.confirmadasCount', { count: payload.find((item) => item.dataKey === 'confirmadas')?.value ?? 0 })}
            </p>
        </div>
    );
}

export default function EvolucaoReservasChart({ data = [] }) {
    const { t, i18n } = useTranslation('dashboard');
    const [granularidade, setGranularidade] = useState('semanal');

    const dadosAgregados = useMemo(
        () => agregarSerie(data, granularidade, i18n.language),
        [data, granularidade, i18n.language],
    );

    return (
        <section className="dashboard-card flex h-full flex-col overflow-hidden">
            <header className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500">
                        <CalendarRange size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                            {t('statistics.evolucaoReservas.titulo')}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-500">
                            {t('statistics.evolucaoReservas.subtitulo')}
                        </p>
                    </div>
                </div>

                <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                    {GRANULARIDADES.map((codigo) => (
                        <button
                            key={codigo}
                            type="button"
                            onClick={() => setGranularidade(codigo)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                                granularidade === codigo
                                    ? 'bg-white text-teal-600 shadow-sm dark:bg-slate-700 dark:text-teal-400'
                                    : 'text-slate-500 hover:text-teal-600 dark:text-slate-400'
                            }`}
                        >
                            {t(`statistics.evolucaoReservas.granularidade.${codigo}`)}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 p-4">
                {dadosAgregados.length > 0 ? (
                    <div className="h-[245px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={dadosAgregados} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="4 4"
                                    stroke="var(--chart-grid, rgba(148,163,184,0.15))"
                                />

                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: 'var(--chart-axis, #64748b)' }}
                                    interval="preserveStartEnd"
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: 'var(--chart-axis, #64748b)' }}
                                    allowDecimals={false}
                                    width={34}
                                />

                                <Tooltip
                                    cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                                    content={<EvolucaoTooltip />}
                                />

                                <Bar
                                    dataKey="total"
                                    name={t('statistics.evolucaoReservas.seriesTotal')}
                                    fill="#93c5fd"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={28}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="confirmadas"
                                    name={t('statistics.evolucaoReservas.seriesConfirmadas')}
                                    stroke="#0d9488"
                                    strokeWidth={2.25}
                                    dot={false}
                                    isAnimationActive={false}
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="flex h-[245px] items-center justify-center">
                        <p className="text-sm text-slate-400">{t('statistics.semReservasPeriodo')}</p>
                    </div>
                )}
            </div>
        </section>
    );
}
