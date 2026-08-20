import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { HelpCircle, ArrowLeft, Plus, Folder } from 'lucide-react';
import { useState } from 'react';

export default function Edit({ faq, categorias = [] }) {
    const [criarNovaCategoria, setCriarNovaCategoria] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        pergunta: faq?.pergunta || '',
        resposta: faq?.resposta || '',
        categoria: faq?.categoria || 'Geral',
        keywords: faq?.keywords || '',
    });

    const handleNovaCategoriaChange = (e) => {
        const valor = e.target.value;
        if (valor.length > 0) {
            const formatado = valor.charAt(0).toUpperCase() + valor.slice(1);
            setData('categoria', formatado);
        } else {
            setData('categoria', '');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.faqs.update', faq.id));
    };

    return (
        <DashboardLayout>
            <Head title={`Editar FAQ #${faq?.id || ''}`} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <HelpCircle size={22} strokeWidth={1.9} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Editar FAQ
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Altere os dados da pergunta, resposta, categoria ou keywords associadas.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.faqs.index')}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        <ArrowLeft size={16} />
                        Voltar
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Categoria */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Categoria
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    setCriarNovaCategoria(!criarNovaCategoria);
                                    if (!criarNovaCategoria) setData('categoria', '');
                                }}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-500 dark:text-teal-400"
                            >
                                {criarNovaCategoria ? (
                                    <>
                                        <Folder size={14} /> Selecionar existente
                                    </>
                                ) : (
                                    <>
                                        <Plus size={14} /> Nova Categoria
                                    </>
                                )}
                            </button>
                        </div>

                        {criarNovaCategoria ? (
                            <div>
                                <input
                                    type="text"
                                    maxLength={30}
                                    placeholder="Escreva o nome da nova categoria..."
                                    value={data.categoria}
                                    onChange={handleNovaCategoriaChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    required
                                />
                                <span className="mt-1 block text-right text-xs text-slate-400">
                                    Caracteres: {data.categoria.length}/30
                                </span>
                            </div>
                        ) : (
                            <select
                                value={data.categoria}
                                onChange={(e) => setData('categoria', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                required
                            >
                                {(categorias || []).map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.categoria && (
                            <p className="mt-1 text-xs text-rose-500">{errors.categoria}</p>
                        )}
                    </div>

                    {/* Pergunta */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Pergunta
                        </label>
                        <input
                            type="text"
                            value={data.pergunta}
                            onChange={(e) => setData('pergunta', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            required
                        />
                        {errors.pergunta && (
                            <p className="mt-1 text-xs text-rose-500">{errors.pergunta}</p>
                        )}
                    </div>

                    {/* Resposta */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Resposta
                        </label>
                        <textarea
                            rows={5}
                            value={data.resposta}
                            onChange={(e) => setData('resposta', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            required
                        />
                        {errors.resposta && (
                            <p className="mt-1 text-xs text-rose-500">{errors.resposta}</p>
                        )}
                    </div>

                    {/* Keywords */}
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Keywords (separadas por vírgula)
                        </label>
                        <input
                            type="text"
                            placeholder="ex: reserva, horários, cancelar"
                            value={data.keywords}
                            onChange={(e) => setData('keywords', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-slate-400">
                            Estas palavras ajudam o Bot do chat a identificar esta FAQ.
                        </p>
                        {errors.keywords && (
                            <p className="mt-1 text-xs text-rose-500">{errors.keywords}</p>
                        )}
                    </div>

                    {/* Submeter */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:opacity-50"
                        >
                            {processing ? 'A guardar...' : 'Guardar Alterações'}
                        </button>
                    </div>
                </form>
            </section>
        </DashboardLayout>
    );
}
