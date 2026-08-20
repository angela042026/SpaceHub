import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TIPOS_SETOR } from '@/utils/tiposSetor';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function Edit({ setor, pisos }) {
    const { t } = useTranslation('admin');
    const { data, setData, put, processing, errors } = useForm({
        piso_id: setor.piso_id ?? '',
        nome: setor.nome ?? '',
        nome_en: setor.nome_en ?? '',
        codigo: setor.codigo ?? '',
        tipo: setor.tipo ?? 'outro',
        reservavel: setor.reservavel ?? false,
        capacidade: setor.capacidade ?? '',
        descricao: setor.descricao ?? '',
    });

    const submit = (event) => {
        event.preventDefault();
        put(route('admin.setores.update', setor.id));
    };

    return (
        <DashboardLayout>
            <Head title={t('setores.edit.headTitle', { nome: setor.nome_localizado })} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Pencil size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('setores.edit.titulo')}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {setor.nome_localizado}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="piso_id" className={labelClass}>{t('campos.piso')}</label>
                            <select
                                id="piso_id"
                                value={data.piso_id}
                                onChange={(e) => setData('piso_id', e.target.value)}
                                required
                                className={fieldClass}
                            >
                                {pisos.map((piso) => (
                                    <option key={piso.id} value={piso.id}>{piso.nome}</option>
                                ))}
                            </select>
                            <InputError message={errors.piso_id} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="nome" className={labelClass}>{t('campos.nome')}</label>
                            <input id="nome" type="text" value={data.nome} onChange={(e) => setData('nome', e.target.value)} autoFocus required className={fieldClass} />
                            <InputError message={errors.nome} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="nome_en" className={labelClass}>{t('campos.nomeEn')}</label>
                            <input id="nome_en" type="text" value={data.nome_en} onChange={(e) => setData('nome_en', e.target.value)} placeholder={t('campos.nomeEnPlaceholder')} className={fieldClass} />
                            <InputError message={errors.nome_en} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="codigo" className={labelClass}>{t('campos.codigo')}</label>
                            <input id="codigo" type="text" value={data.codigo} onChange={(e) => setData('codigo', e.target.value)} required className={fieldClass} />
                            <InputError message={errors.codigo} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="tipo" className={labelClass}>{t('campos.tipo')}</label>
                            <select id="tipo" value={data.tipo} onChange={(e) => setData('tipo', e.target.value)} className={fieldClass}>
                                {TIPOS_SETOR.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>{t(tipo.label)}</option>
                                ))}
                            </select>
                            <InputError message={errors.tipo} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="capacidade" className={labelClass}>{t('campos.capacidade')}</label>
                            <input id="capacidade" type="number" min="0" value={data.capacidade} onChange={(e) => setData('capacidade', e.target.value)} className={fieldClass} />
                            <InputError message={errors.capacidade} className="mt-2" />
                        </div>

                        <div className="flex items-end pb-2.5">
                            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
                                <input
                                    type="checkbox"
                                    checked={data.reservavel}
                                    onChange={(e) => setData('reservavel', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                />
                                {t('setores.create.setorReservavel')}
                            </label>
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
