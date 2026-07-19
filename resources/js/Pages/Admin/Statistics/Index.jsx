import DashboardLayout from '@/Layouts/DashboardLayout';
import StatisticsPanel from '@/Components/Dashboard/StatisticsPanel';
import PrintHeader from '@/Components/Admin/PrintHeader';
import PrintFooter from '@/Components/Admin/PrintFooter';
import PrintButton from '@/Components/Admin/PrintButton';
import { Head } from '@inertiajs/react';

const PERIODO_LABELS = {
    geral: 'Geral',
    semana: 'Esta semana',
    mes: 'Este mês',
};

export default function Index({ estatisticas, periodo, geradoEm }) {
    return (
        <DashboardLayout>
            <Head title="Estatísticas" />

            <PrintHeader
                title="Relatório de Estatísticas"
                subtitle={`Período: ${PERIODO_LABELS[periodo] ?? periodo}`}
                geradoEm={geradoEm}
            />

            <PrintButton />

            <StatisticsPanel
                estatisticas={estatisticas}
                periodo={periodo}
                periodoRoute="admin.statistics.index"
            />

            <PrintFooter geradoEm={geradoEm} />
        </DashboardLayout>
    );
}
