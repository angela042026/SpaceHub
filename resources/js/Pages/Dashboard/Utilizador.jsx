import { Head } from '@inertiajs/react';
import { useState } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';
import OfficeMap from '@/Components/Dashboard/OfficeMap/OfficeMap';
import ReservationCard from '@/Components/Dashboard/ReservationCard';
import UpcomingReservations from '@/Components/Dashboard/UpcomingReservations';

export default function Utilizador({
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

                <section className="mt-6">
                    <UpcomingReservations reservas={proximasReservas} />
                </section>
            </DashboardLayout>
        </>
    );
}
