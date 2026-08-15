import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Map as MapIcon } from 'lucide-react';

import DashboardLayout from '@/Layouts/DashboardLayout';
import OfficeMap from '@/Components/Dashboard/OfficeMap/OfficeMap';

export default function Index({ pisos, edificios }) {
    const [selectedFloor, setSelectedFloor] = useState(pisos?.[0]?.codigo ?? '');
    const [selectedEdificio, setSelectedEdificio] = useState(edificios?.[0]?.id ?? '');

    return (
        <>
            <Head title="Mapa do Escritório" />

            <DashboardLayout>
                <OfficeMap
                    mostrarTudo
                    somenteMapa
                    reservarAoSelecionar
                    tamanhoMapa="grande"
                    iconeTitulo={MapIcon}
                    tituloDestaque
                    titulo="Mapa do escritório"
                    subtitulo="Selecione um piso e clique numa área para consultar as secretárias disponíveis."
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
