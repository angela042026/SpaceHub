import DashboardLayout from '@/Layouts/DashboardLayout';
import LocalizacaoEspaco from '@/Components/Reservas/LocalizacaoEspaco';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    RotateCcw,
    XCircle,
} from 'lucide-react';
import { ESTADO_PAGAMENTO, METODO_PAGAMENTO, badge, etiqueta } from '@/utils/estados';
import { formatarDataCurta, formatarDataHora, formatarValorEuro } from '@/utils/formatacaoPagamento';

const ESTADO_ICONE = {
    pago: CheckCircle2,
    pendente: Clock,
    recusado: XCircle,
    reembolsado: RotateCcw,
    cancelado: XCircle,
};

const FAIXA_CONFIG = {
    pago: {
        moldura: 'border-teal-100 dark:border-teal-900/50',
        icone: 'text-teal-600 dark:text-teal-400',
        titulo: 'text-teal-800 dark:text-teal-300',
        texto: 'text-teal-700 dark:text-teal-400',
        tituloTexto: 'Pagamento confirmado',
        mensagem: 'Este pagamento já se encontra concluído.',
    },
    pendente: {
        moldura: 'border-amber-100 dark:border-amber-900/40',
        icone: 'text-amber-600 dark:text-amber-400',
        titulo: 'text-amber-800 dark:text-amber-300',
        texto: 'text-amber-700 dark:text-amber-400',
        tituloTexto: 'Pagamento pendente',
        mensagem: 'Escolhe um método para confirmar o pagamento simulado.',
    },
    recusado: {
        moldura: 'border-red-100 dark:border-red-900/40',
        icone: 'text-red-600 dark:text-red-400',
        titulo: 'text-red-800 dark:text-red-300',
        texto: 'text-red-700 dark:text-red-400',
        tituloTexto: 'Pagamento recusado',
        mensagem: 'Este pagamento não foi concluído.',
    },
    cancelado: {
        moldura: 'border-slate-200 dark:border-slate-700',
        icone: 'text-slate-500 dark:text-slate-400',
        titulo: 'text-slate-700 dark:text-slate-300',
        texto: 'text-slate-500 dark:text-slate-400',
        tituloTexto: 'Pagamento cancelado',
        mensagem: 'Este pagamento foi cancelado.',
    },
    reembolsado: {
        moldura: 'border-blue-100 dark:border-blue-900/40',
        icone: 'text-blue-600 dark:text-blue-400',
        titulo: 'text-blue-800 dark:text-blue-300',
        texto: 'text-blue-700 dark:text-blue-400',
        tituloTexto: 'Pagamento reembolsado',
        mensagem: 'O valor deste pagamento foi reembolsado.',
    },
};

export default function Show({ pagamento }) {
    const reserva = pagamento.reserva;
    const secretaria = reserva?.secretaria;
    const temDataPagamento = Boolean(pagamento.data_pagamento);

    const IconeEstado = ESTADO_ICONE[pagamento.estado] ?? XCircle;
    const faixa = FAIXA_CONFIG[pagamento.estado] ?? FAIXA_CONFIG.cancelado;

    return (
        <DashboardLayout>
            <Head title="Detalhe do Pagamento" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CreditCard size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Detalhes do pagamento
                            </h1>

                            <p className="break-all text-sm text-slate-500 dark:text-slate-400">
                                {pagamento.referencia}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:bg-slate-800 dark:hover:text-teal-400 dark:focus-visible:ring-offset-slate-950"
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[35%_1fr]">
                    <div className="relative overflow-hidden rounded-2xl border border-[#BFEDE7] bg-[#F3FCFA] p-5 shadow-sm dark:border-teal-900/40 dark:bg-teal-950/20">
                        <div className="absolute inset-x-0 top-0 h-1 bg-teal-500 dark:bg-teal-400" />

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Valor pago
                        </p>

                        <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
                            {formatarValorEuro(pagamento.valor)}
                        </p>

                        <span
                            className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${badge(
                                ESTADO_PAGAMENTO,
                                pagamento.estado,
                            )}`}
                        >
                            <IconeEstado size={14} strokeWidth={2.2} />
                            {etiqueta(ESTADO_PAGAMENTO, pagamento.estado)}
                        </span>

                        <div className="mt-5 divide-y divide-teal-100/80 border-t border-teal-100/80 dark:divide-teal-900/40 dark:border-teal-900/40">
                            <div className="flex items-center gap-3 py-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
                                    <CreditCard size={16} strokeWidth={1.9} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Método
                                    </p>

                                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                                        {etiqueta(
                                            METODO_PAGAMENTO,
                                            pagamento.metodo_pagamento,
                                            'Por definir',
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-4">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-400">
                                    <CalendarDays size={16} strokeWidth={1.9} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {temDataPagamento
                                            ? 'Data do pagamento'
                                            : 'Data da reserva'}
                                    </p>

                                    <p className="truncate font-semibold text-slate-800 dark:text-slate-100">
                                        {temDataPagamento
                                            ? formatarDataHora(pagamento.data_pagamento)
                                            : formatarDataCurta(reserva?.data)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <CalendarDays
                                size={18}
                                strokeWidth={2}
                                className="text-teal-500"
                            />

                            <h2 className="font-bold text-slate-900 dark:text-slate-100">
                                Dados da reserva
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Reserva
                                </p>

                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                    #{reserva?.id ?? pagamento.reserva_id}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Data da reserva
                                </p>

                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                    {formatarDataCurta(reserva?.data)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Data de fim
                                </p>

                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                    {formatarDataCurta(reserva?.data_fim ?? reserva?.data)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Período
                                </p>

                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                    {reserva?.periodo?.nome ?? '-'}
                                </p>
                            </div>
                        </div>

                        <hr className="mt-6 mb-7 border-slate-100 dark:border-slate-800" />

                        <div className="mb-4 flex items-center gap-2.5">
                            <Building2
                                size={20}
                                strokeWidth={2}
                                className="text-teal-500"
                            />

                            <h2 className="font-bold text-slate-900 dark:text-slate-100">
                                Espaço reservado
                            </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {secretaria?.setor?.nome ?? '-'}
                            </p>

                            <span className="inline-flex items-center rounded-md border border-teal-200 px-2 py-0.5 text-xs font-bold text-teal-700 dark:border-teal-800 dark:text-teal-400">
                                {secretaria?.codigo ?? '-'}
                            </span>
                        </div>

                        <LocalizacaoEspaco
                            secretaria={secretaria}
                            className="mt-1"
                            iconeClassName="text-teal-500 dark:text-teal-400"
                        />
                    </div>
                </div>

                <div
                    className={`border-t bg-[#F7FDFC] px-6 py-5 dark:bg-slate-900/60 ${faixa.moldura}`}
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <IconeEstado
                                size={22}
                                className={`mt-0.5 shrink-0 ${faixa.icone}`}
                            />

                            <div>
                                <p className={`font-semibold ${faixa.titulo}`}>
                                    {faixa.tituloTexto}
                                </p>

                                <p className={`text-sm ${faixa.texto}`}>
                                    {faixa.mensagem}
                                </p>
                            </div>
                        </div>

                        {pagamento.estado === 'pendente' && (
                            <Link
                                href={route('pagamentos.pagar', pagamento.id)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white outline-none transition hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                            >
                                <CheckCircle2 size={19} />
                                Efetuar pagamento
                            </Link>
                        )}

                        {pagamento.estado === 'pago' && (
                            <Link
                                href={route('pagamentos.comprovativo', pagamento.id)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white outline-none transition hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                            >
                                Ver comprovativo
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </DashboardLayout>
    );
}
