import { Head } from '@inertiajs/react';
import { useState } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';
import StatCard from '@/Components/Dashboard/StatCard';
import OfficeMap from '@/Components/Dashboard/OfficeMap/OfficeMap';
import ReservationCard from '@/Components/Dashboard/ReservationCard';
import RecentActivity from '@/Components/Dashboard/RecentActivity';
import StatisticsSummary from '@/Components/Dashboard/StatisticsSummary';
import UpcomingReservations from '@/Components/Dashboard/UpcomingReservations';

import {
    CalendarDays,
    CheckCircle2,
    Armchair,
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
}) {
    const [selectedFloor, setSelectedFloor] = useState(pisos?.[0]?.codigo ?? '');
    const [selectedEdificio, setSelectedEdificio] = useState(edificios?.[0]?.id ?? '');

    return (
        <>
            <Head title="Dashboard" />

            <DashboardLayout>
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    <StatCard
                        title="Reservas Hoje"
                        value={stats.reservasHoje.value}
                        changePercent={stats.reservasHoje.changePercent}
                        icon={CalendarDays}
                    />

                    <StatCard
                        title="Check-ins realizados"
                        value={stats.checkinsHoje.value}
                        changePercent={stats.checkinsHoje.changePercent}
                        icon={CheckCircle2}
                    />

                    <StatCard
                        title="Secretárias Livres"
                        value={stats.mesasLivres.value}
                        changePercent={stats.mesasLivres.changePercent}
                        icon={Armchair}
                    />

                    <StatCard
                        title="Taxa de Ocupação"
                        value={`${stats.taxaOcupacao.value}%`}
                        changePercent={stats.taxaOcupacao.changePercent}
                        icon={PieChart}
                    />

                    <StatCard
                        title="Reservas Expiradas"
                        value={stats.reservasExpiradasHoje.value}
                        changePercent={stats.reservasExpiradasHoje.changePercent}
                        icon={TimerOff}
                    />

                    <StatCard
                        title="Cancelamentos"
                        value={stats.cancelamentosHoje.value}
                        changePercent={stats.cancelamentosHoje.changePercent}
                        icon={XCircle}
                    />
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
                    <ReservationCard reserva={reservaHojeUtilizador} />

                    <OfficeMap
                        selectedFloor={selectedFloor}
                        setSelectedFloor={setSelectedFloor}
                        selectedEdificio={selectedEdificio}
                        setSelectedEdificio={setSelectedEdificio}
                        edificios={edificios}
                        pisos={pisos}
                    />
                </section>

                <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
                    <UpcomingReservations reservas={proximasReservas} />

                    <StatisticsSummary estatisticas={estatisticas} />
                </section>

                <section className="mt-6 grid grid-cols-1 gap-6">
                    <RecentActivity eventos={atividadeRecente} />
                </section>
            </DashboardLayout>
        </>
    );
}
