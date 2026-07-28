import { Head } from '@inertiajs/react';
import { useState } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';import OfficeMap from '@/Components/Dashboard/OfficeMap/OfficeMap';

export default function Index({ pisos, edificios }) {
    const [selectedFloor, setSelectedFloor] = useState(pisos?.[0]?.codigo ?? '');
    const [selectedEdificio, setSelectedEdificio] = useState(edificios?.[0]?.id ?? '');

    return (
        <>
            <Head title="Mapa do Escritório" />

            <DashboardLayout>
                <OfficeMap
                    expandido
                    selectedFloor={selectedFloor}
                    setSelectedFloor={setSelectedFloor}
                    selectedEdificio={selectedEdificio}
                    setSelectedEdificio={setSelectedEdificio}
                    edificios={edificios}
                    pisos={pisos}
                />
            </DashboardLayout>
        </>
    );
}
