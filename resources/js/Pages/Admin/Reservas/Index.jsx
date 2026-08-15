import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import { LoadingOverlay } from '@/Components/Loading';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Armchair,
    CalendarDays,
    Pencil,
    RotateCcw,
    Search,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { ESTADO_RESERVA, badge } from '@/utils/estados';
import { resolverImagemSecretaria } from '@/utils/imagemSetor';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400';

export default function Index({ reservas, estados, edificios, pisos, setores, filters }) {

    const [processingId, setProcessingId] = useState(null);
    const [carregando, setCarregando] = useState(false);

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
            onStart: () => setCarregando(true),
            onFinish: () => setCarregando(false),
        });
    };

    const limpar = () => {
        router.get(route('admin.reservas.index'), {}, {
            onStart: () => setCarregando(true),
            onFinish: () => setCarregando(false),
        });
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
                    {resolverImagemSecretaria(reserva.secretaria) ? (
                        <img
                            src={resolverImagemSecretaria(reserva.secretaria)}
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
                        badge(ESTADO_RESERVA, reserva.estado_reserva?.codigo)
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
                            title="Editar reserva"
                            aria-label="Editar reserva"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-1 dark:border-slate-700 dark:hover:bg-teal-500/10"
                        >
                            <Pencil size={16} strokeWidth={1.9} />
                        </Link>

                        <button
                            type="button"
                            onClick={() => cancelarReserva(reserva)}
                            disabled={processingId === reserva.id}
                            title="Cancelar reserva"
                            aria-label="Cancelar reserva"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-red-500/10"
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

                <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/40">
                    <form onSubmit={pesquisar} className="space-y-4">
                        {/* Linha 1 — pesquisa principal */}
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="relative w-full lg:w-[45%]">
                                <Search
                                    size={16}
                                    strokeWidth={1.9}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={data.search}
                                    onChange={(event) => setData('search', event.target.value)}
                                    placeholder="Pesquisar por nome ou email…"
                                    className={`${fieldClass} pl-9`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2 lg:flex lg:shrink-0">
                                <button
                                    type="submit"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-bold text-white transition hover:bg-navy-950"
                                >
                                    Pesquisar
                                </button>

                                <button
                                    type="button"
                                    onClick={limpar}
                                    className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-500 transition hover:border-slate-300 dark:border-slate-700 dark:bg-transparent"
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        </div>

                        {/* Linha 2 — filtros de refinamento */}
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                            <div>
                                <label htmlFor="filtro-estado" className={labelClass}>Estado</label>
                                <select
                                    id="filtro-estado"
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
                            </div>

                            <div>
                                <label htmlFor="filtro-data" className={labelClass}>Data</label>
                                <input
                                    id="filtro-data"
                                    type="date"
                                    value={data.data}
                                    onChange={(event) => setData('data', event.target.value)}
                                    className={fieldClass}
                                />
                            </div>

                            <div>
                                <label htmlFor="filtro-edificio" className={labelClass}>Edifício</label>
                                <select
                                    id="filtro-edificio"
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
                            </div>

                            <div>
                                <label htmlFor="filtro-piso" className={labelClass}>Piso</label>
                                <select
                                    id="filtro-piso"
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
                            </div>

                            <div>
                                <label htmlFor="filtro-setor" className={labelClass}>Espaço</label>
                                <select
                                    id="filtro-setor"
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
                            </div>
                        </div>
                    </form>
                </div>

                <div className="relative p-6 pb-10">
                    <LoadingOverlay show={carregando} />

                    <Table
                        columns={columns}
                        data={reservas.data}
                        emptyMessage="Nenhuma reserva encontrada."
                    />

                    <Pagination
                        pagination={reservas}
                        disabled={carregando}
                        onStart={() => setCarregando(true)}
                        onFinish={() => setCarregando(false)}
                        itemLabel="reservas"
                    />
                </div>
            </section>
        </DashboardLayout>
    );
}
