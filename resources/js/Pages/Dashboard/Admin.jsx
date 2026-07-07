import { Head } from '@inertiajs/react';
import { useState } from 'react';

import Sidebar from '@/Components/Dashboard/Sidebar';
import Header from '@/Components/Dashboard/DashboardHeader';
import StatCard from '@/Components/Dashboard/StatCard';
import OfficeMap from '@/Components/Dashboard/OfficeMap';
import ReservationCard from '@/Components/Dashboard/ReservationCard';
import StatisticsPanel from '@/Components/Dashboard/StatisticsPanel';
import UpcomingReservations from '@/Components/Dashboard/UpcomingReservations';

export default function Admin({ stats, estatisticas }) {
    const [selectedFloor, setSelectedFloor] = useState('piso0');

    return (
        <>
            <Head title="Dashboard SpaceHub" />

            <div className="min-h-screen bg-[#F8FAFC]">
                <Sidebar />

                <main className="min-h-screen lg:pl-72">
                    <div className="mx-auto max-w-[1600px] px-8 py-7">
                        <Header />

                        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                            <StatCard title="Reservas Hoje" value={stats.reservasHoje} icon="📅" color="blue" change="+12% vs ontem" />
                            <StatCard title="Check-ins realizados" value={stats.checkinsHoje} icon="✅" color="green" change="+8% vs ontem" />
                            <StatCard title="Secretárias Livres" value={stats.mesasLivres} icon="🪑" color="orange" change="-5% vs ontem" />
                            <StatCard title="Taxa de Ocupação" value={`${stats.taxaOcupacao}%`} icon="◔" color="purple" change="+9% vs ontem" />
                            <StatCard title="Reservas Expiradas" value="4" icon="⏱️" color="red" change="-2% vs ontem" />
                            <StatCard title="Cancelamentos" value={stats.cancelamentosHoje} icon="×" color="slate" change="-1% vs ontem" />
                        </section>

                        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
                            <ReservationCard />

                            <OfficeMap
                                selectedFloor={selectedFloor}
                                setSelectedFloor={setSelectedFloor}
                            />
                        </section>

                        <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
                            <UpcomingReservations />

                            <StatisticsPanel estatisticas={estatisticas} />
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}
