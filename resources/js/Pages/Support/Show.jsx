import DashboardLayout from '@/Layouts/DashboardLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    CornerDownRight,
    LifeBuoy,
    MessageSquare,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ESTADO_SUPORTE, badge, etiqueta } from '@/utils/estados';

export default function Show({ pedido }) {
    const { t, i18n } = useTranslation('suporte');
    const { t: tc } = useTranslation('common');

    const [aConfirmar, setAConfirmar] = useState(false);
    const [aMarcarEmAnalise, setAMarcarEmAnalise] = useState(false);
    const { data, setData, patch, processing, errors } = useForm({
        resposta: pedido.resposta ?? '',
    });

    const resolvido = pedido.estado === 'Resolvido';
    const pendente = pedido.estado === 'Pendente';

    const marcarResolvido = () => {
        patch(route('support.update', pedido.id), {
            preserveScroll: true,
            onFinish: () => setAConfirmar(false),
        });
    };

    const marcarEmAnalise = () => {
        setAMarcarEmAnalise(true);

        router.patch(route('support.emAnalise', pedido.id), {}, {
            preserveScroll: true,
            onFinish: () => setAMarcarEmAnalise(false),
        });
    };

    return (
        <DashboardLayout>
            <Head title={t('show.tituloPagina')} />

            <section className="dashboard-card overflow-hidden">
                <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <Link
                        href={route('support.index')}
                        className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-teal-600 dark:text-slate-500 dark:hover:text-teal-400"
                    >
                        <ArrowLeft size={13} strokeWidth={2} />
                        {t('show.voltar')}
                    </Link>

                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                                <LifeBuoy size={22} strokeWidth={1.9} />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {t('show.tituloPedido', { id: pedido.id })}
                                </h1>

                                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                    {t('show.enviadoEm', {
                                        assunto: pedido.assunto,
                                        data: new Date(pedido.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'pt-PT'),
                                    })}
                                </p>
                            </div>
                        </div>

                        <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                badge(ESTADO_SUPORTE, pedido.estado)
                            }`}
                        >
                            {resolvido && <Check size={13} strokeWidth={2.5} />}
                            {etiqueta(ESTADO_SUPORTE, pedido.estado, pedido.estado, tc)}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:grid-cols-3">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {t('show.utilizador')}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {pedido.user.name}
                        </p>
                    </div>

                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {t('show.email')}
                        </p>

                        <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {pedido.user.email}
                        </p>
                    </div>

                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {t('show.data')}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {new Date(pedido.created_at).toLocaleDateString(i18n.language === 'en' ? 'en-GB' : 'pt-PT')}
                        </p>
                    </div>
                </div>

                <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <MessageSquare size={15} strokeWidth={1.9} />

                        <p className="text-xs font-bold uppercase tracking-wide">
                            {t('show.mensagemUtilizador')}
                        </p>
                    </div>

                    <div className="mt-2.5 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                            {pedido.mensagem}
                        </p>
                    </div>
                </div>

                {pendente && (
                    <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={marcarEmAnalise}
                            disabled={aMarcarEmAnalise}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300"
                        >
                            <Wrench size={15} strokeWidth={1.9} />
                            {aMarcarEmAnalise ? t('show.aMarcar') : t('show.marcarEmAnalise')}
                        </button>
                    </div>
                )}

                <div className="px-6 py-5">
                    {resolvido ? (
                        pedido.resposta ? (
                            <>
                                <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400">
                                    <CornerDownRight size={15} strokeWidth={1.9} />

                                    <p className="text-xs font-bold uppercase tracking-wide">
                                        {t('show.respostaSuporte')}
                                    </p>
                                </div>

                                <div className="mt-2.5 rounded-xl border border-teal-100 bg-teal-500/5 p-4 dark:border-teal-400/20 dark:bg-teal-500/[0.04]">
                                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                                        {pedido.resposta}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-400">
                                {t('show.nenhumaResposta')}
                            </p>
                        )
                    ) : (
                        <>
                            <label
                                htmlFor="resposta"
                                className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400"
                            >
                                <CornerDownRight size={15} strokeWidth={1.9} />
                                {t('show.respostaSuporte')}
                            </label>

                            <textarea
                                id="resposta"
                                rows={4}
                                value={data.resposta}
                                onChange={(e) => setData('resposta', e.target.value)}
                                placeholder={t('show.respostaPlaceholder')}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            />

                            {errors.resposta && (
                                <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                                    {errors.resposta}
                                </p>
                            )}

                            <div className="mt-4">
                                <button
                                    type="button"
                                    disabled={data.resposta.trim().length < 5}
                                    onClick={() => setAConfirmar(true)}
                                    className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                >
                                    {t('show.enviarResposta')}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </section>

            <Modal show={aConfirmar} onClose={() => setAConfirmar(false)}>
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CheckCircle2 size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {t('show.confirmarTitulo')}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {t('show.confirmarTexto', { nome: pedido.user.name, assunto: pedido.assunto })}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setAConfirmar(false)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            {t('show.cancelar')}
                        </button>

                        <button
                            type="button"
                            onClick={marcarResolvido}
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? t('show.aEnviar') : t('show.enviarRespostaBotao')}
                        </button>
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}
