import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { Armchair, ArrowLeft } from 'lucide-react';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

const AMENIDADES = [
    { key: 'monitor', label: 'Monitor' },
    { key: 'dock_usb', label: 'Dock USB' },
    { key: 'junto_janela', label: 'Junto à janela' },
    { key: 'ergonomica', label: 'Cadeira ergonómica' },
];

export default function Create({ setores }) {
    const { data, setData, post, processing, errors } = useForm({
        setor_id: '',
        codigo: '',
        reservavel: true,
        monitor: false,
        dock_usb: false,
        junto_janela: false,
        ergonomica: false,
        descricao: '',
    });

    const submit = (event) => {
        event.preventDefault();
        post(route('admin.secretarias.store'));
    };

    return (
        <DashboardLayout>
            <Head title="Nova secretária" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Armchair size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Nova secretária
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Cadastra uma nova secretária associada a um setor.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="setor_id" className={labelClass}>Setor</label>
                            <select
                                id="setor_id"
                                value={data.setor_id}
                                onChange={(e) => setData('setor_id', e.target.value)}
                                required
                                className={fieldClass}
                            >
                                <option value="" disabled>Selecione um setor</option>
                                {setores.map((setor) => (
                                    <option key={setor.id} value={setor.id}>{setor.nome}</option>
                                ))}
                            </select>
                            <InputError message={errors.setor_id} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="codigo" className={labelClass}>Código</label>
                            <input id="codigo" type="text" value={data.codigo} onChange={(e) => setData('codigo', e.target.value)} autoFocus required className={fieldClass} />
                            <InputError message={errors.codigo} className="mt-2" />
                        </div>

                        <div className="flex items-end pb-2.5">
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={data.reservavel}
                                    onChange={(e) => setData('reservavel', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                />
                                Disponível para reserva
                            </label>
                        </div>

                        <div className="sm:col-span-2">
                            <p className={labelClass}>Comodidades</p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {AMENIDADES.map((amenidade) => (
                                    <label
                                        key={amenidade.key}
                                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data[amenidade.key]}
                                            onChange={(e) => setData(amenidade.key, e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                        />
                                        {amenidade.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="descricao" className={labelClass}>Descrição</label>
                            <textarea id="descricao" rows={3} value={data.descricao} onChange={(e) => setData('descricao', e.target.value)} className={`${fieldClass} h-auto py-2`} />
                            <InputError message={errors.descricao} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'A criar...' : 'Criar secretária'}
                        </button>

                        <Link
                            href={route('admin.secretarias.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            <ArrowLeft size={16} strokeWidth={1.9} />
                            Cancelar
                        </Link>
                    </div>
                </form>
            </section>
        </DashboardLayout>
    );
}
