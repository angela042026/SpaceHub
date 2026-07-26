import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Armchair,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Pencil,
    RotateCcw,
    Search,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

const ESTADO_CLASSES = {
    pendente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    confirmada: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    cancelada: 'bg-red-500/10 text-red-600 dark:text-red-400',
    expirada: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    concluida: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

export default function Index({ reservas, estados, edificios, pisos, setores, filters }) {

    const [processingId, setProcessingId] = useState(null);

    const { data, setData, get } = useForm({
        search: filters.search ?? '',
        estado: filters.estado ?? '',
        data: filters.data ?? '',
        edificio: filters.edificio ?? '',
        piso: filters.piso ?? '',
        setor: filters.setor ?? '',
    });

    const pesquisar = (event) => {
        event.preventDefault();

        get(route('admin.reservas.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const limpar = () => {
        router.get(route('admin.reservas.index'));
    };

    const cancelarReserva = (reserva) => {
        if (!confirm(`Cancelar a reserva de ${reserva.user?.name ?? 'utilizador'}?`)) {
            return;
        }

        setProcessingId(reserva.id);

        router.patch(route('admin.reservas.cancelar', reserva.id), {}, {
            preserveScroll: true,
            onFinish: () => setProcessingId(null),
        });
    };

    const irParaPagina = (url) => {
        if (!url) {
            return;
        }

        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    const columns = [
        {
            key: 'user',
            label: 'Utilizador',
            render: (reserva) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {reserva.user?.name ?? '-'}
                    </p>
                    <p className="text-xs text-slate-400">{reserva.user?.email ?? '-'}</p>
                </div>
            ),
        },
        {
            key: 'data',
            label: 'Data',
            render: (reserva) => new Date(reserva.data).toLocaleDateString('pt-PT'),
        },
        {
            key: 'periodo',
            label: 'Período',
            render: (reserva) => reserva.periodo?.nome ?? '-',
        },
        {
            key: 'espaco',
            label: 'Espaço',
            render: (reserva) => (
                <div className="flex items-center gap-2.5">
                    {reserva.secretaria?.imagem ? (
                        <img
                            src={reserva.secretaria.imagem}
                            alt={reserva.secretaria?.codigo ?? ''}
                            className="h-9 w-9 shrink-0 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                            <Armchair size={16} strokeWidth={1.9} />
                        </div>
                    )}

                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                            {reserva.secretaria?.setor?.nome ?? '-'}
                        </p>
                        <p className="text-xs text-slate-400">
                            {reserva.secretaria?.codigo ?? '-'} · {reserva.secretaria?.setor?.piso?.edificio?.nome ?? '-'}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: 'estado',
            label: 'Estado',
            render: (reserva) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        ESTADO_CLASSES[reserva.estado_reserva?.codigo] ??
                        'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                    }`}
                >
                    {reserva.estado_reserva?.nome ?? '-'}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: 'Ações',
            align: 'right',
            render: (reserva) =>
                reserva.cancelada_at === null ? (
                    <div className="flex justify-end gap-2">
                        <Link
                            href={route('admin.reservas.edit', reserva.id)}
                            title="Editar"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                        >
                            <Pencil size={16} strokeWidth={1.9} />
                        </Link>

                        <button
                            type="button"
                            onClick={() => cancelarReserva(reserva)}
                            disabled={processingId === reserva.id}
                            title="Cancelar"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
                        >
                            {processingId === reserva.id ? (
                                <RotateCcw size={16} strokeWidth={1.9} className="animate-spin" />
                            ) : (
                                <XCircle size={16} strokeWidth={1.9} />
                            )}
                        </button>
                    </div>
                ) : (
                    <span className="text-sm text-slate-400">Sem ações</span>
                ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Reservas" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <CalendarDays size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Reservas
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {reservas.total} reserva{reservas.total === 1 ? '' : 's'} de todos os utilizadores.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={pesquisar}
                    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-6"
                >
                    <div className="relative sm:col-span-2 lg:col-span-1">
                        <Search
                            size={16}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={data.search}
                            onChange={(event) => setData('search', event.target.value)}
                            placeholder="Nome ou email"
                            className={`${fieldClass} pl-9`}
                        />
                    </div>

                    <select
                        value={data.estado}
                        onChange={(event) => setData('estado', event.target.value)}
                        className={fieldClass}
                    >
                        <option value="">Todos os estados</option>

                        {estados.map((estado) => (
                            <option key={estado.id} value={estado.codigo}>
                                {estado.nome}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        value={data.data}
                        onChange={(event) => setData('data', event.target.value)}
                        className={fieldClass}
                    />

                    <select
                        value={data.edificio}
                        onChange={(event) => setData('edificio', event.target.value)}
                        className={fieldClass}
                    >
                        <option value="">Todos os edifícios</option>

                        {edificios.map((edificio) => (
                            <option key={edificio.id} value={edificio.id}>
                                {edificio.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        value={data.piso}
                        onChange={(event) => setData('piso', event.target.value)}
                        className={fieldClass}
                    >
                        <option value="">Todos os pisos</option>

                        {pisos.map((piso) => (
                            <option key={piso.id} value={piso.id}>
                                {piso.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        value={data.setor}
                        onChange={(event) => setData('setor', event.target.value)}
                        className={fieldClass}
                    >
                        <option value="">Todos os espaços</option>

                        {setores.map((setor) => (
                            <option key={setor.id} value={setor.id}>
                                {setor.nome}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 text-sm font-bold text-white transition hover:bg-navy-950"
                        >
                            Pesquisar
                        </button>

                        <button
                            type="button"
                            onClick={limpar}
                            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:border-slate-300 dark:border-slate-700"
                        >
                            Limpar
                        </button>
                    </div>
                </form>

                <div className="p-6">
                    <Table
                        columns={columns}
                        data={reservas.data}
                        emptyMessage="Nenhuma reserva encontrada."
                    />

                    {reservas.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                Página {reservas.current_page} de {reservas.last_page}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!reservas.prev_page_url}
                                    onClick={() => irParaPagina(reservas.prev_page_url)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronLeft size={16} strokeWidth={1.9} />
                                </button>

                                <button
                                    type="button"
                                    disabled={!reservas.next_page_url}
                                    onClick={() => irParaPagina(reservas.next_page_url)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronRight size={16} strokeWidth={1.9} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}
