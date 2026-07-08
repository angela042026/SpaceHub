import { Head } from '@inertiajs/react';
import { useState } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';
import StatCard from '@/Components/Dashboard/StatCard';
import OfficeMap from '@/Components/Dashboard/OfficeMap';
import ReservationCard from '@/Components/Dashboard/ReservationCard';
import StatisticsPanel from '@/Components/Dashboard/StatisticsPanel';
import UpcomingReservations from '@/Components/Dashboard/UpcomingReservations';

export default function Admin({
    stats,
    estatisticas,
    pisos,
    reservaHojeUtilizador,
    proximasReservas,
    periodo,
}) {
    const [selectedFloor, setSelectedFloor] = useState(pisos?.[0]?.codigo ?? '');

    return (
        <>
            <Head title="Dashboard SpaceHub" />

            <DashboardLayout>
                <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <StatCard
                        title="Reservas Hoje"
                        value={stats.reservasHoje.value}
                        changePercent={stats.reservasHoje.changePercent}
                        icon="📅"
                        color="blue"
                    />
                    <StatCard
                        title="Check-ins realizados"
                        value={stats.checkinsHoje.value}
                        changePercent={stats.checkinsHoje.changePercent}
                        icon="✅"
                        color="green"
                    />
                    <StatCard
                        title="Secretárias Livres"
                        value={stats.mesasLivres.value}
                        changePercent={stats.mesasLivres.changePercent}
                        icon="🪑"
                        color="orange"
                    />
                    <StatCard
                        title="Taxa de Ocupação"
                        value={`${stats.taxaOcupacao.value}%`}
                        changePercent={stats.taxaOcupacao.changePercent}
                        icon="◔"
                        color="purple"
                    />
                    <StatCard
                        title="Reservas Expiradas"
                        value={stats.reservasExpiradasHoje.value}
                        changePercent={stats.reservasExpiradasHoje.changePercent}
                        icon="⏱️"
                        color="red"
                    />
                    <StatCard
                        title="Cancelamentos"
                        value={stats.cancelamentosHoje.value}
                        changePercent={stats.cancelamentosHoje.changePercent}
                        icon="×"
                        color="slate"
                    />
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
                    <ReservationCard reserva={reservaHojeUtilizador} />

                    <OfficeMap
                        selectedFloor={selectedFloor}
                        setSelectedFloor={setSelectedFloor}
                        pisos={pisos}
                    />
                </section>

                <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
                    <UpcomingReservations reservas={proximasReservas} />

                    <StatisticsPanel estatisticas={estatisticas} periodo={periodo} />
                </section>
            </DashboardLayout>
        </>
    );
}
