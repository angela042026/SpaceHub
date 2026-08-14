import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { cloneElement, isValidElement, useId } from 'react';
import { formatarDataCurta, formatarValorEuro } from '@/utils/formatacaoPagamento';
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock,
    Hash,
    Info,
    LockKeyhole,
    MapPin,
} from 'lucide-react';

const METODOS_PAGAMENTO = [
    {
        valor: 'cartao',
        titulo: 'Cartão',
        descricao: 'Visa, Mastercard ou outro cartão bancário.',
        imagem: '/images/payment/cartao.jpeg',
    },
    {
        valor: 'mbway',
        titulo: 'MB Way',
        descricao: 'Confirmação através do número de telemóvel.',
        imagem: '/images/payment/mbway.jpeg',
    },
    {
        valor: 'transferencia',
        titulo: 'Transferência',
        descricao: 'Consulta o IBAN e utiliza a referência indicada.',
        imagem: '/images/payment/transferencia.jpeg',
    },
    {
        valor: 'paypal',
        titulo: 'PayPal',
        descricao: 'Pagamento através de uma conta PayPal.',
        imagem: '/images/payment/paypal.jpeg',
    },
];

const inputClasses =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500';

export default function Pagar({ pagamento }) {
    const {
        data,
        setData,
        patch,
        processing,
        errors,
        clearErrors,
    } = useForm({
        metodo_pagamento: '',
        nome_titular: '',
        numero_cartao: '',
        validade_cartao: '',
        cvv: '',
        telefone_mbway: '',
        confirmacao_transferencia: false,
        email_paypal: '',
    });

    const selecionarMetodo = (metodo) => {
        clearErrors();

        setData({
            metodo_pagamento: metodo,
            nome_titular: '',
            numero_cartao: '',
            validade_cartao: '',
            cvv: '',
            telefone_mbway: '',
            confirmacao_transferencia: false,
            email_paypal: '',
        });
    };

    const confirmarPagamento = (evento) => {
        evento.preventDefault();

        patch(route('pagamentos.confirmar', pagamento.id), {
            preserveScroll: true,
        });
    };

    const reserva = pagamento.reserva;
    const secretaria = reserva?.secretaria;
    const setor = secretaria?.setor;

    const nomeEdificio = setor?.piso?.edificio?.nome;
    const numeroPiso = setor?.piso?.numero;
    const localizacao = [
        nomeEdificio,
        numeroPiso != null ? `Piso ${numeroPiso}` : null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <DashboardLayout>
            <Head title="Efetuar pagamento" />

            <div className="mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-[clamp(20px,1.6vw,32px)] pb-10 [overflow-x:clip]">
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">
                            Pagamento simulado
                        </p>

                        <h1 className="mt-1 text-[clamp(1.875rem,2vw,2.25rem)] font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Efetuar pagamento
                        </h1>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Confirma os dados da reserva e escolhe o método de pagamento.
                        </p>
                    </div>

                    <Link
                        href={route('pagamentos.show', pagamento.id)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600 outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:bg-slate-800 dark:hover:text-teal-400 dark:focus-visible:ring-offset-slate-950"
                    >
                        <ArrowLeft size={18} />
                        Voltar ao detalhe
                    </Link>
                </header>

                <section className="dashboard-card overflow-hidden">
                    <div className="grid min-w-0 gap-0 lg:grid-cols-[minmax(0,1fr)_clamp(240px,24%,340px)]">
                        <div className="min-w-0 p-[clamp(20px,2vw,36px)]">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                        Resumo da reserva
                                    </p>

                                    <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                                        Reserva #{reserva?.id ?? '-'}
                                    </h2>
                                </div>

                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                    Pendente
                                </span>
                            </div>

                            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 min-[1600px]:grid-cols-[minmax(135px,0.8fr)_minmax(130px,0.8fr)_minmax(280px,2fr)_minmax(240px,1.6fr)]">
                                <ResumoItem Icone={CalendarDays} titulo="Data">
                                    {formatarDataCurta(reserva?.data)}
                                </ResumoItem>

                                <ResumoItem Icone={Clock} titulo="Período">
                                    {reserva?.periodo?.nome ?? '-'}
                                </ResumoItem>

                                <ResumoItem Icone={Building2} titulo="Espaço" quebraLinha>
                                    <span className="flex flex-wrap items-center gap-2">
                                        <span>{setor?.nome ?? '-'}</span>

                                        {secretaria?.codigo && (
                                            <span className="inline-flex items-center rounded-md border border-teal-200 px-2 py-0.5 text-xs font-bold text-teal-700 dark:border-teal-800 dark:text-teal-400">
                                                {secretaria.codigo}
                                            </span>
                                        )}
                                    </span>
                                </ResumoItem>

                                <ResumoItem Icone={MapPin} titulo="Localização" quebraLinha>
                                    {localizacao || '-'}
                                </ResumoItem>
                            </div>
                        </div>

                        <div className="flex min-w-0 flex-col justify-between border-t border-slate-200 bg-slate-50 p-[clamp(20px,2vw,36px)] dark:border-slate-800 dark:bg-slate-950/50 lg:border-l lg:border-t-0">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Total a pagar
                                </p>

                                <p className="mt-2 text-[clamp(2.25rem,3vw,3rem)] font-black tracking-tight text-slate-900 dark:text-white">
                                    {formatarValorEuro(pagamento.valor)}
                                </p>
                            </div>

                            <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-800">
                                <div className="flex items-start gap-3">
                                    <Hash
                                        className="mt-0.5 shrink-0 text-slate-400"
                                        size={17}
                                    />

                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            Referência
                                        </p>

                                        <p className="mt-1 break-all text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            {pagamento.referencia ?? '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <form onSubmit={confirmarPagamento} className="space-y-6">
                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                            <p className="font-bold">
                                O pagamento não foi confirmado:
                            </p>

                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                {Object.entries(errors).map(([campo, mensagem]) => (
                                    <li key={campo}>{mensagem}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                        <Info
                            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                            size={18}
                        />

                        <div>
                            <p className="font-semibold text-amber-800 dark:text-amber-300">
                                Ambiente de demonstração
                            </p>

                            <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                                Os pagamentos apresentados nesta aplicação são simulados para fins
                                académicos. Não é efetuada qualquer transação financeira real.
                            </p>
                        </div>
                    </div>

                    <section className="dashboard-card p-[clamp(20px,2vw,36px)]">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                Escolhe o método de pagamento
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Seleciona uma das opções disponíveis para continuar.
                            </p>
                        </div>

                        <fieldset>
                            <legend className="sr-only">
                                Método de pagamento
                            </legend>

                            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
                                {METODOS_PAGAMENTO.map(
                                    ({
                                        valor,
                                        titulo,
                                        descricao,
                                        imagem,
                                    }) => {
                                        const selecionado =
                                            data.metodo_pagamento === valor;

                                        return (
                                            <label
                                                key={valor}
                                                className={`group relative flex min-h-[clamp(80px,7vw,108px)] min-w-0 cursor-pointer items-center rounded-2xl p-4 transition duration-200 ${selecionado
                                                        ? 'border-2 border-teal-500 bg-teal-50 shadow-[0_6px_20px_-4px_rgba(20,184,166,0.35)] dark:border-teal-400 dark:bg-teal-400/10'
                                                        : 'border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="metodo_pagamento"
                                                    value={valor}
                                                    checked={selecionado}
                                                    onChange={(evento) =>
                                                        selecionarMetodo(
                                                            evento.target.value,
                                                        )
                                                    }
                                                    className="sr-only"
                                                />

                                                <div className="flex w-full items-center gap-3">
                                                    <div className="flex h-[clamp(52px,4.2vw,64px)] w-[clamp(52px,4.2vw,64px)] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                                        <img
                                                            src={imagem}
                                                            alt={titulo}
                                                            className="h-full w-full object-contain"
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="font-bold leading-5 text-slate-900 dark:text-slate-100">
                                                                    {titulo}
                                                                </p>

                                                                <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
                                                                    {descricao}
                                                                </p>
                                                            </div>

                                                            <span
                                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${selecionado
                                                                        ? 'border-teal-600 bg-teal-600 text-white'
                                                                        : 'border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-900'
                                                                    }`}
                                                            >
                                                                <Check
                                                                    size={14}
                                                                    strokeWidth={3}
                                                                />
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    },
                                )}
                            </div>

                            {errors.metodo_pagamento && (
                                <MensagemErro>
                                    {errors.metodo_pagamento}
                                </MensagemErro>
                            )}
                        </fieldset>
                    </section>

                    {data.metodo_pagamento && (
                        <section className="dashboard-card animate-[fadeIn_250ms_ease-out] p-6 sm:p-8">
                            <div className="mb-6 flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
                                    <LockKeyhole size={20} />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-teal-600 dark:text-teal-400">
                                        Passo 2
                                    </p>

                                    <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                                        Dados do pagamento
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Preenche apenas os dados necessários para o método selecionado.
                                    </p>
                                </div>
                            </div>

                            {data.metodo_pagamento === 'cartao' && (
                                <div className="space-y-5">
                                    <Campo
                                        label="Nome do titular"
                                        erro={errors.nome_titular}
                                    >
                                        <input
                                            type="text"
                                            value={data.nome_titular}
                                            onChange={(evento) =>
                                                setData(
                                                    'nome_titular',
                                                    evento.target.value,
                                                )
                                            }
                                            placeholder="Nome como aparece no cartão"
                                            autoComplete="cc-name"
                                            className={inputClasses}
                                        />
                                    </Campo>

                                    <Campo
                                        label="Número do cartão"
                                        erro={errors.numero_cartao}
                                    >
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={16}
                                            value={data.numero_cartao}
                                            onChange={(evento) =>
                                                setData(
                                                    'numero_cartao',
                                                    evento.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    ),
                                                )
                                            }
                                            placeholder="1234567812345678"
                                            autoComplete="cc-number"
                                            className={inputClasses}
                                        />
                                    </Campo>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Campo
                                            label="Validade"
                                            erro={errors.validade_cartao}
                                        >
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={5}
                                                value={data.validade_cartao}
                                                onChange={(evento) => {
                                                    let valor =
                                                        evento.target.value
                                                            .replace(/\D/g, '')
                                                            .slice(0, 4);

                                                    if (valor.length > 2) {
                                                        valor = `${valor.slice(
                                                            0,
                                                            2,
                                                        )}/${valor.slice(2)}`;
                                                    }

                                                    setData(
                                                        'validade_cartao',
                                                        valor,
                                                    );
                                                }}
                                                placeholder="MM/AA"
                                                autoComplete="cc-exp"
                                                className={inputClasses}
                                            />
                                        </Campo>

                                        <Campo label="CVV" erro={errors.cvv}>
                                            <input
                                                type="password"
                                                inputMode="numeric"
                                                maxLength={4}
                                                value={data.cvv}
                                                onChange={(evento) =>
                                                    setData(
                                                        'cvv',
                                                        evento.target.value.replace(
                                                            /\D/g,
                                                            '',
                                                        ),
                                                    )
                                                }
                                                placeholder="123"
                                                autoComplete="cc-csc"
                                                className={inputClasses}
                                            />
                                        </Campo>
                                    </div>

                                    <Nota>
                                        Os dados do cartão são utilizados apenas nesta simulação e não são guardados.
                                    </Nota>
                                </div>
                            )}

                            {data.metodo_pagamento === 'mbway' && (
                                <div className="space-y-5">
                                    <Campo
                                        label="Número de telemóvel"
                                        erro={errors.telefone_mbway}
                                    >
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={9}
                                            value={data.telefone_mbway}
                                            onChange={(evento) =>
                                                setData(
                                                    'telefone_mbway',
                                                    evento.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    ),
                                                )
                                            }
                                            placeholder="912345678"
                                            autoComplete="tel"
                                            className={inputClasses}
                                        />
                                    </Campo>

                                    <Nota>
                                        Será simulada uma notificação MB Way para o número indicado.
                                    </Nota>
                                </div>
                            )}

                            {data.metodo_pagamento === 'transferencia' && (
                                <div className="space-y-5">
                                    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-950/50">
                                        <LinhaDados
                                            titulo="IBAN"
                                            valor="PT50 0002 0123 1234 5678 9015 4"
                                        />

                                        <LinhaDados
                                            titulo="Referência"
                                            valor={pagamento.referencia ?? '-'}
                                        />

                                        <LinhaDados
                                            titulo="Valor"
                                            valor={formatarValorEuro(pagamento.valor)}
                                        />
                                    </div>

                                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
                                        <input
                                            type="checkbox"
                                            checked={
                                                data.confirmacao_transferencia
                                            }
                                            onChange={(evento) =>
                                                setData(
                                                    'confirmacao_transferencia',
                                                    evento.target.checked,
                                                )
                                            }
                                            className="mt-0.5 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                        />

                                        <span className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                            Confirmo que consultei os dados da transferência e que utilizarei a referência indicada.
                                        </span>
                                    </label>

                                    {errors.confirmacao_transferencia && (
                                        <MensagemErro>
                                            {
                                                errors.confirmacao_transferencia
                                            }
                                        </MensagemErro>
                                    )}
                                </div>
                            )}

                            {data.metodo_pagamento === 'paypal' && (
                                <div className="space-y-5">
                                    <Campo
                                        label="Email associado ao PayPal"
                                        erro={errors.email_paypal}
                                    >
                                        <input
                                            type="email"
                                            value={data.email_paypal}
                                            onChange={(evento) =>
                                                setData(
                                                    'email_paypal',
                                                    evento.target.value,
                                                )
                                            }
                                            placeholder="utilizador@exemplo.pt"
                                            autoComplete="email"
                                            className={inputClasses}
                                        />
                                    </Campo>

                                    <Nota>
                                        O redirecionamento para o PayPal será simulado neste projeto académico.
                                    </Nota>
                                </div>
                            )}

                            {errors.pagamento && (
                                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                                    {errors.pagamento}
                                </div>
                            )}
                        </section>
                    )}

                    <section className="dashboard-card flex flex-col-reverse gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <LockKeyhole size={15} />
                            Simulação segura: os dados sensíveis não são guardados.
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                            <Link
                                href={route('pagamentos.show', pagamento.id)}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    !data.metodo_pagamento
                                }
                                className={`inline-flex items-center justify-center gap-2 rounded-xl px-[clamp(20px,1.8vw,28px)] py-[clamp(10px,1vw,14px)] font-semibold shadow-sm transition focus:outline-none focus:ring-4 focus:ring-teal-500/20 ${
                                    data.metodo_pagamento && !processing
                                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                                        : 'cursor-not-allowed bg-slate-200 text-slate-400 shadow-none dark:bg-slate-800 dark:text-slate-500'
                                }`}
                            >
                                <CheckCircle2 size={18} />

                                {processing
                                    ? 'A confirmar...'
                                    : 'Confirmar pagamento'}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </DashboardLayout>
    );
}

function ResumoItem({ Icone, titulo, children, quebraLinha = false }) {
    return (
        <div
            className={`flex min-h-[76px] min-w-0 gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 ${
                quebraLinha ? 'items-start' : 'items-center'
            }`}
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <Icone size={19} />
            </div>

            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {titulo}
                </p>

                <div
                    className={`mt-0.5 font-semibold text-slate-800 dark:text-slate-200 ${
                        quebraLinha
                            ? 'whitespace-normal break-words'
                            : 'whitespace-nowrap'
                    }`}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

function Campo({ label, erro, children }) {
    const idGerado = useId();
    const campo = isValidElement(children)
        ? cloneElement(children, { id: children.props.id ?? idGerado })
        : children;
    const idCampo = isValidElement(campo) ? campo.props.id : undefined;

    return (
        <div>
            <label
                htmlFor={idCampo}
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
                {label}
            </label>

            {campo}

            {erro && <MensagemErro>{erro}</MensagemErro>}
        </div>
    );
}

function MensagemErro({ children }) {
    return (
        <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
            {children}
        </p>
    );
}

function Nota({ children }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400">
            <Info className="mt-0.5 shrink-0" size={18} />
            <p>{children}</p>
        </div>
    );
}

function LinhaDados({ titulo, valor }) {
    return (
        <div className="flex flex-col gap-1 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <span className="text-sm text-slate-500 dark:text-slate-400">
                {titulo}
            </span>

            <span className="break-all text-sm font-bold text-slate-900 dark:text-slate-100 sm:text-right">
                {valor}
            </span>
        </div>
    );
}