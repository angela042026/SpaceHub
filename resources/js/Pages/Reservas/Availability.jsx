import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Armchair, CalendarCheck2, Layers3, MapPinned, Search } from 'lucide-react';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function Availability({ periodos, pisos, setores, secretariasDisponiveis, filters }) {

    const setorAtual = setores.find((setor) => String(setor.id) === String(filters.setor_id ?? ''));

    const [pisoId, setPisoId] = useState(setorAtual ? String(setorAtual.piso_id) : '');

    const { data, setData, get, processing } = useForm({
        data: filters.data ?? '',
        periodo_id: filters.periodo_id ?? '',
        setor_id: filters.setor_id ?? '',
    });

    const setoresDoPiso = setores.filter(
        (setor) => String(setor.piso_id) === String(pisoId)
    );

    const selecionarPiso = (value) => {
        setPisoId(value);
        setData('setor_id', '');
    };

    const consultar = (e) => {
        e.preventDefault();

        get(route('reservas.availability'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const jaConsultou = secretariasDisponiveis !== null;

    return (
        <DashboardLayout>
            <Head title="Consultar Disponibilidade" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Search size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Consultar Disponibilidade
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Vê que lugares estão livres antes de fazeres a reserva.
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={consultar}
                    className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-5"
                >
                    <div>
                        <label htmlFor="data" className={labelClass}>Data</label>
                        <input
                            id="data"
                            type="date"
                            value={data.data}
                            onChange={(e) => setData('data', e.target.value)}
                            required
                            className={fieldClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="periodo_id" className={labelClass}>Período</label>
                        <select
                            id="periodo_id"
                            value={data.periodo_id}
                            onChange={(e) => setData('periodo_id', e.target.value)}
                            required
                            className={fieldClass}
                        >
                            <option value="" disabled>Selecione...</option>

                            {periodos.map((periodo) => (
                                <option key={periodo.id} value={periodo.id}>
                                    {periodo.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="piso_id" className={labelClass}>Piso</label>
                        <select
                            id="piso_id"
                            value={pisoId}
                            onChange={(e) => selecionarPiso(e.target.value)}
                            required
                            className={fieldClass}
                        >
                            <option value="" disabled>Selecione...</option>

                            {pisos.map((piso) => (
                                <option key={piso.id} value={piso.id}>
                                    {piso.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="setor_id" className={labelClass}>Categoria</label>
                        <select
                            id="setor_id"
                            value={data.setor_id}
                            onChange={(e) => setData('setor_id', e.target.value)}
                            disabled={!pisoId}
                            required
                            className={fieldClass}
                        >
                            <option value="" disabled>
                                {pisoId ? 'Selecione...' : 'Selecione primeiro o piso'}
                            </option>

                            {setoresDoPiso.map((setor) => (
                                <option key={setor.id} value={setor.id}>
                                    {setor.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 text-sm font-bold text-white transition hover:bg-navy-950 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Search size={16} strokeWidth={2} />
                            Consultar
                        </button>
                    </div>
                </form>

                <div className="p-6">
                    {!jaConsultou ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                                <Search size={23} strokeWidth={1.8} />
                            </div>

                            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
                                Escolhe data, período, piso e categoria para consultar a disponibilidade.
                            </p>
                        </div>
                    ) : secretariasDisponiveis.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                                <CalendarCheck2 size={23} strokeWidth={1.8} />
                            </div>

                            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
                                Não há lugares disponíveis para a data, período e categoria selecionados.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {secretariasDisponiveis.map((secretaria) => (
                                <article
                                    key={secretaria.id}
                                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-sm">
                                            <Armchair size={21} strokeWidth={1.9} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                                {secretaria.codigo} — {secretaria.descricao}
                                            </p>

                                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5">
                                                    <Layers3 size={14} strokeWidth={1.9} className="text-teal-500" />
                                                    {secretaria.setor?.piso?.nome ?? '-'}
                                                </span>

                                                <span className="flex items-center gap-1.5">
                                                    <MapPinned size={14} strokeWidth={1.9} className="text-teal-500" />
                                                    {secretaria.setor?.piso?.edificio?.nome} · {secretaria.setor?.nome}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href={route('reservas.create', {
                                            data: data.data,
                                            periodo_id: data.periodo_id,
                                        })}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                                    >
                                        Reservar
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}
