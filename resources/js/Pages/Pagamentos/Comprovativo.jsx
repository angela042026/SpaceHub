import DashboardLayout from '@/Layouts/DashboardLayout';
import LocalizacaoEspaco from '@/Components/Reservas/LocalizacaoEspaco';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Building2,
    CheckCircle2,
    CreditCard,
    Download,
    Info,
    Printer,
    UserRound,
} from 'lucide-react';
import { METODO_PAGAMENTO, etiqueta, etiquetaPeriodo } from '@/utils/estados';
import { formatarDataCurta, formatarDataHora, formatarValorEuro } from '@/utils/formatacaoPagamento';
import { resolverImagemPorSetor } from '@/utils/imagemSetor';

const GRADIENTE = '[background:linear-gradient(120deg,#176A85_0%,#0F9698_50%,#12BFAE_100%)]';

export default function Comprovativo({ pagamento }) {
    const { t, i18n } = useTranslation('pagamentos');
    const { t: tc } = useTranslation('common');

    const reserva = pagamento.reserva;
    const utilizador = reserva?.user;
    const secretaria = reserva?.secretaria;
    const setor = secretaria?.setor;
    const imagemEspaco = resolverImagemPorSetor(setor);

    const imprimirComprovativo = () => {
        window.print();
    };

    const botaoSecundarioClasses =
        'inline-flex items-center justify-center gap-2 rounded-xl border border-[#DCE6EF] bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600 outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:bg-slate-800 dark:hover:text-teal-400 dark:focus-visible:ring-offset-slate-950';

    const botaoPrimarioClasses =
        'inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-teal-700 outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950';

    return (
        <DashboardLayout>
            <Head title={t('comprovativo.tituloPagina')} />

            <div className="mx-auto w-[94%] min-w-0 max-w-[1600px]">
                <header className="mb-6 flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">
                            {t('comprovativo.pagamentoConcluido')}
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {t('comprovativo.tituloPagina')}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {t('comprovativo.subtitulo')}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={route('pagamentos.show', pagamento.id)}
                            className={botaoSecundarioClasses}
                        >
                            <ArrowLeft size={18} />
                            {t('comprovativo.voltarAoDetalhe')}
                        </Link>

                        <button type="button" onClick={imprimirComprovativo} className={botaoSecundarioClasses}>
                            <Printer size={18} />
                            {t('comprovativo.imprimir')}
                        </button>

                        <button type="button" onClick={imprimirComprovativo} className={botaoPrimarioClasses}>
                            <Download size={18} />
                            {t('comprovativo.guardarComoPdf')}
                        </button>
                    </div>
                </header>

                <div id="comprovativo-pagamento" className="min-w-0 print:[break-inside:avoid] print:[page-break-inside:avoid]">
                <main className="min-w-0 overflow-hidden rounded-[20px] border border-[#DCE6EF] bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none print:overflow-visible print:rounded-none print:border-0 print:shadow-none print:[break-inside:avoid] print:[page-break-inside:avoid]">
                    {/* Faixa com degradê */}
                    <section
                        className={`relative flex min-h-[118px] items-center overflow-hidden px-9 py-6 text-white sm:min-h-0 sm:px-16 sm:py-0 sm:h-[118px] print:h-auto print:min-h-0 print:[break-inside:avoid] print:[page-break-inside:avoid] print:px-7 print:py-4 print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact] ${GRADIENTE}`}
                    >
                        <svg
                            className="pointer-events-none absolute inset-y-0 right-0 h-full w-1/2 opacity-[0.07]"
                            viewBox="0 0 400 120"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                        >
                            <line x1="100" y1="0" x2="400" y2="95" stroke="white" strokeWidth="1" />
                            <line x1="190" y1="0" x2="400" y2="60" stroke="white" strokeWidth="1" />
                            <line x1="280" y1="0" x2="400" y2="28" stroke="white" strokeWidth="1" />
                            <circle cx="355" cy="24" r="34" stroke="white" strokeWidth="1" fill="none" />
                        </svg>

                        <div className="relative flex w-full min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-center gap-5 self-start print:gap-4 sm:self-auto">
                                <img
                                    src="/images/logo/logoprincipalbranco.png"
                                    alt="SpaceHub"
                                    className="h-16 w-auto shrink-0 object-contain"
                                />

                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-teal-100">
                                        {t('comprovativo.tituloPagina')}
                                    </p>

                                    <h2 className="truncate text-xl font-black tracking-tight print:text-[26px] sm:text-2xl">
                                        {t('comprovativo.pagamentoConfirmado')}
                                    </h2>

                                    <p className="truncate text-sm font-medium text-teal-50/80">
                                        {t('comprovativo.reservaNumero', { id: reserva?.id ?? '-' })}
                                    </p>
                                </div>
                            </div>

                            <span className="inline-flex shrink-0 items-center gap-1.5 self-start whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white sm:self-auto">
                                <CheckCircle2 size={14} />
                                {t('comprovativo.pago')}
                            </span>
                        </div>
                    </section>

                    {/* Informação principal */}
                    <section className="grid min-w-0 grid-cols-1 divide-y divide-[#DCE6EF] border-b border-[#DCE6EF] dark:divide-slate-800 dark:border-slate-800 print:[break-inside:avoid] print:[page-break-inside:avoid] print:grid-cols-1 print:divide-x-0 print:divide-y lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                        <div className="min-w-0 p-8 print:p-6 sm:p-10">
                            <div className="mb-4 flex items-center gap-2 print:mb-3">
                                <CreditCard size={17} className="text-teal-600 dark:text-teal-400" />

                                <h3 className="whitespace-nowrap text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 print:text-base">
                                    {t('comprovativo.informacaoDoPagamento')}
                                </h3>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                <LinhaInfo
                                    titulo={t('comprovativo.referenciaDoPagamento')}
                                    valor={pagamento.referencia ?? '-'}
                                    semQuebra
                                />

                                <LinhaInfo
                                    titulo={t('comprovativo.metodoDePagamento')}
                                    valor={etiqueta(
                                        METODO_PAGAMENTO,
                                        pagamento.metodo_pagamento,
                                        t('comprovativo.naoIndicado'),
                                        tc,
                                    )}
                                />

                                <LinhaInfo
                                    titulo={t('comprovativo.dataDoPagamento')}
                                    valor={formatarDataHora(pagamento.data_pagamento, i18n.language)}
                                />

                                <LinhaInfo titulo={t('comprovativo.numeroDoPagamento')} valor={`#${pagamento.id}`} />

                                <LinhaInfo titulo={t('comprovativo.estado')} valor={t('comprovativo.pagamentoConcluidoEstado')} />
                            </div>
                        </div>

                        <div className="min-w-0 p-8 print:p-6 sm:p-10">
                            <div className="mb-4 flex items-center gap-2 print:mb-3">
                                <UserRound size={17} className="text-teal-600 dark:text-teal-400" />

                                <h3 className="whitespace-nowrap text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 print:text-base">
                                    {t('comprovativo.titularDaReserva')}
                                </h3>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                <LinhaInfo titulo={t('comprovativo.nome')} valor={utilizador?.name ?? '-'} />
                                <LinhaInfo titulo={t('comprovativo.email')} valor={utilizador?.email ?? '-'} />
                                <LinhaInfo titulo={t('comprovativo.numeroDaReserva')} valor={`#${reserva?.id ?? '-'}`} />
                            </div>
                        </div>
                    </section>

                    {/* Espaço reservado */}
                    <section className="p-[22px] print:[break-inside:avoid] print:[page-break-inside:avoid] print:p-6 sm:p-7">
                        <div className="mb-5 flex items-center gap-2 print:mb-3">
                            <Building2 size={17} className="text-teal-600 dark:text-teal-400" />

                            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-100 print:text-base">
                                {t('comprovativo.espacoReservado')}
                            </h3>
                        </div>

                        <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/40 print:flex-row print:items-center print:justify-between print:gap-5 print:p-5 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                            <div className="flex min-w-0 items-center gap-4 print:gap-3">
                                {imagemEspaco ? (
                                    <img
                                        src={imagemEspaco}
                                        alt={setor?.nome ?? 'Espaço reservado'}
                                        className="h-[80px] w-[96px] shrink-0 rounded-[12px] object-cover print:h-[72px] print:w-[88px]"
                                    />
                                ) : (
                                    <div className="flex h-[80px] w-[96px] shrink-0 items-center justify-center rounded-[12px] bg-white text-teal-600 shadow-sm dark:bg-slate-900 dark:text-teal-400 print:h-[72px] print:w-[88px]">
                                        <Building2 size={22} />
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="break-words text-lg font-bold text-slate-900 dark:text-slate-100 print:text-base">
                                            {setor?.nome ?? '-'}
                                        </p>

                                        <span className="inline-flex shrink-0 items-center rounded-md border border-teal-300 bg-white px-2 py-0.5 text-xs font-bold text-teal-700 dark:border-teal-800 dark:bg-slate-900 dark:text-teal-400">
                                            {secretaria?.codigo ?? '-'}
                                        </span>
                                    </div>

                                    <LocalizacaoEspaco
                                        secretaria={secretaria}
                                        className="mt-1"
                                        iconeClassName="text-teal-600 dark:text-teal-400"
                                    />
                                </div>
                            </div>

                            <div className="flex shrink-0 gap-10 print:gap-8">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        {t('comprovativo.data')}
                                    </p>

                                    <p className="mt-1 font-bold text-slate-900 dark:text-slate-100 print:text-sm">
                                        {formatarDataCurta(reserva?.data)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        {t('comprovativo.periodo')}
                                    </p>

                                    <p className="mt-1 font-bold text-slate-900 dark:text-slate-100 print:text-sm">
                                        {etiquetaPeriodo(reserva?.periodo?.nome, tc) || '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Total pago — faixa final do cartão */}
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-b-[20px] border-t border-[#DCE6EF] bg-[#F3FBFA] px-8 py-5 dark:border-slate-800 dark:bg-teal-950/10 print:rounded-none print:[break-inside:avoid] print:[page-break-inside:avoid] print:px-7 print:py-5 sm:px-10">
                        <span className="text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-400 print:text-sm">
                            {t('comprovativo.totalPago')}
                        </span>

                        <span className="shrink-0 whitespace-nowrap text-[clamp(2rem,1.8vw,2.125rem)] font-bold text-slate-900 dark:text-slate-100 print:text-[28px]">
                            {formatarValorEuro(pagamento.valor, i18n.language)}
                        </span>
                    </div>
                </main>

                {/* Rodapé e nota — fora do cartão principal */}
                <footer className="mt-5 flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400 print:[break-inside:avoid] print:[page-break-inside:avoid] print:mt-5 print:gap-2.5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            {t('comprovativo.geradoAutomaticamente')}
                        </p>

                        <p className="font-medium">
                            {t('comprovativo.referencia', { referencia: pagamento.referencia ?? '-' })}
                        </p>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-amber-200/70 bg-[#FFFBEB] px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300 print:px-4 print:py-2.5">
                        <Info size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />

                        <p>
                            <strong>{t('comprovativo.notaLabel')}</strong> {t('comprovativo.notaTexto')}
                        </p>
                    </div>
                </footer>
                </div>
            </div>

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }

                    html, body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .min-h-screen {
                        min-height: auto !important;
                    }

                    aside,
                    nav,
                    header:not(#comprovativo-pagamento header),
                    footer:not(#comprovativo-pagamento footer) {
                        display: none !important;
                    }

                    #comprovativo-pagamento {
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                        box-sizing: border-box;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}

function LinhaInfo({ titulo, valor, semQuebra = false }) {
    return (
        <div className="flex min-w-0 items-center justify-between gap-4 py-[12.6px] print:py-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
                {titulo}
            </span>

            <span
                className={`text-right font-semibold text-slate-900 dark:text-slate-100 ${
                    semQuebra ? 'shrink-0 whitespace-nowrap' : 'break-words'
                }`}
            >
                {valor}
            </span>
        </div>
    );
}
