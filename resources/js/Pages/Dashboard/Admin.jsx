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
    proximasReservas,
    reservasPorPiso,
}) {
    const [selectedFloor, setSelectedFloor] = useState(
        pisos?.[0]?.codigo ?? '',
    );

    const [selectedEdificio, setSelectedEdificio] = useState(
        edificios?.[0]?.id ?? '',
    );

    const ocupacaoAtual = useMemo(() => {
        return (pisos ?? [])
            .flatMap((piso) => piso.setores ?? [])
            .flatMap((setor) => setor.secretarias ?? [])
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

    return (
        <>
            <Head title="Dashboard" />

            <DashboardLayout>
                {/* Indicadores principais */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    <StatCard
                        title="Reservas Hoje"
                        value={stats?.reservasHoje?.value ?? 0}
                        changePercent={
                            stats?.reservasHoje
                                ?.changePercent ?? 0
                        }
                        icon={CalendarDays}
                    />

                    <StatCard
                        title="Check-ins realizados"
                        value={stats?.checkinsHoje?.value ?? 0}
                        changePercent={
                            stats?.checkinsHoje
                                ?.changePercent ?? 0
                        }
                        icon={CheckCircle2}
                    />

                    <StatCard
                        title="Secretárias Livres"
                        value={stats?.mesasLivres?.value ?? 0}
                        changePercent={
                            stats?.mesasLivres
                                ?.changePercent ?? 0
                        }
                        icon={Armchair}
                    />

                    <StatCard
                        title="Taxa de Ocupação"
                        value={`${stats?.taxaOcupacao?.value ?? 0
                            }%`}
                        changePercent={
                            stats?.taxaOcupacao
                                ?.changePercent ?? 0
                        }
                        icon={PieChart}
                    />

                    <StatCard
                        title="Reservas Expiradas"
                        value={
                            stats?.reservasExpiradasHoje
                                ?.value ?? 0
                        }
                        changePercent={
                            stats?.reservasExpiradasHoje
                                ?.changePercent ?? 0
                        }
                        icon={TimerOff}
                    />

                    <StatCard
                        title="Cancelamentos"
                        value={
                            stats?.cancelamentosHoje?.value ??
                            0
                        }
                        changePercent={
                            stats?.cancelamentosHoje
                                ?.changePercent ?? 0
                        }
                        icon={XCircle}
                    />
                </section>

                {/* Mapa e gráficos laterais */}
                <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
                    <div className="min-w-0 xl:col-span-8">
                        <OfficeMap
                            selectedFloor={selectedFloor}
                            setSelectedFloor={
                                setSelectedFloor
                            }
                            selectedEdificio={
                                selectedEdificio
                            }
                            setSelectedEdificio={
                                setSelectedEdificio
                            }
                            edificios={edificios}
                            pisos={pisos}
                            variant="dashboard"
                        />
                    </div>

                    <aside className="grid content-start gap-6 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
                        <OccupancyDonutChart
                            data={ocupacaoAtual}
                            taxaOcupacao={
                                stats?.taxaOcupacao?.value ??
                                0
                            }
                        />

                        <ReservationsByFloorChart
                            data={reservasPorPiso ?? []}
                        />
                    </aside>
                </section>

                {/* Evolução da ocupação e resumo estatístico */}
                <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
                    <div className="min-w-0 xl:col-span-8">
                        <OccupancyTrendChart />
                    </div>

                    <div className="xl:col-span-4">
                        <StatisticsSummary
                            estatisticas={estatisticas}
                        />
                    </div>
                </section>

                {/* Atividade recente e próximas reservas */}
                <section className="mt-6 grid grid-cols-1 items-stretch gap-6 xl:grid-cols-12">
                    <div className="min-w-0 xl:col-span-8">
                        <RecentActivity
                            eventos={atividadeRecente ?? []}
                        />
                    </div>

                    <div className="xl:col-span-4">
                        <UpcomingReservations
                            reservas={proximasReservas ?? []}
                        />
                    </div>
                </section>
            </DashboardLayout>
        </>
    );
}
