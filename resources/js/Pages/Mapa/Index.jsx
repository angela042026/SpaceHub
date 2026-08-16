import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Map as MapIcon } from 'lucide-react';

import DashboardLayout from '@/Layouts/DashboardLayout';
import OfficeMap from '@/Components/Dashboard/OfficeMap/OfficeMap';

export default function Index({ pisos, edificios }) {
    const { t } = useTranslation('mapa');
    const [selectedFloor, setSelectedFloor] = useState(pisos?.[0]?.codigo ?? '');
    const [selectedEdificio, setSelectedEdificio] = useState(edificios?.[0]?.id ?? '');

    return (
        <>
            <Head title={t('tituloPagina')} />

            <DashboardLayout>
                <OfficeMap
                    mostrarTudo
                    somenteMapa
                    reservarAoSelecionar
                    tamanhoMapa="grande"
                    iconeTitulo={MapIcon}
                    tituloDestaque
                    titulo={t('titulo')}
                    subtitulo={t('subtitulo')}
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
