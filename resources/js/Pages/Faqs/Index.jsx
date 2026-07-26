import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { HelpCircle, Search } from 'lucide-react';
import { useState } from 'react';

export default function Index({ faqs }) {

    // Texto introduzido na pesquisa
    const [pesquisa, setPesquisa] = useState('');

    // Guarda a FAQ atualmente aberta
    const [faqAberta, setFaqAberta] = useState(null);

    return (
        <DashboardLayout>
            <Head title="Help Center" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <HelpCircle size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Help Center
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Encontre respostas rápidas às perguntas mais frequentes sobre a utilização do SpaceHub.
                        </p>
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
                            placeholder="Pesquisar uma pergunta..."
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                    </div>

                    {/* FAQs */}
                    {Object.keys(faqs).map((categoria) => {

                        // Filtra apenas as FAQs que correspondem à pesquisa
                        const faqsFiltradas = faqs[categoria].filter((faq) =>

                            faq.pergunta.toLowerCase().includes(pesquisa.toLowerCase()) ||
                            faq.resposta.toLowerCase().includes(pesquisa.toLowerCase())

                        );

                        // Não apresenta categorias sem resultados
                        if (faqsFiltradas.length === 0) {
                            return null;
                        }

                        return (
                            <div key={categoria} className="mb-8">
                                <h4 className="mb-4 border-b border-slate-100 pb-2 text-lg font-bold text-teal-600 dark:border-slate-800 dark:text-teal-400">
                                    {categoria}
                                </h4>
                                {faqsFiltradas.map((faq) => (
                                    <div
                                        key={faq.id}
                                        className="mb-3 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800"
                                    >
                                        {/* Pergunta */}
                                        <button
                                            onClick={() => setFaqAberta(faqAberta === faq.id ? null : faq.id)}
                                            className="flex w-full items-center justify-between bg-white p-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <span>{faq.pergunta}</span>
                                            <span className="text-xl text-teal-500">
                                                {faqAberta === faq.id ? '−' : '+'}
                                            </span>
                                        </button>

                                        {/* Resposta */}
                                        {faqAberta === faq.id && (
                                            <div className="border-t border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                                    {faq.resposta}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );
                    })}

                    {/* Contactar Suporte */}
                    <div className="mt-10 rounded-2xl border border-teal-500/20 bg-teal-500/5 p-8 text-center">
                        <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                            Ainda precisa de ajuda?
                        </h3>
                        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                            A nossa equipa está disponível para o ajudar.
                        </p>
                        <Link
                            href={route('support.create')}
                            className="inline-block rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
                        >
                            Contactar Suporte
                        </Link>
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
}
