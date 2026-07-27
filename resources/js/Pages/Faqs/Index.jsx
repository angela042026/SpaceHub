import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    HelpCircle,
    Search,
    Mail,
    ShieldCheck,
    MessageCircleMore,
    ArrowRight,
    Headphones,
} from 'lucide-react';
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
                                <h4 className="mb-4 text-lg font-bold text-teal-600 dark:text-teal-400">
                                    {categoria}
                                </h4>
                                {faqsFiltradas.map((faq) => (
                                    <div
                                        key={faq.id}
                                        className="mb-3 overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-800/60"
                                    >
                                        {/* Pergunta */}
                                        <button
                                            onClick={() => setFaqAberta(faqAberta === faq.id ? null : faq.id)}
                                            className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                                        >
                                            <span>{faq.pergunta}</span>
                                            <span className="text-xl font-light text-teal-500">
                                                {faqAberta === faq.id ? '−' : '+'}
                                            </span>
                                        </button>

                                        {/* Resposta */}
                                        {faqAberta === faq.id && (
                                            <div className="border-t border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
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

                    {/* Painel de Suporte / Contacto */}
                    <div className="relative mt-12 overflow-hidden rounded-2xl border border-teal-500/30 bg-slate-50/50 p-6 dark:bg-slate-800/20 md:p-8">
                        {/* Padrão decorativo de pontos (canto superior direito) */}
                        <div className="pointer-events-none absolute right-4 top-4 hidden grid-cols-5 gap-1.5 opacity-25 md:grid">
                            {[...Array(15)].map((_, i) => (
                                <div key={i} className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                            ))}
                        </div>

                        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
                            {/* Lado esquerdo (Ainda precisa de ajuda?) */}
                            <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left lg:col-span-5 lg:border-r lg:border-slate-200/80 lg:pr-8 dark:lg:border-slate-700/60">
                                {/* Ilustração / Ícone do Headset */}
                                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-teal-100/60 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                                    <Headphones size={42} strokeWidth={1.8} />
                                    <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500 text-white shadow">
                                        <MessageCircleMore size={18} />
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
                                        Ainda precisa de ajuda?
                                    </h3>
                                    <p className="mb-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                        A nossa equipa está disponível para o ajudar sempre que precisar.
                                    </p>
                                    <Link
                                        href={route('support.create')}
                                        className="inline-flex items-center gap-2 rounded-xl bg-[#1E3A5F] px-5 py-2.5 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
                                    >
                                        Contactar Suporte
                                        <ArrowRight size={14} strokeWidth={2} />
                                    </Link>
                                </div>
                            </div>

                            {/* Lado direito (Cards de Benefícios) */}
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:col-span-7">
                                {/* Resposta rápida */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100/60 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                                        <Mail size={18} />
                                    </div>
                                    <h4 className="mb-1 text-xs font-bold text-slate-900 dark:text-white">
                                        Resposta rápida
                                    </h4>
                                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                        Respondemos o mais rápido possível.
                                    </p>
                                </div>

                                {/* Apoio personalizado */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100/60 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                                        <MessageCircleMore size={18} />
                                    </div>
                                    <h4 className="mb-1 text-xs font-bold text-slate-900 dark:text-white">
                                        Apoio personalizado
                                    </h4>
                                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                        Ajudamos a resolver qualquer questão.
                                    </p>
                                </div>

                                {/* Seguro e confiável */}
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-teal-100/60 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <h4 className="mb-1 text-xs font-bold text-slate-900 dark:text-white">
                                        Seguro e confiável
                                    </h4>
                                    <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                        Os seus dados estão sempre protegidos.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </DashboardLayout>
    );
}