import { Head } from '@inertiajs/react';
import { useState } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';
import OfficeMap from '@/Components/Dashboard/OfficeMap';
import RecentActivity from '@/Components/Dashboard/RecentActivity';
import StatCard from '@/Components/Dashboard/StatCard';

import { Armchair, CheckCircle2, Users } from 'lucide-react';

export default function Funcionario({
    stats,
    atividadeRecente,
    pisos,
    edificios,
}) {
    const [selectedFloor, setSelectedFloor] = useState(pisos?.[0]?.codigo ?? '');
    const [selectedEdificio, setSelectedEdificio] = useState(edificios?.[0]?.id ?? '');

    const secretariasOcupadas = stats.totalSecretarias - stats.mesasLivres.value;

    return (
        <>
            <Head title="Dashboard" />

            <DashboardLayout>
                <section className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <StatCard
                        title="Secretárias Ocupadas"
                        value={secretariasOcupadas}
                        changePercent={null}
                        icon={Users}
                    />

                    <StatCard
                        title="Secretárias Livres"
                        value={stats.mesasLivres.value}
                        changePercent={stats.mesasLivres.changePercent}
                        icon={Armchair}
                    />

                    <StatCard
                        title="Check-ins Hoje"
                        value={stats.checkinsHoje.value}
                        changePercent={stats.checkinsHoje.changePercent}
                        icon={CheckCircle2}
                    />
                </section>

                <section className="mt-6">
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
                    <RecentActivity eventos={atividadeRecente} />
                </section>
            </DashboardLayout>
        </>
    );
}
