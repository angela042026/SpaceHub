import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, CreditCard } from 'lucide-react';
import { ESTADO_PAGAMENTO, METODO_PAGAMENTO, badge, etiqueta } from '@/utils/estados';
import { formatarDataCurta, formatarDataHora, formatarValorEuro } from '@/utils/formatacaoPagamento';

export default function Show({ pagamento }) {
    const pagamentoPendente = pagamento.estado === 'pendente';

    return (
        <DashboardLayout>
            <Head title="Detalhe do Pagamento" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CreditCard size={22} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold">Pagamento</h1>

                            <p className="break-all text-sm text-slate-500">
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

                <div className="grid gap-8 p-6 md:grid-cols-2">
                    <div className="space-y-5">
                        <div>
                            <p className="text-sm text-slate-500">Referência</p>

                            <p className="break-all font-semibold text-slate-900 dark:text-slate-100">
                                {pagamento.referencia}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">Valor</p>

                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {formatarValorEuro(pagamento.valor)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">Método</p>

                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {etiqueta(
                                    METODO_PAGAMENTO,
                                    pagamento.metodo_pagamento,
                                    'Por definir',
                                )}
                            </p>
                        </div>

                        <div>
                            <p className="mb-1 text-sm text-slate-500">
                                Estado
                            </p>

                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${badge(
                                    ESTADO_PAGAMENTO,
                                    pagamento.estado,
                                )}`}
                            >
                                {etiqueta(ESTADO_PAGAMENTO, pagamento.estado)}
                            </span>
                        </div>

                        {pagamento.data_pagamento && (
                            <div>
                                <p className="text-sm text-slate-500">
                                    Data do pagamento
                                </p>

                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                    {formatarDataHora(
                                        pagamento.data_pagamento,
                                    )}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        <div>
                            <p className="text-sm text-slate-500">
                                Data da reserva
                            </p>

                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {formatarDataCurta(pagamento.reserva?.data)}
                            </p>
                        </div>

                        {pagamento.reserva?.data_fim && (
                            <div>
                                <p className="text-sm text-slate-500">
                                    Data de fim
                                </p>

                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                    {formatarDataCurta(pagamento.reserva.data_fim)}
                                </p>
                            </div>
                        )}

                        <div>
                            <p className="text-sm text-slate-500">
                                Secretária
                            </p>

                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {pagamento.reserva?.secretaria?.codigo ?? '-'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">Setor</p>

                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {pagamento.reserva?.secretaria?.setor?.nome ??
                                    '-'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">Duração</p>

                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {pagamento.reserva?.tipo_duracao === 'diaria'
                                    ? (pagamento.reserva?.periodo?.nome ?? 'Diária')
                                    : pagamento.reserva?.tipo_duracao === 'semanal'
                                        ? 'Semanal'
                                        : pagamento.reserva?.tipo_duracao === 'mensal'
                                            ? 'Mensal'
                                            : pagamento.reserva?.tipo_duracao === 'anual'
                                                ? 'Anual'
                                                : '-'}
                            </p>
                        </div>
                    </div>
                </div>

                {pagamentoPendente && (
                                    <div className="border-t border-slate-100 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/40">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                    Este pagamento está pendente
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    Escolhe um método para confirmar o pagamento
                                                    simulado.
                                                </p>
                                            </div>

                                            <Link
                                                href={route(
                                                    'pagamentos.pagar',
                                                    pagamento.id,
                                                )}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white outline-none transition hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                                            >
                                                <CheckCircle2 size={19} />
                                                Efetuar pagamento
                                            </Link>
                                        </div>
                                    </div>
                                )}

                {pagamento.estado === 'pago' && (
                                    <div className="border-t border-teal-100 bg-teal-50 px-6 py-5 dark:border-teal-900/50 dark:bg-teal-950/20">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle2
                                                    size={22}
                                                    className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400"
                                                />

                                                <div>
                                                    <p className="font-semibold text-teal-800 dark:text-teal-300">
                                                        Pagamento confirmado
                                                    </p>

                                                    <p className="text-sm text-teal-700 dark:text-teal-400">
                                                        Este pagamento já se encontra concluído.
                                                    </p>
                                                </div>
                                            </div>

                                            <Link
                                                href={route(
                                                    'pagamentos.comprovativo',
                                                    pagamento.id,
                                                )}
                                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700"
                                            >
                                                Ver comprovativo
                                            </Link>
                                        </div>
                                    </div>
                                )}
            </section>
        </DashboardLayout>
    );
}