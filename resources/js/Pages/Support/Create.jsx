import DashboardLayout from '@/Layouts/DashboardLayout';
import InputError from '@/Components/InputError';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Clock3, LifeBuoy } from 'lucide-react';
import { ESTADO_SUPORTE, badge } from '@/utils/estados';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const disabledFieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

export default function Create({ meusPedidos = [] }) {

    // Dados do utilizador autenticado
    const { auth } = usePage().props;

    // Formulário
    const { data, setData, post, processing, errors } = useForm({
        assunto: '',
        mensagem: '',
    });

    /** Envia o pedido de suporte.*/
    const submit = (e) => {
        e.preventDefault();
        post(route('support.store'));
    };

    return (
        <DashboardLayout>
            <Head title="Contactar Suporte" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <LifeBuoy size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Contactar Suporte
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Não encontrou a resposta que procurava? Envie-nos a sua questão e responderemos com a maior brevidade possível.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Nome</label>
                            <input type="text" value={auth.user.name} disabled className={disabledFieldClass} />
                        </div>

                        <div>
                            <label className={labelClass}>Email</label>
                            <input type="email" value={auth.user.email} disabled className={disabledFieldClass} />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="assunto" className={labelClass}>Assunto</label>
                            <select
                                id="assunto"
                                value={data.assunto}
                                onChange={(e) => setData('assunto', e.target.value)}
                                className={fieldClass}
                            >
                                <option value="">Selecione...</option>
                                <option>Reservas</option>
                                <option>Check-in</option>
                                <option>Conta</option>
                                <option>Problema Técnico</option>
                                <option>Outro</option>
                            </select>
                            <InputError message={errors.assunto} className="mt-2" />
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="mensagem" className={labelClass}>Mensagem</label>
                            <textarea
                                id="mensagem"
                                rows={6}
                                value={data.mensagem}
                                onChange={(e) => setData('mensagem', e.target.value)}
                                className={`${fieldClass} h-auto py-2`}
                            />
                            <InputError message={errors.mensagem} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'A enviar...' : 'Enviar Pedido'}
                        </button>
                    </div>
                </form>
            </section>

            {meusPedidos.length > 0 && (
                <section className="dashboard-card mt-6 overflow-hidden">
                    <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Os teus pedidos anteriores
                        </h2>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {meusPedidos.map((pedido) => (
                            <div key={pedido.id} className="p-6">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-bold text-slate-900 dark:text-white">
                                        {pedido.assunto}
                                    </p>

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                                            badge(ESTADO_SUPORTE, pedido.estado)
                                        }`}
                                    >
                                        {pedido.estado === 'Resolvido' ? (
                                            <CheckCircle2 size={13} strokeWidth={2} />
                                        ) : (
                                            <Clock3 size={13} strokeWidth={2} />
                                        )}
                                        {pedido.estado}
                                    </span>
                                </div>

                                <p className="mt-2 whitespace-pre-line text-sm text-slate-500 dark:text-slate-400">
                                    {pedido.mensagem}
                                </p>

                                {pedido.resposta && (
                                    <div className="mt-3 rounded-xl border border-teal-100 bg-teal-500/5 p-3 dark:border-teal-400/20">
                                        <p className="text-xs font-bold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                                            Resposta
                                        </p>

                                        <p className="mt-1 whitespace-pre-line text-sm text-slate-700 dark:text-slate-200">
                                            {pedido.resposta}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </DashboardLayout>
    );
}
