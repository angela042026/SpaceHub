import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function Edit({ edificio }) {
    const { t } = useTranslation('admin');
    const [preview, setPreview] = useState(null);

    const { data, setData, put, processing, errors } = useForm({
        nome: edificio.nome ?? '',
        codigo: edificio.codigo ?? '',
        morada: edificio.morada ?? '',
        codigo_postal: edificio.codigo_postal ?? '',
        cidade: edificio.cidade ?? '',
        pais: edificio.pais ?? '',
        telefone: edificio.telefone ?? '',
        email: edificio.email ?? '',
        imagem: null,
        hora_abertura: edificio.hora_abertura ?? '',
        hora_fecho: edificio.hora_fecho ?? '',
        descricao: edificio.descricao ?? '',
    });

    const handleImagem = (event) => {
        const file = event.target.files?.[0] ?? null;

        setData('imagem', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('admin.edificios.update', edificio.id), { forceFormData: true });
    };

    return (
        <DashboardLayout>
            <Head title={t('edificios.edit.headTitle', { nome: edificio.nome })} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Pencil size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('edificios.edit.titulo')}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {edificio.nome}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="nome" className={labelClass}>{t('campos.nome')}</label>
                            <input id="nome" type="text" value={data.nome} onChange={(e) => setData('nome', e.target.value)} autoFocus required className={fieldClass} />
                            <InputError message={errors.nome} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="codigo" className={labelClass}>{t('campos.codigo')}</label>
                            <input id="codigo" type="text" value={data.codigo} onChange={(e) => setData('codigo', e.target.value)} required className={fieldClass} />
                            <InputError message={errors.codigo} className="mt-2" />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="morada" className={labelClass}>{t('campos.morada')}</label>
                            <input id="morada" type="text" value={data.morada} onChange={(e) => setData('morada', e.target.value)} required className={fieldClass} />
                            <InputError message={errors.morada} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="codigo_postal" className={labelClass}>{t('campos.codigoPostal')}</label>
                            <input id="codigo_postal" type="text" value={data.codigo_postal} onChange={(e) => setData('codigo_postal', e.target.value)} className={fieldClass} />
                            <InputError message={errors.codigo_postal} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="cidade" className={labelClass}>{t('campos.cidade')}</label>
                            <input id="cidade" type="text" value={data.cidade} onChange={(e) => setData('cidade', e.target.value)} required className={fieldClass} />
                            <InputError message={errors.cidade} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="pais" className={labelClass}>{t('campos.pais')}</label>
                            <input id="pais" type="text" value={data.pais} onChange={(e) => setData('pais', e.target.value)} className={fieldClass} />
                            <InputError message={errors.pais} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="telefone" className={labelClass}>{t('campos.telefone')}</label>
                            <input id="telefone" type="text" value={data.telefone} onChange={(e) => setData('telefone', e.target.value)} className={fieldClass} />
                            <InputError message={errors.telefone} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="email" className={labelClass}>{t('campos.email')}</label>
                            <input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className={fieldClass} />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="hora_abertura" className={labelClass}>{t('campos.horaAbertura')}</label>
                            <input id="hora_abertura" type="time" value={data.hora_abertura ?? ''} onChange={(e) => setData('hora_abertura', e.target.value)} className={fieldClass} />
                            <InputError message={errors.hora_abertura} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="hora_fecho" className={labelClass}>{t('campos.horaFecho')}</label>
                            <input id="hora_fecho" type="time" value={data.hora_fecho ?? ''} onChange={(e) => setData('hora_fecho', e.target.value)} className={fieldClass} />
                            <InputError message={errors.hora_fecho} className="mt-2" />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="imagem" className={labelClass}>{t('campos.imagem')}</label>
                            <label htmlFor="imagem" className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-sm text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700">
                                <ImagePlus size={16} strokeWidth={1.9} />
                                {data.imagem ? data.imagem.name : t('campos.trocarFicheiro')}
                            </label>
                            <input id="imagem" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImagem} className="hidden" />
                            <InputError message={errors.imagem} className="mt-2" />

                            {(preview || edificio.imagem_url) && (
                                <img
                                    src={preview ?? edificio.imagem_url}
                                    alt={t('edificios.edit.imagemAlt', { nome: edificio.nome })}
                                    className="mt-3 h-32 w-full rounded-xl object-cover"
                                />
                            )}
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="descricao" className={labelClass}>{t('campos.descricao')}</label>
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
                            {processing ? t('form.aGuardar') : t('form.guardarAlteracoes')}
                        </button>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            <ArrowLeft size={16} strokeWidth={1.9} />
                            {t('form.cancelar')}
                        </button>
                    </div>
                </form>
            </section>
        </DashboardLayout>
    );
}
