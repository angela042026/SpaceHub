import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, CreditCard } from 'lucide-react';

const ESTADO_CLASSES = {
    pendente: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    pago: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    recusado: 'bg-red-500/10 text-red-600 dark:text-red-400',
    reembolsado: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    cancelado: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

const ESTADO_LABELS = {
    pendente: 'Pendente',
    pago: 'Pago',
    recusado: 'Recusado',
    reembolsado: 'Reembolsado',
    cancelado: 'Cancelado',
};

const METODO_LABELS = {
    cartao: 'Cartão',
    mbway: 'MB Way',
    transferencia: 'Transferência bancária',
    paypal: 'PayPal',
};

export default function Show({ pagamento }) {
    const formatarValor = (valor) =>
        new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
        }).format(Number(valor ?? 0));

    const formatarData = (dataValor) => {
        if (!dataValor) {
            return '-';
        }

        const valor = String(dataValor);
        const dataSemHora = valor.substring(0, 10);
        const partes = dataSemHora.split('-');

        if (partes.length !== 3) {
            return '-';
        }

        const [ano, mes, dia] = partes;

        if (!ano || !mes || !dia) {
            return '-';
        }

        return `${dia}/${mes}/${ano}`;
    };

    const formatarDataHora = (dataValor) => {
        if (!dataValor) {
            return '-';
        }

        const dataObjeto = new Date(dataValor);

        if (Number.isNaN(dataObjeto.getTime())) {
            return formatarData(dataValor);
        }

        return new Intl.DateTimeFormat('pt-PT', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(dataObjeto);
    };

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
                            <h1 className="text-xl font-bold">
                                Pagamento
                            </h1>

                            <p className="break-all text-sm text-slate-500">
                                {pagamento.referencia}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('pagamentos.index')}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </Link>
                </div>

                <div className="grid gap-8 p-6 md:grid-cols-2">
                    <div className="space-y-5">
                        <div>
                            <p className="text-sm text-slate-500">
                                Referência
                            </p>

                            <p className="break-all font-semibold text-slate-900 dark:text-slate-100">
                                {pagamento.referencia}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Valor
                            </p>

                            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {formatarValor(pagamento.valor)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Método
                            </p>

                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {METODO_LABELS[
                                    pagamento.metodo_pagamento
                                ] ?? 'Por definir'}
                            </p>
                        </div>

                        <div>
                            <p className="mb-1 text-sm text-slate-500">
                                Estado
                            </p>

                            <span
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${ESTADO_CLASSES[pagamento.estado] ??
                                    ESTADO_CLASSES.cancelado
                                    }`}
                            >
                                {ESTADO_LABELS[pagamento.estado] ??
                                    pagamento.estado}
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
                                {formatarData(pagamento.reserva?.data)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Secretária
                            </p>

                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {pagamento.reserva?.secretaria?.codigo ??
                                    '-'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Setor
                            </p>

                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {pagamento.reserva?.secretaria?.setor
                                    ?.nome ?? '-'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Período
                            </p>

                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                {pagamento.reserva?.periodo?.nome ?? '-'}
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
                                    Escolhe um método para confirmar o
                                    pagamento simulado.
                                </p>
                            </div>

                            <Link
                                href={route('pagamentos.pagar', pagamento.id)}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
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