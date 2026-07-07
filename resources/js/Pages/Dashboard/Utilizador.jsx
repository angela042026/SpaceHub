import { Head } from '@inertiajs/react';
import Sidebar from '@/Components/Dashboard/Sidebar';
import DashboardHeader from '@/Components/Dashboard/DashboardHeader';
import OfficeMap from '@/Components/Dashboard/OfficeMap';
import ReservationTodayCard from '@/Components/Dashboard/ReservationTodayCard';
import UpcomingReservations from '@/Components/Dashboard/UpcomingReservations';
import { useState } from 'react';

export default function Utilizador({ stats }) {
    const [selectedFloor, setSelectedFloor] = useState('piso0');

    return (
        <>
            <Head title="Dashboard Utilizador" />

            <div className="min-h-screen bg-[#F8FAFC]">
                <Sidebar />

                <main className="min-h-screen lg:pl-72">
                    <div className="mx-auto max-w-[1600px] px-8 py-7">
                        <DashboardHeader />

                        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
                            <ReservationTodayCard />

                            <OfficeMap
                                selectedFloor={selectedFloor}
                                setSelectedFloor={setSelectedFloor}
                            />
                        </section>

                        <section className="mt-6">
                            <UpcomingReservations />
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}
