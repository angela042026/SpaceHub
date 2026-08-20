import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    BarChart3,
    Building2,
    CalendarDays,
    Clock,
    Gauge,
    ListChecks,
    MapPinned,
    Sun,
    Users,
} from 'lucide-react';

import { useTranslation } from 'react-i18next';

import DashboardLayout from '@/Layouts/DashboardLayout';
import PrintHeader from '@/Components/Admin/PrintHeader';
import PrintFooter from '@/Components/Admin/PrintFooter';
import PrintButton from '@/Components/Admin/PrintButton';
import KpiCard from '@/Components/Dashboard/Statistics/KpiCard';
import EvolucaoReservasChart from '@/Components/Dashboard/Statistics/EvolucaoReservasChart';
import OcupacaoPorDiaChart from '@/Components/Dashboard/Statistics/OcupacaoPorDiaChart';
import DonutCard from '@/Components/Dashboard/Statistics/DonutCard';
import EstadoProgressList from '@/Components/Dashboard/Statistics/EstadoProgressList';
import PeriodoBarChart from '@/Components/Dashboard/Statistics/PeriodoBarChart';
import HorizontalBarCard from '@/Components/Dashboard/Statistics/HorizontalBarCard';
import TopUsersCard from '@/Components/Dashboard/Statistics/TopUsersCard';
import PeriodFilter from '@/Components/Dashboard/Statistics/PeriodFilter';

import { ESTADO_RESERVA, etiqueta, etiquetaPeriodo } from '@/utils/estados';

// Paleta cíclica para "Reservas por Piso" (o número de pisos é
// dinâmico) — mesmos tons turquesa/azul/roxo já usados no resto do
// dashboard.
const PALETA_PISOS = ['#14b8a6', '#3b82f6', '#6366f1', '#06b6d4', '#f59e0b', '#8b5cf6'];

// Mesmas cores dos badges de estado em resources/js/utils/estados.js
// (ESTADO_RESERVA) — para o donut nunca divergir do resto da app.
const CORES_ESTADO = {
    pendente: '#f59e0b',
    confirmada: '#14b8a6',
    cancelada: '#ef4444',
    expirada: '#94a3b8',
    concluida: '#3b82f6',
    nao_compareceu: '#64748b',
};

const CORES_PERIODO_DIA = {
    Manhã: '#f59e0b',
    Tarde: '#3b82f6',
    'Dia inteiro': '#14b8a6',
};

export default function Index({ dashboard, periodo, edificioId, edificios, geradoEm }) {
    const { t } = useTranslation('estatisticas');
    const { t: tc } = useTranslation('common');
    const [aAtualizar, setAAtualizar] = useState(false);

    const visitar = (alteracoes) => {
        router.get(
            route('admin.statistics.index'),
            { periodo, edificio_id: edificioId, ...alteracoes },
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => setAAtualizar(true),
                onFinish: () => setAAtualizar(false),
            },
        );
    };

    const { kpis } = dashboard;

    const reservasPorPisoData = dashboard.reservasPorPiso.map((piso, indice) => ({
        label: piso.nome,
        total: piso.total,
        percent: piso.percentual,
        color: PALETA_PISOS[indice % PALETA_PISOS.length],
    }));

    const reservasPorPeriodoDoDiaData = dashboard.reservasPorPeriodoDoDia.map((item) => ({
        label: etiquetaPeriodo(item.nome, tc),
        total: item.total,
        percent: item.percentual,
        color: CORES_PERIODO_DIA[item.nome] ?? '#14b8a6',
    }));

    const reservasPorEstadoData = dashboard.reservasPorEstado.map((item) => ({
        label: etiqueta(ESTADO_RESERVA, item.codigo, item.nome, tc),
        total: item.total,
        percent: item.percentual,
        color: CORES_ESTADO[item.codigo] ?? '#94a3b8',
    }));

    return (
        <DashboardLayout>
            <Head title={t('titulo')} />

            <PrintHeader
                title={t('subtitulo')}
                subtitle={t('periodoImpressao', {
                    periodo: t(`periodos.${periodo}`, { defaultValue: periodo }),
                })}
                geradoEm={geradoEm}
            />

            {/*
                Grande contentor branco que envolve toda a página, do
                título aos gráficos finais — pedido explícito para a
                área deixar de "respirar" solta sobre o fundo cinza e
                passar a ler-se como uma única área de trabalho.

                -mt-6 cancela o espaçamento que o DashboardLayout aplica
                automaticamente (space-y-6 entre os filhos diretos da
                página) mesmo o PrintHeader acima estando invisível no
                ecrã (display:none conta na mesma para o "* + *" do
                space-y) — sem isto sobrava um vão vazio antes deste
                contentor que não vinha de nenhum estilo visível aqui.
            */}
            <section
                className="-mt-6 flex flex-col gap-5 rounded-[22px] border p-6 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.10)] sm:p-7 dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.45)]"
                style={{ borderColor: 'var(--color-border)', background: 'var(--color-card)' }}
            >
                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <BarChart3 size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('titulo')}
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {t('descricao')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 print:hidden">
                        <PeriodFilter
                            periodo={periodo}
                            onChange={(novoPeriodo) => visitar({ periodo: novoPeriodo })}
                            onRefresh={() => visitar({})}
                            aAtualizar={aAtualizar}
                        />

                        {/*
                            PrintButton é partilhado com as 3 páginas de
                            Relatórios e traz o seu próprio "mb-5 flex
                            justify-end" (pensado para ficar sozinho numa
                            linha) — sem este wrapper a compensar, essa
                            margem inferior empurrava-o visualmente para
                            fora do grupo. -mb-5 cancela-a só aqui, sem
                            tocar no componente partilhado.
                        */}
                        <div className="-mb-5">
                            <PrintButton />
                        </div>
                    </div>
                </div>

                {/*
                    Regra mais importante da página: cartões lado a lado
                    pertencem sempre à mesma linha de grid, sem
                    items-start — items-stretch (por omissão do CSS
                    Grid) garante que começam e terminam exatamente na
                    mesma coordenada vertical. Cada cartão tem h-full +
                    flex-1 no conteúdo para que esse "esticão" centre o
                    conteúdo em vez de deixar um vazio parado (ver nota
                    no DonutCard).
                */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        icon={CalendarDays}
                        label={t('kpis.totalReservas')}
                        value={kpis.totalReservas.valor}
                        variacao={kpis.totalReservas.variacaoPercentual}
                        sparkline={kpis.totalReservas.sparkline}
                        color="turquesa"
                    />

                    <KpiCard
                        icon={Users}
                        label={t('kpis.utilizadoresAtivos')}
                        value={kpis.utilizadoresAtivos.valor}
                        variacao={kpis.utilizadoresAtivos.variacaoPercentual}
                        sparkline={kpis.utilizadoresAtivos.sparkline}
                        color="azul"
                    />

                    <KpiCard
                        icon={Gauge}
                        label={t('kpis.taxaOcupacaoMedia')}
                        value={`${kpis.taxaOcupacaoMedia.valor}%`}
                        variacao={kpis.taxaOcupacaoMedia.variacaoPontosPercentuais}
                        variacaoSufixo={t('kpis.sufixoPontosPercentuais')}
                        sparkline={kpis.taxaOcupacaoMedia.sparkline}
                        color="turquesa"
                    />

                    <KpiCard
                        icon={Clock}
                        label={t('kpis.tempoMedioPorReserva')}
                        value={`${kpis.tempoMedioPorReserva.valorHoras}h`}
                        variacao={kpis.tempoMedioPorReserva.variacaoPercentual}
                        sparkline={kpis.tempoMedioPorReserva.sparkline}
                        color="azul"
                    />
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <EvolucaoReservasChart data={dashboard.evolucaoReservas} />
                    <OcupacaoPorDiaChart data={dashboard.ocupacaoPorDia} />
                </div>

                {/*
                    Metade inferior: obrigatoriamente 2 cartões por
                    linha (nunca 3) — é isso que dá a cada um largura
                    suficiente para nomes por extenso e legendas
                    confortáveis. Aceita-se scroll vertical em troca de
                    legibilidade.
                */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <EstadoProgressList
                        icon={ListChecks}
                        title={t('cards.reservasPorEstado')}
                        data={reservasPorEstadoData}
                    />

                    <DonutCard
                        icon={Building2}
                        title={t('cards.reservasPorPiso')}
                        data={reservasPorPisoData}
                        tamanhoDonut={150}
                        headerExtra={
                            edificios.length > 1 && (
                                <select
                                    value={edificioId ?? ''}
                                    onChange={(event) =>
                                        visitar({ edificio_id: event.target.value || null })
                                    }
                                    aria-label={t('filtrarPorEdificio')}
                                    className="h-8 shrink-0 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                >
                                    <option value="">{t('todosOsEdificios')}</option>

                                    {edificios.map((edificio) => (
                                        <option key={edificio.id} value={edificio.id}>
                                            {edificio.nome}
                                        </option>
                                    ))}
                                </select>
                            )
                        }
                    />
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <PeriodoBarChart
                        icon={Sun}
                        title={t('cards.reservasPorPeriodoDoDia')}
                        data={reservasPorPeriodoDoDiaData}
                    />

                    <TopUsersCard data={dashboard.topUtilizadores} />
                </div>

                {/*
                    Sem o Mapa de Ocupação (removido desta página), este
                    card passa a ser o fecho visual da página, em
                    largura total — o mesmo tratamento em grelha única
                    do EstadoProgressList, só que a coluna do nome
                    cresce ao setor mais comprido em vez de ter uma
                    largura fixa, já que aqui sobra largura de sobra.
                */}
                <div className="grid grid-cols-1 gap-5">
                    <HorizontalBarCard
                        icon={MapPinned}
                        title={t('cards.reservasPorSetor')}
                        data={dashboard.reservasPorSetor}
                        color="#14b8a6"
                        verTodosHref={route('admin.setores.index')}
                    />
                </div>
            </section>

            <PrintFooter geradoEm={geradoEm} />
        </DashboardLayout>
    );
}
