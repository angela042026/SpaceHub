import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, ImagePlus, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

const CHAVES_AMENIDADES = [
    'monitor',
    'dock_usb',
    'hdmi',
    'ergonomica',
    'junto_janela',
    'luz_natural',
    'zona_silenciosa',
    'proximo_copa',
];

export default function Edit({ secretaria, pisos, setores }) {
    const { t } = useTranslation('admin');
    const setorAtual = setores.find((setor) => setor.id === secretaria.setor_id);

    const [pisoId, setPisoId] = useState(setorAtual?.piso_id ?? '');
    const [setoresFiltrados, setSetoresFiltrados] = useState(
        setorAtual ? setores.filter((setor) => setor.piso_id === setorAtual.piso_id) : [],
    );
    const [preview, setPreview] = useState(null);

    const { data, setData, put, processing, errors } = useForm({
        setor_id: secretaria.setor_id ?? '',
        codigo: secretaria.codigo ?? '',

        reservavel: secretaria.reservavel ?? true,

        monitor: secretaria.monitor ?? false,
        dock_usb: secretaria.dock_usb ?? false,
        hdmi: secretaria.hdmi ?? false,
        ergonomica: secretaria.ergonomica ?? false,
        junto_janela: secretaria.junto_janela ?? false,
        luz_natural: secretaria.luz_natural ?? false,
        zona_silenciosa: secretaria.zona_silenciosa ?? false,
        proximo_copa: secretaria.proximo_copa ?? false,

        descricao: secretaria.descricao ?? '',
        imagem: null,
    });

    const handleImagem = (event) => {
        const file = event.target.files?.[0] ?? null;

        setData('imagem', file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    // Filtra os setores conforme o piso selecionado
    useEffect(() => {
        if (!pisoId) {
            setSetoresFiltrados([]);
            return;
        }

        setSetoresFiltrados(setores.filter((setor) => setor.piso_id == pisoId));
    }, [pisoId]);

    const alterarPiso = (novoPisoId) => {
        setPisoId(novoPisoId);

        if (novoPisoId != pisoId) {
            setData('setor_id', '');
        }
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('admin.secretarias.update', secretaria.id), { forceFormData: true });
    };

    return (
        <DashboardLayout>
            <Head title={t('secretarias.edit.headTitle', { codigo: secretaria.codigo })} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Pencil size={20} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            {t('secretarias.edit.titulo')}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {secretaria.codigo}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="piso_id" className={labelClass}>{t('campos.piso')}</label>
                            <select
                                id="piso_id"
                                value={pisoId}
                                onChange={(e) => alterarPiso(e.target.value)}
                                required
                                className={fieldClass}
                            >
                                <option value="" disabled>{t('secretarias.create.selecione')}</option>

                                {pisos.map((piso) => (
                                    <option key={piso.id} value={piso.id}>{piso.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="setor_id" className={labelClass}>{t('secretarias.create.setor')}</label>
                            <select
                                id="setor_id"
                                value={data.setor_id}
                                onChange={(e) => setData('setor_id', e.target.value)}
                                disabled={!pisoId}
                                required
                                className={fieldClass}
                            >
                                <option value="" disabled>
                                    {pisoId ? t('secretarias.create.selecione') : t('secretarias.create.selecionePrimeiroPiso')}
                                </option>

                                {setoresFiltrados.map((setor) => (
                                    <option key={setor.id} value={setor.id}>{setor.nome}</option>
                                ))}
                            </select>
                            <InputError message={errors.setor_id} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="codigo" className={labelClass}>{t('campos.codigo')}</label>
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
                                {t('secretarias.create.disponivelParaReserva')}
                            </label>
                        </div>

                        <div className="sm:col-span-2">
                            <p className={labelClass}>{t('secretarias.comodidadesTitulo')}</p>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {CHAVES_AMENIDADES.map((chave) => (
                                    <label
                                        key={chave}
                                        className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={data[chave]}
                                            onChange={(e) => setData(chave, e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                        />
                                        {t(`secretarias.comodidades.${chave}`)}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="imagem" className={labelClass}>{t('campos.imagem')}</label>
                            <label htmlFor="imagem" className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 text-sm text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700">
                                <ImagePlus size={16} strokeWidth={1.9} />
                                {data.imagem ? data.imagem.name : t('campos.trocarFicheiro')}
                            </label>
                            <input id="imagem" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImagem} className="hidden" />
                            <InputError message={errors.imagem} className="mt-2" />

                            {(preview || secretaria.imagem_url) && (
                                <img
                                    src={preview ?? secretaria.imagem_url}
                                    alt={t('secretarias.edit.imagemAlt', { codigo: secretaria.codigo })}
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
