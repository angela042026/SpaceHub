import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';

import OccupancyDonutChart from '@/Components/Dashboard/Charts/OccupancyDonutChart';
import OccupancyTrendChart from '@/Components/Dashboard/Charts/OccupancyTrendChart';
import ReservationsByFloorChart from '@/Components/Dashboard/Charts/ReservationsByFloorChart';
import OfficeMap from '@/Components/Dashboard/OfficeMap/OfficeMap';
import RecentActivity from '@/Components/Dashboard/RecentActivity';
import StatCard from '@/Components/Dashboard/StatCard';
import UpcomingReservations from '@/Components/Dashboard/UpcomingReservations';
import StatisticsSummary from '@/Components/Dashboard/StatisticsSummary';

import {
    Armchair,
    CalendarDays,
    CheckCircle2,
    PieChart,
    TimerOff,
    XCircle,
} from 'lucide-react';

export default function Admin({
    stats,
    estatisticas,
    atividadeRecente,
    pisos,
    edificios,
    reservaHojeUtilizador,
    proximasReservas,
    reservasPorPiso,
    tendenciaOcupacao,
}) {
    const pisoDaReserva =
        reservaHojeUtilizador?.secretaria?.setor?.piso;

    const [selectedFloor, setSelectedFloor] = useState(
        pisoDaReserva?.codigo ?? pisos?.[0]?.codigo ?? '',
    );

    const [selectedEdificio, setSelectedEdificio] = useState(
        pisoDaReserva?.edificio_id ??
            edificios?.[0]?.id ??
            '',
    );

    const ocupacaoAtual = useMemo(() => {
        return (pisos ?? [])
            .flatMap((piso) => piso.setores ?? [])
            .flatMap(
                (setor) =>
                    setor.secretarias ?? [],
            )
            .reduce(
                (totais, secretaria) => {
                    const status =
                        secretaria.status === 'expira'
                            ? 'reservada'
                            : secretaria.status;

                    if (
                        Object.prototype.hasOwnProperty.call(
                            totais,
                            status,
                        )
                    ) {
                        totais[status] += 1;
                    }

                    return totais;
                },
                {
                    livre: 0,
                    reservada: 0,
                    ocupada: 0,
                    indisponivel: 0,
                },
            );
    }, [pisos]);

    const overviewByFloor = useMemo(() => {
        const porPiso = {};

        (pisos ?? []).forEach((piso) => {
            const secretarias = (piso.setores ?? []).flatMap(
                (setor) => setor.secretarias ?? [],
            );

            const contagem = secretarias.reduce(
                (totais, secretaria) => {
                    const status =
                        secretaria.status === 'expira'
                            ? 'reservada'
                            : secretaria.status;

                    if (
                        Object.prototype.hasOwnProperty.call(
                            totais,
                            status,
                        )
                    ) {
                        totais[status] += 1;
                    }

                    return totais;
                },
                {
                    livre: 0,
                    reservada: 0,
                    ocupada: 0,
                    indisponivel: 0,
                },
            );

            porPiso[piso.codigo] = {
                total: secretarias.length,
                livres: contagem.livre,
                reservadas: contagem.reservada,
                ocupadas: contagem.ocupada,
            };
        });

        return porPiso;
    }, [pisos]);

    const pisosParaFiltro = useMemo(
        () =>
            (pisos ?? [])
                .filter((piso) =>
                    (piso.setores ?? []).some(
                        (setor) =>
                            (setor.secretarias ?? [])
                                .length > 0,
                    ),
                )
                .map((piso) => ({
                    id: piso.id,
                    nome: piso.nome,
                })),
        [pisos],
    );

    const pisosComSecretarias = useMemo(
        () =>
            (pisos ?? [])
                .filter((piso) =>
                    (piso.setores ?? []).some(
                        (setor) =>
                            (setor.secretarias ?? [])
                                .length > 0,
                    ),
                )
                .map((piso) => ({
                    codigo: piso.codigo,
                    nome: piso.nome,
                })),
        [pisos],
    );

    const percentualCheckins =
        stats?.reservasHoje?.value > 0
            ? Math.round(
                  ((stats?.checkinsHoje?.value ?? 0) /
                      stats.reservasHoje.value) *
                      100,
              )
            : 0;

    return (
        <>
            <Head title="Dashboard" />

            <DashboardLayout>
                {/* Indicadores principais */}
                <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                    <StatCard
                        title="Reservas Hoje"
                        value={
                            stats?.reservasHoje?.value ?? 0
                        }
                        changePercent={
                            stats?.reservasHoje
                                ?.changePercent ?? 0
                        }
                        icon={CalendarDays}
                        color="turquesa"
                        decoracao="onda"
                    />

                    <StatCard
                        title="Check-ins realizados"
                        value={
                            stats?.checkinsHoje?.value ?? 0
                        }
                        icon={CheckCircle2}
                        color="turquesaAzulada"
                        decoracao="semiGauge"
                        ringPercentual={
                            percentualCheckins
                        }
                        textoTendencia={`${
                            stats?.checkinsHoje?.value ?? 0
                        } de ${
                            stats?.reservasHoje?.value ?? 0
                        } · ${percentualCheckins}%`}
                    />

                    <StatCard
                        title="Secretárias Livres"
                        value={
                            stats?.mesasLivres?.value ?? 0
                        }
                        changePercent={
                            stats?.mesasLivres
                                ?.changePercent ?? 0
                        }
                        icon={Armchair}
                        color="cianoAzul"
                        decoracao="colunas"
                    />

                    <StatCard
                        title="Ocupação Atual"
                        subtitulo="Todos os pisos"
                        value={`${
                            stats?.taxaOcupacao?.value ?? 0
                        }%`}
                        changePercent={
                            stats?.taxaOcupacao
                                ?.changePercent ?? 0
                        }
                        icon={PieChart}
                        color="azulClaro"
                        decoracao="anel"
                        ringPercentual={
                            stats?.taxaOcupacao
                                ?.value ?? 0
                        }
                        semMeta
                    />

                    <StatCard
                        title="Reservas Expiradas"
                        value={
                            stats
                                ?.reservasExpiradasHoje
                                ?.value ?? 0
                        }
                        changePercent={
                            stats
                                ?.reservasExpiradasHoje
                                ?.changePercent ?? 0
                        }
                        icon={TimerOff}
                        color="azulMedio"
                        decoracao="expired"
                        invertido
                        mensagemZero="Nenhuma expirou hoje"
                    />

                    <StatCard
    title="Cancelamentos"
    value={
        stats?.cancelamentosHoje?.value ?? 0
    }
    changePercent={
        stats?.cancelamentosHoje
            ?.changePercent ?? 0
    }
    icon={XCircle}
    color="azulMarinho"
    decoracao="cancelSteps"
    invertido
    mensagemZero="Nenhum cancelamento hoje"
/>
                </section>

                {/* Mapa interativo */}
                <section className="mt-6 min-w-0">
                    <OfficeMap
                        selectedFloor={
                            selectedFloor
                        }
                        setSelectedFloor={
                            setSelectedFloor
                        }
                        selectedEdificio={
                            selectedEdificio
                        }
                        setSelectedEdificio={
                            setSelectedEdificio
                        }
                        edificios={
                            edificios
                        }
                        pisos={pisos}
                        showOverview
                        overviewData={overviewByFloor}
                    />
                </section>

                {/* Gráficos imediatamente abaixo do mapa */}
                <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="min-w-0 lg:col-span-8">
                        <OccupancyTrendChart
                            data={tendenciaOcupacao}
                            pisos={pisosParaFiltro}
                        />
                    </div>

                    <div className="lg:col-span-4">
                        <ReservationsByFloorChart
                            data={reservasPorPiso}
                        />
                    </div>
                </section>

                {/* Resumos complementares */}
                <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
                    <div className="xl:col-span-4">
                        <OccupancyDonutChart
                            data={ocupacaoAtual}
                            porPiso={overviewByFloor}
                            pisos={pisosComSecretarias}
                        />
                    </div>

                    <div className="xl:col-span-8">
                        <StatisticsSummary
                            estatisticas={
                                estatisticas
                            }
                        />
                    </div>
                </section>

                {/* Atividade recente e próximas reservas */}
                <section className="mt-6 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,1fr)]">
                    <div className="min-w-0">
                        <RecentActivity
                            eventos={
                                atividadeRecente ??
                                []
                            }
                        />
                    </div>

                    <div className="min-w-0">
                        <UpcomingReservations
                            reservas={
                                proximasReservas ??
                                []
                            }
                        />
                    </div>
                </section>
            </DashboardLayout>
        </>
    );
}