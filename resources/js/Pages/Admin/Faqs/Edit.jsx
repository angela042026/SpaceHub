import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { HelpCircle, ArrowLeft, Plus, Folder, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const categoriaKeys = {
    'Sobre o SpaceHub': 'sobre',
    'Espaços e disponibilidade': 'espacos',
    Reservas: 'reservas',
    Pagamentos: 'pagamentos',
    'Check-in': 'checkin',
    Conta: 'conta',
    Geral: 'geral',
};

export default function Edit({ faq, categorias = [] }) {
    const { t } = useTranslation('admin');
    const traduzirCategoria = (categoria) =>
        categoriaKeys[categoria]
            ? t(`faqsAdmin.categorias.${categoriaKeys[categoria]}`)
            : categoria;
    const [criarNovaCategoria, setCriarNovaCategoria] = useState(false);

    const { data, setData, put, delete: destroy, processing, errors } = useForm({
        pergunta: faq?.pergunta || '',
        resposta: faq?.resposta || '',
        pergunta_en: faq?.pergunta_en || '',
        resposta_en: faq?.resposta_en || '',
        categoria: faq?.categoria || 'Geral',
        keywords_pt: faq?.keywords_pt || '',
        keywords_en: faq?.keywords_en || '',
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

    const handleDelete = () => {
        if (window.confirm(t('faqsAdmin.edit.confirmarEliminar'))) {
            destroy(route('admin.faqs.destroy', faq.id));
        }
    };

    return (
        <DashboardLayout>
            <Head title={t('faqsAdmin.edit.tituloComId', { id: faq?.id || '' })} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <HelpCircle size={22} strokeWidth={1.9} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('faqsAdmin.edit.titulo')}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('faqsAdmin.edit.subtitulo')}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.faqs.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            <ArrowLeft size={16} />
                            {t('faqsAdmin.comum.voltar')}
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Categoria */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="categoria" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {t('faqsAdmin.comum.categoria')}
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
                                        <Folder size={14} /> {t('faqsAdmin.comum.selecionarExistente')}
                                    </>
                                ) : (
                                    <>
                                        <Plus size={14} /> {t('faqsAdmin.comum.novaCategoria')}
                                    </>
                                )}
                            </button>
                        </div>

                        {criarNovaCategoria ? (
                            <div>
                                <input
                                    id="categoria"
                                    type="text"
                                    maxLength={30}
                                    placeholder={t('faqsAdmin.comum.categoriaPlaceholder')}
                                    value={data.categoria}
                                    onChange={handleNovaCategoriaChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    required
                                />
                                <span className="mt-1 block text-right text-xs text-slate-400">
                                    {t('faqsAdmin.comum.caracteres', { atual: data.categoria.length, maximo: 30 })}
                                </span>
                            </div>
                        ) : (
                            <select
                                id="categoria"
                                value={data.categoria}
                                onChange={(e) => setData('categoria', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                required
                            >
                                {(categorias || []).map((cat) => (
                                    <option key={cat} value={cat}>
                                        {traduzirCategoria(cat)}
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
                        <label htmlFor="pergunta" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('faqsAdmin.comum.pergunta')}
                        </label>
                        <input
                            id="pergunta"
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
                        <label htmlFor="resposta" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('faqsAdmin.comum.resposta')}
                        </label>
                        <textarea
                            id="resposta"
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

                    {/* Keywords PT & EN */}
                    <div>
                        <label htmlFor="pergunta_en" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('faqsAdmin.comum.perguntaEn')}
                        </label>
                        <input
                            id="pergunta_en"
                            type="text"
                            value={data.pergunta_en}
                            onChange={(e) => setData('pergunta_en', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        {errors.pergunta_en && (
                            <p className="mt-1 text-xs text-rose-500">{errors.pergunta_en}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="resposta_en" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('faqsAdmin.comum.respostaEn')}
                        </label>
                        <textarea
                            id="resposta_en"
                            rows={5}
                            value={data.resposta_en}
                            onChange={(e) => setData('resposta_en', e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                        {errors.resposta_en && (
                            <p className="mt-1 text-xs text-rose-500">{errors.resposta_en}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="keywords_pt" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {t('faqsAdmin.comum.keywordsPt')}
                            </label>
                            <input
                                id="keywords_pt"
                                type="text"
                                placeholder={t('faqsAdmin.comum.keywordsPtPlaceholder')}
                                value={data.keywords_pt}
                                onChange={(e) => setData('keywords_pt', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                            {errors.keywords_pt && (
                                <p className="mt-1 text-xs text-rose-500">{errors.keywords_pt}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="keywords_en" className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {t('faqsAdmin.comum.keywordsEn')}
                            </label>
                            <input
                                id="keywords_en"
                                type="text"
                                placeholder={t('faqsAdmin.comum.keywordsEnPlaceholder')}
                                value={data.keywords_en}
                                onChange={(e) => setData('keywords_en', e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                            {errors.keywords_en && (
                                <p className="mt-1 text-xs text-rose-500">{errors.keywords_en}</p>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 flex items-center gap-2">
                        <Sparkles size={16} className="text-teal-500 shrink-0" />
                        <span>
                            {t('faqsAdmin.comum.keywordsAjuda')}
                        </span>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={processing}
                            className="inline-flex w-48 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-white dark:text-red-600 dark:hover:bg-red-50"
                        >
                            <Trash2 size={16} />
                            {t('faqsAdmin.edit.eliminar')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex w-48 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:opacity-50"
                        >
                            {processing ? t('faqsAdmin.comum.aGuardar') : t('faqsAdmin.edit.guardar')}
                        </button>
                    </div>
                </form>
            </section>
        </DashboardLayout>
    );
}
