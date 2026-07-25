import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    CheckCircle2,
    Clock3,
    CreditCard,
    Download,
    Hash,
    MapPin,
    Printer,
    UserRound,
} from 'lucide-react';

const METODO_LABELS = {
    cartao: 'Cartão',
    mbway: 'MB Way',
    transferencia: 'Transferência bancária',
    paypal: 'PayPal',
};

export default function Comprovativo({ pagamento }) {
    const reserva = pagamento.reserva;
    const utilizador = reserva?.user;
    const secretaria = reserva?.secretaria;
    const setor = secretaria?.setor;
    const piso = setor?.piso;
    const edificio = piso?.edificio;

    const formatarValor = (valor) =>
        new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
        }).format(Number(valor ?? 0));

    const formatarData = (valor) => {
        if (!valor) {
            return '-';
        }

        const partes = String(valor).substring(0, 10).split('-');

        if (partes.length !== 3) {
            return '-';
        }

        const [ano, mes, dia] = partes;

        if (!ano || !mes || !dia) {
            return '-';
        }

        return `${dia}/${mes}/${ano}`;
    };

    const formatarDataHora = (valor) => {
        if (!valor) {
            return '-';
        }

        const data = new Date(valor);

        if (Number.isNaN(data.getTime())) {
            return formatarData(valor);
        }

        return new Intl.DateTimeFormat('pt-PT', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(data);
    };

    const imprimirComprovativo = () => {
        window.print();
    };

    return (
        <DashboardLayout>
            <Head title="Comprovativo de pagamento" />

            <div className="mx-auto max-w-4xl space-y-6">
                <header className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">
                            Pagamento concluído
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            Comprovativo de pagamento
                        </h1>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Consulta ou imprime os dados deste pagamento.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                            href={route('pagamentos.show', pagamento.id)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft size={18} />
                            Voltar ao detalhe
                        </Link>

                        <button
                            type="button"
                            onClick={imprimirComprovativo}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
                        >
                            <Printer size={18} />
                            Imprimir
                        </button>
                    </div>
                </header>

                <main
                    id="comprovativo-pagamento"
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none print:rounded-none print:border-0 print:shadow-none"
                >
                    <section className="relative overflow-hidden bg-slate-950 px-6 py-8 text-white sm:px-10">
                        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
                        <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                        <div className="relative flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
                                        <Building2 size={25} />
                                    </div>

                                    <div>
                                        <p className="text-xl font-black tracking-tight">
                                            SpaceHub
                                        </p>

                                        <p className="text-sm text-slate-400">
                                            Gestão de espaços e reservas
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-400">
                                        Comprovativo
                                    </p>

                                    <h2 className="mt-2 text-3xl font-black tracking-tight">
                                        Pagamento confirmado
                                    </h2>

                                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                                        Documento comprovativo do pagamento associado à
                                        reserva #{reserva?.id ?? '-'}.
                                    </p>
                                </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-teal-400/20 bg-teal-400/10 px-4 py-3">
                                <CheckCircle2
                                    size={26}
                                    className="text-teal-400"
                                />

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-teal-300">
                                        Estado
                                    </p>

                                    <p className="font-bold text-white">
                                        Pago
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="grid border-b border-slate-200 dark:border-slate-800 md:grid-cols-[1fr_280px]">
                        <div className="p-6 sm:p-10">
                            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                                Referência do pagamento
                            </p>

                            <div className="mt-3 flex items-start gap-3">
                                <Hash
                                    size={21}
                                    className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400"
                                />

                                <p className="break-all text-lg font-bold text-slate-900 dark:text-slate-100">
                                    {pagamento.referencia ?? '-'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/40 sm:p-8 md:border-l md:border-t-0">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                                Total pago
                            </p>

                            <p className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                                {formatarValor(pagamento.valor)}
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-8 border-b border-slate-200 p-6 dark:border-slate-800 sm:p-10 lg:grid-cols-2">
                        <div>
                            <div className="mb-5">
                                <p className="text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                                    Dados do pagamento
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                                    Informação da transação
                                </h3>
                            </div>

                            <div className="space-y-5">
                                <Informacao
                                    Icone={CreditCard}
                                    titulo="Método de pagamento"
                                    valor={
                                        METODO_LABELS[
                                        pagamento.metodo_pagamento
                                        ] ?? 'Não indicado'
                                    }
                                />

                                <Informacao
                                    Icone={CalendarDays}
                                    titulo="Data do pagamento"
                                    valor={formatarDataHora(
                                        pagamento.data_pagamento,
                                    )}
                                />

                                <Informacao
                                    Icone={Hash}
                                    titulo="Número do pagamento"
                                    valor={`#${pagamento.id}`}
                                />

                                <Informacao
                                    Icone={CheckCircle2}
                                    titulo="Estado"
                                    valor="Pagamento concluído"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-5">
                                <p className="text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                                    Utilizador
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                                    Titular da reserva
                                </h3>
                            </div>

                            <div className="space-y-5">
                                <Informacao
                                    Icone={UserRound}
                                    titulo="Nome"
                                    valor={utilizador?.name ?? '-'}
                                />

                                <Informacao
                                    Icone={UserRound}
                                    titulo="Email"
                                    valor={utilizador?.email ?? '-'}
                                />

                                <Informacao
                                    Icone={Hash}
                                    titulo="Número da reserva"
                                    valor={`#${reserva?.id ?? '-'}`}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="p-6 sm:p-10">
                        <div className="mb-6">
                            <p className="text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                                Dados da reserva
                            </p>

                            <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                                Espaço reservado
                            </h3>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <ReservaItem
                                Icone={CalendarDays}
                                titulo="Data"
                                valor={formatarData(reserva?.data)}
                            />

                            <ReservaItem
                                Icone={Clock3}
                                titulo="Período"
                                valor={reserva?.periodo?.nome ?? '-'}
                            />

                            <ReservaItem
                                Icone={Building2}
                                titulo="Secretária"
                                valor={secretaria?.codigo ?? '-'}
                            />

                            <ReservaItem
                                Icone={MapPin}
                                titulo="Setor"
                                valor={setor?.nome ?? '-'}
                            />

                            <ReservaItem
                                Icone={Building2}
                                titulo="Piso"
                                valor={
                                    piso?.nome ??
                                    piso?.codigo ??
                                    '-'
                                }
                            />

                            <ReservaItem
                                Icone={Building2}
                                titulo="Edifício"
                                valor={edificio?.nome ?? '-'}
                            />
                        </div>
                    </section>

                    <footer className="border-t border-slate-200 bg-slate-50 px-6 py-6 dark:border-slate-800 dark:bg-slate-950/40 sm:px-10">
                        <div className="space-y-4">

                            <div className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                                <p>
                                    Este comprovativo foi gerado automaticamente pelo SpaceHub.
                                </p>

                                <p className="font-medium">
                                    Referência: {pagamento.referencia ?? '-'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                                <strong>Nota:</strong> Este comprovativo corresponde a uma
                                simulação de pagamento realizada para fins académicos.
                                Não constitui um documento fiscal nem comprova uma transação
                                financeira real.
                            </div>

                        </div>
                    </footer>
                </main>

                <div className="flex justify-center print:hidden">
                    <button
                        type="button"
                        onClick={imprimirComprovativo}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    >
                        <Download size={18} />
                        Guardar como PDF
                    </button>
                </div>
            </div>

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 12mm;
                    }

                    body {
                        background: white !important;
                    }

                    aside,
                    nav,
                    header:not(#comprovativo-pagamento header) {
                        display: none !important;
                    }

                    #comprovativo-pagamento {
                        width: 100% !important;
                        max-width: none !important;
                        margin: 0 !important;
                    }
                }
            `}</style>
        </DashboardLayout>
    );
}

function Informacao({ Icone, titulo, valor }) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Icone size={19} />
            </div>

            <div className="min-w-0">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {titulo}
                </p>

                <p className="mt-0.5 break-words font-semibold text-slate-900 dark:text-slate-100">
                    {valor}
                </p>
            </div>
        </div>
    );
}

function ReservaItem({ Icone, titulo, valor }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm dark:bg-slate-900 dark:text-teal-400">
                <Icone size={19} />
            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                {titulo}
            </p>

            <p className="mt-1 font-bold text-slate-900 dark:text-slate-100">
                {valor}
            </p>
        </div>
    );
}