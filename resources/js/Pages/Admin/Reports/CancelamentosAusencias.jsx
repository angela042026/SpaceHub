import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import PrintHeader from '@/Components/Admin/PrintHeader';
import PrintFooter from '@/Components/Admin/PrintFooter';
import PrintButton from '@/Components/Admin/PrintButton';
import { Head, useForm } from '@inertiajs/react';
import { CircleX } from 'lucide-react';

export default function CancelamentosAusencias({ reservas, estados, setores, filters, geradoEm }) {
    const { data, setData, get } = useForm({
        data_inicio: filters.data_inicio ?? '',
        data_fim: filters.data_fim ?? '',
        estado_reserva_id: filters.estado_reserva_id ?? '',
        utilizador: filters.utilizador ?? '',
        setor_id: filters.setor_id ?? '',
    });

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.reports.cancelamentos'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            key: 'data',
            label: 'Data',
            render: (reserva) => new Date(reserva.data).toLocaleDateString('pt-PT'),
        },
        {
            key: 'user',
            label: 'Utilizador',
            render: (reserva) => reserva.user?.name ?? '-',
        },
        {
            key: 'secretaria',
            label: 'Secretária',
            render: (reserva) => reserva.secretaria?.codigo ?? '-',
        },
        {
            key: 'localizacao',
            label: 'Localização',
            render: (reserva) => {
                const setor = reserva.secretaria?.setor;
                return [setor?.piso?.edificio?.nome, setor?.piso?.nome, setor?.nome]
                    .filter(Boolean)
                    .join(' / ') || '-';
            },
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (reserva) => reserva.estado_reserva?.nome ?? '-',
        },
        {
            key: 'observacoes',
            label: 'Observações',
            render: (reserva) => reserva.observacoes || '-',
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Relatório de Cancelamentos e Ausências" />

            <PrintHeader
                title="Relatório de Cancelamentos e Ausências"
                subtitle={`${reservas.total} registo${reservas.total === 1 ? '' : 's'} listado${reservas.total === 1 ? '' : 's'}`}
                geradoEm={geradoEm}
            />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CircleX size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Relatório de Cancelamentos e Ausências
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {reservas.total} registo{reservas.total === 1 ? '' : 's'} encontrado{reservas.total === 1 ? '' : 's'}.
                            </p>
                        </div>
                    </div>

                    <div className="-mb-5">
                        <PrintButton />
                    </div>
                </div>

                <form
                    onSubmit={pesquisar}
                    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 print:hidden dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_160px_1fr_160px_auto]"
                >
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">De</label>
                        <input
                            type="date"
                            value={data.data_inicio}
                            onChange={(event) => setData('data_inicio', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Até</label>
                        <input
                            type="date"
                            value={data.data_fim}
                            onChange={(event) => setData('data_fim', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Estado</label>
                        <select
                            value={data.estado_reserva_id}
                            onChange={(event) => setData('estado_reserva_id', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="">Todos</option>
                            {estados.map((estado) => (
                                <option key={estado.id} value={estado.id}>{estado.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Utilizador</label>
                        <input
                            type="text"
                            placeholder="Nome do utilizador"
                            value={data.utilizador}
                            onChange={(event) => setData('utilizador', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-500">Setor</label>
                        <select
                            value={data.setor_id}
                            onChange={(event) => setData('setor_id', event.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        >
                            <option value="">Todos</option>
                            {setores.map((setor) => (
                                <option key={setor.id} value={setor.id}>{setor.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="h-11 w-full rounded-xl bg-navy-900 px-4 text-sm font-bold text-white transition hover:bg-navy-950 sm:w-auto"
                        >
                            Filtrar
                        </button>
                    </div>
                </form>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={reservas.data}
                        emptyMessage="Nenhum cancelamento ou ausência encontrado para os filtros selecionados."
                    />

                    <Pagination pagination={reservas} itemLabel="registos" />
                </div>
            </section>

            <PrintFooter geradoEm={geradoEm} />
        </DashboardLayout>
    );
}
