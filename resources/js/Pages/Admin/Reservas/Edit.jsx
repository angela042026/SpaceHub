import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil, UserRound } from 'lucide-react';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function Edit({ reserva, secretarias, periodos, pisos, setores }) {

    const [pisoId, setPisoId] = useState(String(reserva.secretaria.setor.piso_id));
    const [setorId, setSetorId] = useState(String(reserva.secretaria.setor_id));

    const [secretariasDisponiveis, setSecretariasDisponiveis] = useState(
        secretarias.filter((s) => String(s.setor_id) === String(reserva.secretaria.setor_id))
    );

    const { data, setData, put, processing, errors } = useForm({
        data: reserva.data,
        periodo_id: String(reserva.periodo_id),
        secretaria_id: String(reserva.secretaria_id),
        observacoes: reserva.observacoes ?? '',
    });

    const setoresDoPiso = setores.filter(
        (setor) => String(setor.piso_id) === String(pisoId)
    );

    const selecionarPiso = (value) => {
        setPisoId(value);
        setSetorId('');
        setData('secretaria_id', '');
    };

    const selecionarSetor = (value) => {
        setSetorId(value);
        setData('secretaria_id', '');
    };

    useEffect(() => {

        if (!data.data || !data.periodo_id || !setorId) {
            setSecretariasDisponiveis([]);
            return;
        }

        fetch(route('reservas.availability', {
            data: data.data,
            periodo_id: data.periodo_id,
            setor_id: setorId,
        }), {
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erro ao consultar disponibilidade.');
                }

                return response.json();
            })
            .then((disponiveis) => {

                const jaIncluida = disponiveis.some((s) => String(s.id) === data.secretaria_id);

                if (!jaIncluida) {
                    const atual = secretarias.find((s) => String(s.id) === data.secretaria_id);

                    if (atual) {
                        disponiveis = [...disponiveis, atual];
                    }
                }

                setSecretariasDisponiveis(disponiveis);
            })
            .catch((error) => {
                console.error(error);
            });

    }, [data.data, data.periodo_id, setorId]);

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.reservas.update', reserva.id));
    };

    return (
        <DashboardLayout>
            <Head title="Editar Reserva" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Pencil size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Editar Reserva
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Altera a data, o período ou o espaço desta reserva.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
                        <UserRound size={17} strokeWidth={1.9} />
                    </div>

                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {reserva.user?.name ?? '-'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {reserva.user?.email ?? '-'}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                            <InputError message={errors.data} className="mt-2" />
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
                            <InputError message={errors.periodo_id} className="mt-2" />
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
                            <label htmlFor="setor_id" className={labelClass}>Categoria do Espaço</label>
                            <select
                                id="setor_id"
                                value={setorId}
                                onChange={(e) => selecionarSetor(e.target.value)}
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

                        <div className="sm:col-span-2">
                            <label htmlFor="secretaria_id" className={labelClass}>Lugar</label>
                            <select
                                id="secretaria_id"
                                value={data.secretaria_id}
                                onChange={(e) => setData('secretaria_id', e.target.value)}
                                disabled={!setorId}
                                required
                                className={fieldClass}
                            >
                                <option value="" disabled>
                                    {setorId ? 'Selecione...' : 'Selecione primeiro a categoria'}
                                </option>

                                {secretariasDisponiveis.map((secretaria) => (
                                    <option key={secretaria.id} value={secretaria.id}>
                                        {secretaria.codigo} — {secretaria.descricao}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.secretaria_id} className="mt-2" />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="observacoes" className={labelClass}>Observações</label>
                            <textarea
                                id="observacoes"
                                rows={4}
                                value={data.observacoes}
                                onChange={(e) => setData('observacoes', e.target.value)}
                                className={`${fieldClass} h-auto py-2.5`}
                            />
                            <InputError message={errors.observacoes} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'A guardar...' : 'Guardar Alterações'}
                        </button>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            <ArrowLeft size={16} strokeWidth={1.9} />
                            Cancelar
                        </button>
                    </div>
                </form>
            </section>
        </DashboardLayout>
    );
}
