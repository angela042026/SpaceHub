import DashboardLayout from '@/Layouts/DashboardLayout';
import Modal from '@/Components/Modal';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, LifeBuoy } from 'lucide-react';
import { useState } from 'react';

const ESTADO_BADGE = {
    Pendente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    Resolvido: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
};

export default function Show({ pedido }) {

    const [aConfirmar, setAConfirmar] = useState(false);
    const { data, setData, patch, processing, errors } = useForm({
        resposta: pedido.resposta ?? '',
    });

    const marcarResolvido = () => {
        patch(route('support.update', pedido.id), {
            preserveScroll: true,
            onFinish: () => setAConfirmar(false),
        });
    };

    return (
        <DashboardLayout>
            <Head title="Pedido de Suporte" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <LifeBuoy size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Pedido de Suporte #{pedido.id}
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Enviado por {pedido.user.name}.
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Utilizador
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {pedido.user.name}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Email
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {pedido.user.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Assunto
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {pedido.assunto}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Data
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {new Date(pedido.created_at).toLocaleDateString('pt-PT')}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Estado
                            </p>

                            <span
                                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                                    ESTADO_BADGE[pedido.estado] ??
                                    'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                {pedido.estado}
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                            Mensagem
                        </p>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                            <p className="whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">
                                {pedido.mensagem}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label htmlFor="resposta" className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                            Resposta
                        </label>

                        {pedido.estado === 'Resolvido' ? (
                            <div className="rounded-xl border border-teal-100 bg-teal-500/5 p-4 dark:border-teal-400/20">
                                <p className="whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">
                                    {pedido.resposta}
                                </p>
                            </div>
                        ) : (
                            <>
                                <textarea
                                    id="resposta"
                                    rows={4}
                                    value={data.resposta}
                                    onChange={(e) => setData('resposta', e.target.value)}
                                    placeholder="Escreve a resposta para o utilizador..."
                                    className="h-auto w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                />
                                {errors.resposta && (
                                    <p className="mt-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                                        {errors.resposta}
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        {pedido.estado === 'Pendente' ? (
                            <button
                                type="button"
                                disabled={data.resposta.trim().length < 5}
                                onClick={() => setAConfirmar(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                Enviar Resposta e Marcar como Resolvido
                            </button>
                        ) : (
                            <span className="inline-flex items-center rounded-xl bg-teal-500/10 px-5 py-3 text-sm font-bold text-teal-600 dark:text-teal-400">
                                Pedido Resolvido
                            </span>
                        )}

                        <Link
                            href={route('support.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            <ArrowLeft size={16} strokeWidth={1.9} />
                            Voltar
                        </Link>
                    </div>
                </div>

                <Modal show={aConfirmar} onClose={() => setAConfirmar(false)}>
                    <div className="p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                                <CheckCircle2 size={22} strokeWidth={1.9} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Enviar esta resposta e marcar como resolvido?
                                </h2>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    {pedido.user.name} vai receber a tua resposta e o pedido "{pedido.assunto}" passa a aparecer como resolvido. Esta ação não pode ser desfeita.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setAConfirmar(false)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={marcarResolvido}
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing ? 'A enviar...' : 'Enviar Resposta'}
                            </button>
                        </div>
                    </div>
                </Modal>
            </section>
        </DashboardLayout>
    );
}
