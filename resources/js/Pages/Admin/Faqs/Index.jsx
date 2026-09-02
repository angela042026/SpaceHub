import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Edit, HelpCircle, Plus } from 'lucide-react';

export default function Index({ faqs = {} }) {
    const faqGroups = Object.entries(faqs || {});

    return (
        <DashboardLayout>
            <Head title="FAQs" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <HelpCircle size={22} strokeWidth={1.9} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">FAQs</h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Consulte e edite as perguntas frequentes.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('admin.faqs.create')}
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-500"
                    >
                        <Plus size={16} />
                        Nova FAQ
                    </Link>
                </div>

                <div className="space-y-6 p-6">
                    {faqGroups.map(([categoria, items]) => (
                        <div key={categoria || 'sem-categoria'}>
                            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-600 dark:text-teal-400">
                                {categoria || 'Sem categoria'}
                            </h2>
                            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                                {items.map((faq) => (
                                    <div
                                        key={faq.id}
                                        className="flex items-center justify-between gap-4 p-4"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-800 dark:text-slate-100">
                                                {faq.pergunta}
                                            </p>
                                            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                                                {faq.resposta}
                                            </p>
                                        </div>
                                        <Link
                                            href={route('admin.faqs.edit', faq.id)}
                                            aria-label={`Editar FAQ: ${faq.pergunta}`}
                                            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                        >
                                            <Edit size={15} />
                                            Editar
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </DashboardLayout>
    );
}
