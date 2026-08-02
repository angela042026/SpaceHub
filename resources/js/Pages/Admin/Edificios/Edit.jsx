import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function Edit({ edificio }) {
    const { data, setData, put, processing, errors } = useForm({
        nome: edificio.nome ?? '',
        codigo: edificio.codigo ?? '',
        morada: edificio.morada ?? '',
        codigo_postal: edificio.codigo_postal ?? '',
        cidade: edificio.cidade ?? '',
        pais: edificio.pais ?? '',
        telefone: edificio.telefone ?? '',
        email: edificio.email ?? '',
        imagem: edificio.imagem ?? '',
        hora_abertura: edificio.hora_abertura ?? '',
        hora_fecho: edificio.hora_fecho ?? '',
        descricao: edificio.descricao ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        put(route('admin.edificios.update', edificio.id));
    };

    return (
        <DashboardLayout>
            <Head title={`Editar ${edificio.nome}`} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Pencil size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Editar edifício
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {edificio.nome}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

                        <div className="sm:col-span-2">
                            <label htmlFor="morada" className={labelClass}>Morada</label>
                            <input id="morada" type="text" value={data.morada} onChange={(e) => setData('morada', e.target.value)} required className={fieldClass} />
                            <InputError message={errors.morada} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="codigo_postal" className={labelClass}>Código postal</label>
                            <input id="codigo_postal" type="text" value={data.codigo_postal} onChange={(e) => setData('codigo_postal', e.target.value)} className={fieldClass} />
                            <InputError message={errors.codigo_postal} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="cidade" className={labelClass}>Cidade</label>
                            <input id="cidade" type="text" value={data.cidade} onChange={(e) => setData('cidade', e.target.value)} required className={fieldClass} />
                            <InputError message={errors.cidade} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="pais" className={labelClass}>País</label>
                            <input id="pais" type="text" value={data.pais} onChange={(e) => setData('pais', e.target.value)} className={fieldClass} />
                            <InputError message={errors.pais} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="telefone" className={labelClass}>Telefone</label>
                            <input id="telefone" type="text" value={data.telefone} onChange={(e) => setData('telefone', e.target.value)} className={fieldClass} />
                            <InputError message={errors.telefone} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="email" className={labelClass}>E-mail</label>
                            <input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={fieldClass} />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="hora_abertura" className={labelClass}>Hora de abertura</label>
                            <input id="hora_abertura" type="time" value={data.hora_abertura ?? ''} onChange={(e) => setData('hora_abertura', e.target.value)} className={fieldClass} />
                            <InputError message={errors.hora_abertura} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="hora_fecho" className={labelClass}>Hora de fecho</label>
                            <input id="hora_fecho" type="time" value={data.hora_fecho ?? ''} onChange={(e) => setData('hora_fecho', e.target.value)} className={fieldClass} />
                            <InputError message={errors.hora_fecho} className="mt-2" />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="imagem" className={labelClass}>URL da imagem</label>
                            <input id="imagem" type="text" value={data.imagem} onChange={(e) => setData('imagem', e.target.value)} className={fieldClass} />
                            <InputError message={errors.imagem} className="mt-2" />
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
