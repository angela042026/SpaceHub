import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle2,
    CreditCard,
    Smartphone,
    University,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
};

const METODOS_PAGAMENTO = [
    {
        valor: 'cartao',
        titulo: 'Cartão',
        descricao: 'Pagamento simulado com cartão bancário.',
        Icone: CreditCard,
    },
    {
        valor: 'mbway',
        titulo: 'MB Way',
        descricao: 'Pagamento simulado através de MB Way.',
        Icone: Smartphone,
    },
    {
        valor: 'transferencia',
        titulo: 'Transferência',
        descricao: 'Pagamento simulado por transferência bancária.',
        Icone: University,
    },
];

export default function Show({ pagamento }) {
    const [modalAberto, setModalAberto] = useState(false);

    const {
        data,
        setData,
        patch,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        metodo_pagamento: '',
    });

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

    const abrirModal = () => {
        reset();
        clearErrors();
        setModalAberto(true);
    };

    const fecharModal = () => {
        if (processing) {
            return;
        }

        reset();
        clearErrors();
        setModalAberto(false);
    };

    const confirmarPagamento = (evento) => {
        evento.preventDefault();

        patch(
            route('pagamentos.confirmar', pagamento.id),
            {
                preserveScroll: true,

                onSuccess: () => {
                    reset();
                    setModalAberto(false);
                },
            },
        );
    };

    useEffect(() => {
        if (!modalAberto) {
            return undefined;
        }

        const fecharComEscape = (evento) => {
            if (evento.key === 'Escape' && !processing) {
                fecharModal();
            }
        };

        document.addEventListener('keydown', fecharComEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', fecharComEscape);
            document.body.style.overflow = '';
        };
    }, [modalAberto, processing]);

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
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                                    ESTADO_CLASSES[pagamento.estado] ??
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

                            <button
                                type="button"
                                onClick={abrirModal}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            >
                                <CheckCircle2 size={19} />
                                Confirmar pagamento
                            </button>
                        </div>
                    </div>
                )}

                {pagamento.estado === 'pago' && (
                    <div className="border-t border-teal-100 bg-teal-50 px-6 py-5 dark:border-teal-900/50 dark:bg-teal-950/20">
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
                                    Este pagamento já se encontra
                                    concluído.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {modalAberto && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    onMouseDown={(evento) => {
                        if (evento.target === evento.currentTarget) {
                            fecharModal();
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-modal-pagamento"
                        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
                    >
                        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                            <div>
                                <h2
                                    id="titulo-modal-pagamento"
                                    className="text-xl font-bold text-slate-900 dark:text-slate-100"
                                >
                                    Confirmar pagamento
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Seleciona o método de pagamento.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={fecharModal}
                                disabled={processing}
                                aria-label="Fechar"
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={confirmarPagamento}>
                            <div className="space-y-5 px-6 py-5">
                                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Valor a pagar
                                        </span>

                                        <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                            {formatarValor(
                                                pagamento.valor,
                                            )}
                                        </span>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between gap-4">
                                        <span className="text-sm text-slate-500">
                                            Referência
                                        </span>

                                        <span className="break-all text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {pagamento.referencia}
                                        </span>
                                    </div>
                                </div>

                                <fieldset>
                                    <legend className="mb-3 font-semibold text-slate-900 dark:text-slate-100">
                                        Método de pagamento
                                    </legend>

                                    <div className="space-y-3">
                                        {METODOS_PAGAMENTO.map(
                                            ({
                                                valor,
                                                titulo,
                                                descricao,
                                                Icone,
                                            }) => {
                                                const selecionado =
                                                    data.metodo_pagamento ===
                                                    valor;

                                                return (
                                                    <label
                                                        key={valor}
                                                        className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
                                                            selecionado
                                                                ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500 dark:bg-teal-950/30'
                                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800/60'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="metodo_pagamento"
                                                            value={valor}
                                                            checked={
                                                                selecionado
                                                            }
                                                            onChange={(
                                                                evento,
                                                            ) =>
                                                                setData(
                                                                    'metodo_pagamento',
                                                                    evento
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
                                                        />

                                                        <div
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                                                selecionado
                                                                    ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400'
                                                                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                                                            }`}
                                                        >
                                                            <Icone
                                                                size={20}
                                                            />
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                                {titulo}
                                                            </p>

                                                            <p className="text-sm text-slate-500">
                                                                {descricao}
                                                            </p>
                                                        </div>
                                                    </label>
                                                );
                                            },
                                        )}
                                    </div>

                                    {errors.metodo_pagamento && (
                                        <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                                            {
                                                errors.metodo_pagamento
                                            }
                                        </p>
                                    )}
                                </fieldset>

                                {errors.pagamento && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                                        {errors.pagamento}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/60 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={fecharModal}
                                    disabled={processing}
                                    className="rounded-xl border border-slate-200 px-5 py-2.5 font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !data.metodo_pagamento
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CheckCircle2 size={18} />

                                    {processing
                                        ? 'A confirmar...'
                                        : 'Confirmar pagamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}