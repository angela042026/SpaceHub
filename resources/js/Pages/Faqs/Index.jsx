import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    HelpCircle,
    Search,
    Plus,
    Pencil,
    Trash2,
    CheckCircle2,
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Index({ faqs }) {
    const { props } = usePage();
    const flash = props.flash || {};

    const [pesquisa, setPesquisa] = useState('');
    const [faqAberta, setFaqAberta] = useState(null);
    const [mensagemSucesso, setMensagemSucesso] = useState(null);

    // Escuta qualquer formato de mensagem vindo do Laravel/Inertia
    useEffect(() => {
        const mensagem =
            (typeof flash.message === 'string' ? flash.message : flash.message?.message) ||
            props.message ||
            flash.success ||
            props.success;

        if (mensagem) {
            setMensagemSucesso(mensagem);
            const timer = setTimeout(() => {
                setMensagemSucesso(null);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [flash, props]);

    // Função para eliminar FAQ
    const handleEliminar = (id) => {
        if (confirm('Tem a certeza que deseja eliminar esta FAQ?')) {
            router.delete(route('admin.faqs.destroy', id));
        }
    };

    return (
        <DashboardLayout>
            <Head title="Gestão de FAQs" />

            {/* Pop-up Verde Flutuante (Toast) Centrado */}
            {mensagemSucesso && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl bg-emerald-600 px-5 py-4 text-white shadow-xl transition-all duration-300">
                    <CheckCircle2 size={22} />
                    <span className="text-sm font-semibold">{mensagemSucesso}</span>
                </div>
            )}

            <section className="dashboard-card overflow-hidden">
                {/* Cabeçalho com Botões de Ação */}
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <HelpCircle size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Gestão do Help Center & FAQs
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Crie, edite ou remova as perguntas e respostas que alimentam o Help Center e o Bot.
                            </p>
                        </div>
                    </div>

                    {/* Botão de Ação no Topo */}
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.faqs.create')}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-500"
                        >
                            <Plus size={16} />
                            Nova FAQ
                        </Link>
                    </div>
                </div>

                <div className="p-6">
                    {/* Barra de pesquisa */}
                    <div className="relative mb-8">
                        <Search
                            size={18}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            placeholder="Pesquisar FAQs por pergunta, resposta ou keywords..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    {/* Lista de FAQs por Categoria */}
                    {Object.keys(faqs).length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            Nenhuma FAQ registada até ao momento.
                        </div>
                    ) : (
                        Object.keys(faqs).map((categoria) => {
                            const faqsFiltradas = faqs[categoria].filter((faq) =>
                                faq.pergunta.toLowerCase().includes(pesquisa.toLowerCase()) ||
                                faq.resposta.toLowerCase().includes(pesquisa.toLowerCase()) ||
                                (faq.keywords && faq.keywords.toLowerCase().includes(pesquisa.toLowerCase()))
                            );

                            if (faqsFiltradas.length === 0) return null;

                            return (
                                <div key={categoria} className="mb-8">
                                    <h4 className="mb-4 text-lg font-bold text-teal-600 dark:text-teal-400">
                                        {categoria}
                                    </h4>

                                    {faqsFiltradas.map((faq) => (
                                        <div
                                            key={faq.id}
                                            className="mb-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-800/60"
                                        >
                                            {/* Bar com Pergunta e Botões de Edição */}
                                            <div className="flex w-full items-center justify-between p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/80">
                                                <button
                                                    onClick={() => setFaqAberta(faqAberta === faq.id ? null : faq.id)}
                                                    className="flex flex-1 items-center justify-between pr-4 text-left text-sm font-semibold text-slate-800 dark:text-slate-100"
                                                >
                                                    <span>{faq.pergunta}</span>
                                                    <span className="ml-2 text-xl font-light text-teal-500">
                                                        {faqAberta === faq.id ? '−' : '+'}
                                                    </span>
                                                </button>

                                                {/* Botões de Ação na FAQ */}
                                                <div className="flex items-center gap-2 border-l border-slate-100 pl-4 dark:border-slate-700">
                                                    <Link
                                                        href={route('admin.faqs.edit', faq.id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-teal-50 hover:text-teal-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-teal-950 dark:hover:text-teal-400"
                                                        title="Editar FAQ"
                                                    >
                                                        <Pencil size={15} />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleEliminar(faq.id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-rose-950 dark:hover:text-rose-400"
                                                        title="Eliminar FAQ"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Resposta e Keywords Expandidas */}
                                            {faqAberta === faq.id && (
                                                <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                                        {faq.resposta}
                                                    </p>
                                                    {faq.keywords && (
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <span className="text-xs font-semibold text-slate-400">Keywords Bot:</span>
                                                            <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                                                                {faq.keywords}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            );
                        })
                    )}
                </div>
            </section>
        </DashboardLayout>
    );
}
