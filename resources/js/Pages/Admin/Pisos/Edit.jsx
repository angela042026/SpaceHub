import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, Pencil } from 'lucide-react';
import { useState } from 'react';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function Edit({ piso, edificios }) {
    const [preview, setPreview] = useState(null);

    const { data, setData, put, processing, errors } = useForm({
        edificio_id: piso.edificio_id ?? '',
        nome: piso.nome ?? '',
        codigo: piso.codigo ?? '',
        numero: piso.numero ?? '',
        planta: null,
        descricao: piso.descricao ?? '',
    });

    const handlePlanta = (event) => {
        const file = event.target.files?.[0] ?? null;

        setData('planta', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('admin.pisos.update', piso.id), { forceFormData: true });
    };

    return (
        <DashboardLayout>
            <Head title={`Editar ${piso.nome}`} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Pencil size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Editar piso
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {piso.nome}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="edificio_id" className={labelClass}>Edifício</label>
                            <select
                                id="edificio_id"
                                value={data.edificio_id}
                                onChange={(e) => setData('edificio_id', e.target.value)}
                                required
                                className={fieldClass}
                            >
                                {edificios.map((edificio) => (
                                    <option key={edificio.id} value={edificio.id}>{edificio.nome}</option>
                                ))}
                            </select>
                            <InputError message={errors.edificio_id} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="nome" className={labelClass}>Nome</label>
                            <input id="nome" type="text" value={data.nome} onChange={(e) => setData('nome', e.target.value)} autoFocus required className={fieldClass} />
                            <InputError message={errors.nome} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="codigo" className={labelClass}>Código</label>
                            <input id="codigo" type="text" value={data.codigo} onChange={(e) => setData('codigo', e.target.value)} required className={fieldClass} />
                            <InputError message={errors.codigo} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="numero" className={labelClass}>Número</label>
                            <input id="numero" type="number" value={data.numero} onChange={(e) => setData('numero', e.target.value)} required className={fieldClass} />
                            <InputError message={errors.numero} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="planta" className={labelClass}>Planta (imagem)</label>
                            <label
                                htmlFor="planta"
                                className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-sm text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                            >
                                <ImagePlus size={16} strokeWidth={1.9} />
                                {data.planta ? data.planta.name : 'Trocar ficheiro'}
                            </label>
                            <input id="planta" type="file" accept="image/png,image/jpeg,image/webp" onChange={handlePlanta} className="hidden" />
                            <InputError message={errors.planta} className="mt-2" />
                        </div>

                        {(preview || piso.planta_url) && (
                            <div className="sm:col-span-2">
                                <img
                                    src={preview ?? piso.planta_url}
                                    alt={`Planta do ${piso.nome}`}
                                    className="max-h-48 rounded-xl border border-slate-200 object-contain dark:border-slate-700"
                                />
                            </div>
                        )}

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
                            {processing ? 'A guardar...' : 'Guardar alterações'}
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
