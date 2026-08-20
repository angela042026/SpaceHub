import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, ExternalLink, Printer, QrCode as QrCodeIcon, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardLayout from '@/Layouts/DashboardLayout';
import { formatarNomePiso } from '@/utils/formatarNomePiso';

// Acima disto, a navegação por piso passa de pastilhas para um select
// compacto — evita uma linha demasiado extensa quando há muitos pisos.
const LIMITE_PISOS_PARA_PASTILHAS = 5;

export default function QrCodes({ pisos }) {
    const { t } = useTranslation('admin');
    const [busca, setBusca] = useState('');
    const [pisoSelecionado, setPisoSelecionado] = useState('todos');

    const pisosComSecretarias = useMemo(
        () => pisos.filter((piso) => piso.secretarias.length > 0),
        [pisos],
    );

    // Filtro inteiramente no cliente: todos os pisos/secretárias já vêm
    // carregados de uma vez (sem paginação), por isso pesquisar ou trocar
    // de piso não precisa de voltar ao servidor.
    const termo = busca.trim().toLowerCase();

    const pisosFiltrados = useMemo(() => {
        return pisosComSecretarias
            .filter((piso) => pisoSelecionado === 'todos' || String(piso.id) === String(pisoSelecionado))
            .map((piso) => {
                if (!termo) {
                    return piso;
                }

                const nomePisoFormatado = formatarNomePiso(piso.nome).toLowerCase();

                return {
                    ...piso,
                    secretarias: piso.secretarias.filter((secretaria) =>
                        secretaria.codigo.toLowerCase().includes(termo)
                        || secretaria.setor.toLowerCase().includes(termo)
                        || nomePisoFormatado.includes(termo),
                    ),
                };
            })
            .filter((piso) => piso.secretarias.length > 0);
    }, [pisosComSecretarias, pisoSelecionado, termo]);

    const totalEncontradas = pisosFiltrados.reduce(
        (total, piso) => total + piso.secretarias.length,
        0,
    );

    const limparPesquisa = () => {
        setBusca('');
        setPisoSelecionado('todos');
    };

    const usarSelectDePisos = pisosComSecretarias.length > LIMITE_PISOS_PARA_PASTILHAS;

    return (
        <>
            <Head title={t('secretarias.qrcodes.titulo')} />

            <DashboardLayout>
                <section className="dashboard-card overflow-hidden pb-16 sm:pr-1 lg:pr-4 print:border-none print:pb-0 print:pr-0 print:shadow-none">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between print:hidden">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                                <QrCodeIcon size={22} strokeWidth={1.9} />
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {t('secretarias.qrcodes.titulo')}
                                </h1>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {t('secretarias.qrcodes.subtitulo')}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href={route('admin.secretarias.index')}
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300"
                            >
                                <ArrowLeft size={16} strokeWidth={1.9} />
                                {t('secretarias.qrcodes.voltarAsSecretarias')}
                            </Link>

                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy-900 px-4 text-sm font-bold text-white transition hover:bg-navy-950"
                            >
                                <Printer size={16} strokeWidth={1.9} />
                                {t('secretarias.qrcodes.imprimirTudo')}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between print:hidden">
                        <div className="relative w-full sm:w-[500px]">
                            <Search
                                size={16}
                                strokeWidth={1.9}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={busca}
                                onChange={(event) => setBusca(event.target.value)}
                                placeholder={t('secretarias.qrcodes.pesquisarPlaceholder')}
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            />
                        </div>

                        {usarSelectDePisos ? (
                            <select
                                value={pisoSelecionado}
                                onChange={(event) => setPisoSelecionado(event.target.value)}
                                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="todos">{t('secretarias.qrcodes.todosOsPisos')}</option>

                                {pisosComSecretarias.map((piso) => (
                                    <option key={piso.id} value={piso.id}>
                                        {formatarNomePiso(piso.nome)}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPisoSelecionado('todos')}
                                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                                        pisoSelecionado === 'todos'
                                            ? 'bg-navy-900 text-white'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
                                    }`}
                                >
                                    {t('listagem.todos')}
                                </button>

                                {pisosComSecretarias.map((piso) => (
                                    <button
                                        key={piso.id}
                                        type="button"
                                        onClick={() => setPisoSelecionado(piso.id)}
                                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                                            String(pisoSelecionado) === String(piso.id)
                                                ? 'bg-navy-900 text-white'
                                                : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:bg-transparent dark:text-slate-300'
                                        }`}
                                    >
                                        {formatarNomePiso(piso.nome)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="px-6 pb-1 pt-3 text-xs text-slate-400 print:hidden">
                        {t('secretarias.qrcodes.encontradas', { count: totalEncontradas })}
                    </p>

                    {pisosFiltrados.length === 0 ? (
                        <div className="mx-6 my-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/40 print:hidden">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                {t('secretarias.index.semResultados')}
                            </p>

                            <button
                                type="button"
                                onClick={limparPesquisa}
                                className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                            >
                                {t('secretarias.qrcodes.limparPesquisa')}
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {pisosFiltrados.map((piso) => (
                                <div key={piso.id} className="break-inside-avoid px-6 pb-6 pt-3">
                                    <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">
                                        {formatarNomePiso(piso.nome)}
                                    </h2>

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 print:grid-cols-4 print:gap-4">
                                        {piso.secretarias.map((secretaria) => (
                                            <div
                                                key={secretaria.id}
                                                className="flex flex-col items-center gap-2 break-inside-avoid rounded-xl border border-slate-100 p-3 text-center transition hover:-translate-y-0.5 hover:border-teal-400/50 hover:shadow-md dark:border-slate-800 print:border-slate-300 print:shadow-none print:hover:translate-y-0"
                                            >
                                                <img
                                                    src={secretaria.qrUrl}
                                                    alt={t('secretarias.qrcodes.qrCodeAlt', { codigo: secretaria.codigo })}
                                                    className="h-24 w-24"
                                                />

                                                <div className="flex w-full min-w-0 flex-col items-center">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                                        {secretaria.codigo}
                                                    </p>

                                                    <p
                                                        className="line-clamp-1 w-full text-xs text-slate-400"
                                                        title={secretaria.setor}
                                                    >
                                                        {secretaria.setor}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 print:hidden">
                                                    <a
                                                        href={secretaria.qrUrl}
                                                        download={`qrcode-${secretaria.codigo}.svg`}
                                                        title={t('secretarias.qrcodes.transferir')}
                                                        aria-label={t('secretarias.qrcodes.transferirDe', { codigo: secretaria.codigo })}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-1 dark:border-slate-700 dark:hover:bg-teal-500/10"
                                                    >
                                                        <Download size={14} strokeWidth={1.9} />
                                                    </a>

                                                    <a
                                                        href={secretaria.qrUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title={t('secretarias.qrcodes.abrirParaImprimir')}
                                                        aria-label={t('secretarias.qrcodes.abrirParaImprimirDe', { codigo: secretaria.codigo })}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/40 focus-visible:ring-offset-1 dark:border-slate-700 dark:hover:bg-teal-500/10"
                                                    >
                                                        <ExternalLink size={14} strokeWidth={1.9} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </DashboardLayout>
        </>
    );
}
