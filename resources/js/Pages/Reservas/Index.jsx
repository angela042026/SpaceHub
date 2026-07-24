import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CalendarDays,
    CreditCard,
    ImageOff,
    Pencil,
    Plus,
    Search,
    XCircle,
} from 'lucide-react';

const ESTADO_CLASSES = {
    pendente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    confirmada: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    cancelada: 'bg-red-500/10 text-red-600 dark:text-red-400',
    expirada: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    concluida: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

export default function Index({ reservas, setores, pisos, edificios, filters }) {

    // Cancelar reserva
    const cancelarReserva = (id) => {
        if (!confirm('Tem a certeza que pretende cancelar esta reserva?')) {
            return;
        }

        router.patch(route('reservas.cancelar', id), {});
    };

    // Filtros
    const { data, setData, get } = useForm({
        estado: filters.estado ?? '',
        data: filters.data ?? '',
        setor: filters.setor ?? '',
        piso: filters.piso ?? '',
        edificio: filters.edificio ?? '',
    });

    // Pesquisar
    const pesquisar = (e) => {
        e.preventDefault();

        get(route('reservas.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Limpar filtros
    const limpar = () => {
        router.get(route('reservas.index'));
    };

    return (
        <DashboardLayout>
            <Head title="Reservas" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CalendarDays size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                As Minhas Reservas
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {reservas.length} reserva{reservas.length === 1 ? '' : 's'} encontrada{reservas.length === 1 ? '' : 's'}.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('reservas.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                    >
                        <Plus size={18} strokeWidth={2} />
                        Nova Reserva
                    </Link>
                </div>

                <form
                    onSubmit={pesquisar}
                    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-6"
                >
                    <select
                        value={data.estado}
                        onChange={(e) => setData('estado', e.target.value)}
                        className={fieldClass}
                    >
                        <option value="">Todos os estados</option>
                        <option value="pendente">Pendente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="cancelada">Cancelada</option>
                        <option value="concluida">Concluída</option>
                        <option value="expirada">Expirada</option>
                    </select>

                    <input
                        type="date"
                        value={data.data}
                        onChange={(e) => setData('data', e.target.value)}
                        className={fieldClass}
                    />

                    <select
                        value={data.edificio}
                        onChange={(e) => setData('edificio', e.target.value)}
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
                        onChange={(e) => setData('piso', e.target.value)}
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
                        onChange={(e) => setData('setor', e.target.value)}
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
                            <Search size={16} strokeWidth={2} />
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
                    {reservas.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                            <p className="text-sm text-slate-400">
                                Ainda não existem reservas.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {reservas.map((reserva) => (
                                <div
                                    key={reserva.id}
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                >
                                    {reserva.secretaria?.imagem ? (
                                        <img
                                            src={reserva.secretaria.imagem}
                                            alt={reserva.secretaria?.codigo ?? ''}
                                            className="h-40 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                                            <ImageOff size={28} strokeWidth={1.6} />
                                        </div>
                                    )}

                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">
                                                    {reserva.secretaria?.setor?.nome ?? '-'}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {reserva.secretaria?.codigo ?? '-'}
                                                </p>
                                            </div>

                                            <span
                                                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                                                    ESTADO_CLASSES[reserva.estado_reserva?.codigo] ??
                                                    'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                                                }`}
                                            >
                                                {reserva.estado_reserva?.nome ?? '-'}
                                            </span>
                                        </div>

                                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                                            {new Date(reserva.data).toLocaleDateString('pt-PT')} · {reserva.periodo?.nome ?? '-'}
                                        </p>

                                        {reserva.estado_reserva?.codigo === 'pendente' ? (
                                            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                                <Link
                                                    href={route('reservas.edit', reserva.id)}
                                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300"
                                                >
                                                    <Pencil size={16} strokeWidth={1.9} />
                                                    Editar
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => cancelarReserva(reserva.id)}
                                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:text-slate-300"
                                                >
                                                    <XCircle size={16} strokeWidth={1.9} />
                                                    Cancelar
                                                </button>

                                                {reserva.pagamento?.estado === 'pendente' && (
                                                    <Link
                                                        href={route('pagamentos.show', reserva.pagamento.id)}
                                                        className="flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-md"
                                                    >
                                                        <CreditCard size={16} strokeWidth={1.9} />
                                                        Pagar
                                                    </Link>
                                                )}

                                                {reserva.pagamento?.estado === 'pago' && (
                                                    <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                        <CreditCard size={16} strokeWidth={1.9} />
                                                        Pago
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="mt-4 text-center text-xs text-slate-400">
                                                Sem ações
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}