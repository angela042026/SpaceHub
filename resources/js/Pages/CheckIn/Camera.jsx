import { Head, Link } from '@inertiajs/react';
import { Html5Qrcode } from 'html5-qrcode';
import {
    AlertTriangle,
    Camera as CameraIcon,
    CalendarDays,
    CalendarPlus,
    CheckCircle2,
    CircleCheck,
    Clock,
    ImageUp,
    Loader2,
    LocateFixed,
    Lock,
    QrCode,
    ScanLine,
    ShieldCheck,
    Smartphone,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';
import LocalizacaoEspaco from '@/Components/Reservas/LocalizacaoEspaco';
import { RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT } from '@/Lib/reservaAlteracaoBar';

const READER_ID = 'qr-reader';
const FILE_READER_ID = 'qr-file-reader';

/**
 * Confirma que o QR Code lido aponta para a página de check-in do
 * próprio site (mesma origem), e não para um URL arbitrário. Um QR
 * Code físico pode ser substituído/adulterado por alguém com acesso
 * ao espaço — sem esta validação, o browser (autenticado) seria
 * redirecionado para onde o conteúdo do código apontasse.
 */
function ehLinkDeCheckinValido(texto) {
    let url;

    try {
        url = new URL(texto, window.location.origin);
    } catch {
        return false;
    }

    return (
        url.origin === window.location.origin
        && url.pathname.startsWith('/checkin/scan/')
    );
}

/**
 * Nome de exibição de um espaço — igual ao usado nas restantes
 * páginas de reservas (ex.: "Escritório 01").
 */
function nomeEspaco(secretaria) {
    if (!secretaria) {
        return '-';
    }

    const categoriaNome = secretaria.setor?.nome;
    const numeroLugar = secretaria.codigo?.match(/\d+$/)?.[0];

    return categoriaNome
        ? `${categoriaNome} ${numeroLugar ?? ''}`.trim()
        : secretaria.codigo;
}

function classificarErroCamara(erro) {
    const nome = erro?.name ?? '';
    const texto = String(erro?.message ?? erro ?? '').toLowerCase();

    if (nome === 'NotAllowedError' || texto.includes('permission')) {
        return {
            title: 'Acesso à câmara recusado',
            message:
                'Autoriza o acesso à câmara nas definições do navegador e tenta novamente, ou seleciona uma imagem com o QR Code.',
        };
    }

    if (nome === 'NotFoundError' || nome === 'OverconstrainedError') {
        return {
            title: 'Nenhuma câmara encontrada',
            message:
                'Não foi detetada nenhuma câmara neste dispositivo. Podes selecionar uma imagem com o QR Code em alternativa.',
        };
    }

    return {
        title: 'Não foi possível iniciar a câmara',
        message:
            'Ocorreu um problema ao aceder à câmara. Tenta novamente ou seleciona uma imagem com o QR Code.',
    };
}

const RESUMO_STATUS = {
    pronta: {
        label: 'Dentro do horário',
        className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    },
    ja_check_in: {
        label: 'Check-in confirmado',
        className: 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300',
    },
    pendente_pagamento: {
        label: 'Pagamento pendente',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    },
    fora_da_janela: {
        label: 'Fora do horário',
        className: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    },
};

const steps = [
    {
        icon: LocateFixed,
        title: 'Encontre a secretária',
        description:
            'Dirija-se à secretária indicada na sua reserva e localize o QR Code afixado.',
    },
    {
        icon: Smartphone,
        title: 'Autorize a câmara',
        description:
            'Clique em iniciar leitura e permita o acesso à câmara do dispositivo.',
    },
    {
        icon: ScanLine,
        title: 'Leia o QR Code',
        description:
            'Mantenha o código enquadrado na área de leitura durante alguns segundos.',
    },
    {
        icon: CircleCheck,
        title: 'Confirme o check-in',
        description:
            'O sistema valida a reserva e confirma automaticamente a sua chegada.',
    },
];

export default function Camera({ reservas }) {
    const scannerRef = useRef(null);
    const redirectTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    // idle | requesting | scanning | processing | success | error
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [qrInvalido, setQrInvalido] = useState(false);
    const [errorInfo, setErrorInfo] = useState(null);

    // Quando há mais do que uma reserva elegível, o utilizador escolhe
    // qual mostrar no resumo — nunca é uma escolha silenciosa. O leitor
    // em si não depende desta escolha: valida sempre a secretária lida
    // contra as reservas reais do utilizador, do lado do servidor.
    const [reservaSelecionadaId, setReservaSelecionadaId] = useState(
        reservas[0]?.id ?? null,
    );

    const temReservaElegivel = reservas.length > 0;
    const reservaSelecionada =
        reservas.find((r) => r.id === reservaSelecionadaId) ?? reservas[0] ?? null;

    // Avisa o ChatWidget (mesmo evento global já usado por Reservas/Edit.jsx
    // e por Reservas/Availability.jsx) para não sobrepor as ações do
    // leitor, sempre visíveis nesta página.
    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent(RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT, {
                detail: { visible: true },
            }),
        );

        return () => {
            window.dispatchEvent(
                new CustomEvent(RESERVA_ALTERACAO_BAR_VISIBILITY_EVENT, {
                    detail: { visible: false },
                }),
            );
        };
    }, []);

    async function pararCamara() {
        const leitor = scannerRef.current;
        scannerRef.current = null;

        if (!leitor) {
            return;
        }

        try {
            if (leitor.isScanning) {
                await leitor.stop();
            }

            leitor.clear();
        } catch {
            // Pode já estar parado/limpo.
        }
    }

    useEffect(() => {
        return () => {
            pararCamara();

            if (redirectTimeoutRef.current) {
                window.clearTimeout(redirectTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function processarResultado(decodedText, origem) {
        if (!ehLinkDeCheckinValido(decodedText)) {
            if (origem === 'camera') {
                // A câmara continua ativa — só mostra um aviso contextual,
                // sem interromper a leitura.
                setQrInvalido(true);
                return;
            }

            setStatus('error');
            setErrorInfo({
                title: 'Código QR inválido',
                message:
                    'Este código não é um QR Code de check-in do SpaceHub. Confirma que estás a ler o código afixado na secretária correta.',
            });
            return;
        }

        setQrInvalido(false);

        if (origem === 'camera') {
            await pararCamara();
        }

        setStatus('success');
        setMessage('QR Code lido com sucesso. Estamos a validar a sua reserva...');

        redirectTimeoutRef.current = window.setTimeout(() => {
            window.location.assign(decodedText);
        }, 1200);
    }

    async function iniciarLeitura() {
        if (!temReservaElegivel) {
            return;
        }

        setStatus('requesting');
        setErrorInfo(null);
        setQrInvalido(false);

        const leitor = new Html5Qrcode(READER_ID, { verbose: false });
        scannerRef.current = leitor;

        try {
            await leitor.start(
                { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1,
                },
                (decodedText) => {
                    processarResultado(decodedText, 'camera');
                },
                () => {
                    // É normal existirem falhas enquanto o código não está enquadrado.
                },
            );

            setStatus('scanning');
        } catch (erro) {
            scannerRef.current = null;
            setStatus('error');
            setErrorInfo(classificarErroCamara(erro));
        }
    }

    async function pararLeituraManualmente() {
        await pararCamara();
        setQrInvalido(false);
        setStatus('idle');
    }

    async function aoSelecionarImagem(evento) {
        const ficheiro = evento.target.files?.[0];
        evento.target.value = '';

        if (!ficheiro || !temReservaElegivel) {
            return;
        }

        await pararCamara();
        setQrInvalido(false);
        setErrorInfo(null);
        setStatus('processing');

        const leitorFicheiro = new Html5Qrcode(FILE_READER_ID, { verbose: false });

        try {
            const decodedText = await leitorFicheiro.scanFile(ficheiro, false);
            await processarResultado(decodedText, 'arquivo');
        } catch {
            setStatus('error');
            setErrorInfo({
                title: 'Não foi possível ler o código',
                message:
                    'Não foi encontrado nenhum QR Code válido nesta imagem. Tenta outra fotografia.',
            });
        } finally {
            try {
                leitorFicheiro.clear();
            } catch {
                // Sem elemento para limpar.
            }
        }
    }

    const aLerOuAPedir = status === 'scanning' || status === 'requesting';
    const acoesDesativadas = status === 'processing' || status === 'success';

    const resumo = reservaSelecionada
        ? RESUMO_STATUS[reservaSelecionada.status]
        : null;
    const dataFormatada = reservaSelecionada
        ? new Date(reservaSelecionada.data).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
        : null;

    return (
        <>
            <Head title="Check-in" />

            <DashboardLayout>
                <main className="mx-auto max-w-6xl pb-28">
                    {/* Cabeçalho */}
                    <header className="mb-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#14B8A6]/20 bg-[#14B8A6]/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#0F766E] dark:text-[#5EEAD4]">
                            <QrCode size={14} />
                            Check-in
                        </div>

                        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Confirme a sua chegada
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Leia o QR Code afixado na secretária reservada para
                            confirmar a sua presença no espaço.
                        </p>
                    </header>

                    {/* Resumo da reserva atual — sem reserva elegível, o
                        estado completo já aparece dentro do leitor, por
                        isso não repetimos o aviso aqui em cima. */}
                    {temReservaElegivel && (
                        <div className="mb-6 space-y-2.5">
                            {reservas.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <label htmlFor="reserva-selecionada" className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        Reserva
                                    </label>

                                    <select
                                        id="reserva-selecionada"
                                        value={reservaSelecionada?.id ?? ''}
                                        onChange={(evento) => setReservaSelecionadaId(Number(evento.target.value))}
                                        className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                                    >
                                        {reservas.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.secretaria.codigo} · {r.periodo?.hora_inicio ?? '-'}–{r.periodo?.hora_fim ?? '-'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex flex-col gap-4 rounded-[19px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:gap-0 sm:divide-x sm:divide-slate-100 sm:px-5 sm:py-3.5 dark:sm:divide-slate-800">
                                <div className="flex items-center gap-3 sm:pr-5">
                                    <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                        {reservaSelecionada.secretaria.codigo}
                                    </span>

                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                                            {nomeEspaco(reservaSelecionada.secretaria)}
                                        </p>
                                        <LocalizacaoEspaco secretaria={reservaSelecionada.secretaria} className="mt-0.5" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:px-5">
                                    <CalendarDays size={16} strokeWidth={1.9} className="shrink-0 text-slate-400" />
                                    <span className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                        Hoje, {dataFormatada}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 sm:px-5">
                                    <Clock size={16} strokeWidth={1.9} className="shrink-0 text-slate-400" />
                                    <span className="whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                                        {reservaSelecionada.periodo?.hora_inicio ?? '-'}–{reservaSelecionada.periodo?.hora_fim ?? '-'}
                                    </span>
                                </div>

                                {resumo && (
                                    <div className="sm:ml-auto sm:pl-5">
                                        <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold ${resumo.className}`}>
                                            <CheckCircle2 size={13} strokeWidth={2.2} />
                                            {resumo.label}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-[0.37fr_0.63fr]">
                        {/* Passo a passo */}
                        <section className="dashboard-card p-6 lg:p-7">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-600 dark:text-teal-400">
                                Guia rápido
                            </p>

                            <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                                Como fazer o check-in
                            </h2>

                            <div className="mt-6">
                                {steps.map((step, indice) => (
                                    <div key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
                                        {indice < steps.length - 1 && (
                                            <span className="absolute left-5 top-10 h-[calc(100%-24px)] w-px -translate-x-1/2 bg-teal-200 dark:bg-teal-500/25" />
                                        )}

                                        <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-100 bg-white text-teal-500 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                            <step.icon size={18} strokeWidth={1.9} />
                                        </div>

                                        <div className="pt-1.5">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {step.title}
                                            </h3>

                                            <p className="mt-0.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-2 rounded-2xl border border-sky-100 bg-sky-50/80 p-3.5 dark:border-sky-900/30 dark:bg-sky-950/20">
                                <div className="flex gap-2.5">
                                    <ShieldCheck size={17} strokeWidth={1.9} className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-300" />

                                    <div>
                                        <p className="text-xs font-bold text-sky-900 dark:text-sky-200">
                                            Validação da reserva
                                        </p>

                                        <p className="mt-0.5 text-xs leading-5 text-sky-700 dark:text-sky-300">
                                            O check-in só será aceite na secretária correta e dentro do horário permitido.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Scanner */}
                        <section className="dashboard-card p-6 sm:p-7">
                            <div className="flex items-center gap-4">
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6]">
                                    <CameraIcon size={24} strokeWidth={1.9} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                        Ler QR Code
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Utilize a câmara ou selecione uma imagem.
                                    </p>
                                </div>
                            </div>

                            <div
                                className="relative mt-6 h-[360px] overflow-hidden rounded-[20px] border border-slate-200 bg-white bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.06),transparent_65%)] dark:border-slate-700 dark:bg-slate-900"
                                role="status"
                                aria-live="polite"
                                aria-disabled={!temReservaElegivel}
                            >
                                {status !== 'success' && (
                                    <>
                                        <ScannerCorner position="left-top" />
                                        <ScannerCorner position="right-top" />
                                        <ScannerCorner position="left-bottom" />
                                        <ScannerCorner position="right-bottom" />
                                    </>
                                )}

                                {/* Alvo de montagem da câmara — sempre presente no DOM,
                                    só visível durante a leitura em direto. */}
                                <div
                                    id={READER_ID}
                                    className={`absolute inset-0 z-0 [&>video]:h-full [&>video]:w-full [&>video]:object-cover ${
                                        status === 'scanning' ? '' : 'invisible'
                                    }`}
                                />

                                {status === 'scanning' && (
                                    <div className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900/90 dark:text-emerald-300">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                                        </span>
                                        Câmara ativa
                                    </div>
                                )}

                                {status === 'idle' && !temReservaElegivel && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center opacity-70">
                                        <div className="grid h-20 w-20 place-items-center rounded-[22px] border border-slate-100 bg-white text-slate-400 shadow-[0_14px_35px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
                                            <CalendarDays size={32} strokeWidth={1.7} />
                                        </div>

                                        <h3 className="mt-6 text-xl font-black text-slate-900 dark:text-white">
                                            Nenhuma reserva disponível para check-in
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
                                            Consulta as tuas reservas ou reserva um espaço para realizar o check-in.
                                        </p>
                                    </div>
                                )}

                                {status === 'idle' && temReservaElegivel && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
                                        <div className="grid h-20 w-20 place-items-center rounded-[22px] border border-slate-100 bg-white text-[#14B8A6] shadow-[0_14px_35px_rgba(15,23,42,0.10)] dark:border-slate-700 dark:bg-slate-800">
                                            <CameraIcon size={32} strokeWidth={1.7} />
                                        </div>

                                        <h3 className="mt-6 text-xl font-black text-slate-900 dark:text-white">
                                            Pronto para começar?
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
                                            Aponte a câmara para o QR Code da secretária.
                                        </p>
                                    </div>
                                )}

                                {status === 'requesting' && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
                                        <Loader2 size={36} className="animate-spin text-[#14B8A6]" strokeWidth={1.9} />

                                        <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                                            A pedir acesso à câmara...
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
                                            O navegador vai pedir a tua autorização.
                                        </p>
                                    </div>
                                )}

                                {status === 'processing' && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
                                        <Loader2 size={36} className="animate-spin text-[#14B8A6]" strokeWidth={1.9} />

                                        <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                                            A validar o código...
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
                                            Estamos a confirmar a tua reserva.
                                        </p>
                                    </div>
                                )}

                                {status === 'success' && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-6 text-center dark:from-emerald-950/30 dark:to-slate-900">
                                        <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-[0_15px_35px_rgba(16,185,129,0.2)] dark:bg-emerald-900/40 dark:text-emerald-300">
                                            <CheckCircle2 size={34} strokeWidth={1.9} />
                                        </div>

                                        <h3 className="mt-5 text-lg font-black text-emerald-900 dark:text-emerald-200">
                                            QR Code lido com sucesso
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                                            {message}
                                        </p>

                                        <div className="mx-auto mt-5 h-1.5 w-32 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                            <div className="h-full w-full origin-left animate-pulse rounded-full bg-emerald-500" />
                                        </div>
                                    </div>
                                )}

                                {status === 'error' && errorInfo && (
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
                                        <div className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
                                            <AlertTriangle size={26} strokeWidth={1.9} />
                                        </div>

                                        <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
                                            {errorInfo.title}
                                        </h3>

                                        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
                                            {errorInfo.message}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {qrInvalido && status === 'scanning' && (
                                <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                                    <AlertTriangle size={16} strokeWidth={1.9} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />

                                    <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
                                        Este código não é um QR Code de check-in do SpaceHub. Confirma que estás a ler o código afixado na secretária correta.
                                    </p>
                                </div>
                            )}

                            {status === 'scanning' && !qrInvalido && (
                                <p className="mt-3 text-center text-xs leading-5 text-slate-400 dark:text-slate-500">
                                    Mantenha o QR Code enquadrado dentro da moldura. A deteção é automática.
                                </p>
                            )}

                            {/* Ações */}
                            {temReservaElegivel ? (
                                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={aLerOuAPedir ? pararLeituraManualmente : iniciarLeitura}
                                        disabled={acoesDesativadas}
                                        className="group inline-flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-[#14B8A6] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(20,184,166,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0F9C8E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 dark:focus-visible:ring-offset-slate-900"
                                    >
                                        <CameraIcon size={18} strokeWidth={1.9} className="transition-transform duration-200 group-hover:scale-110" />
                                        {aLerOuAPedir ? 'Parar leitura' : 'Iniciar leitura'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={acoesDesativadas}
                                        className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-navy-900 bg-white px-6 py-3 text-sm font-bold text-navy-900 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
                                    >
                                        <ImageUp size={18} strokeWidth={1.9} />
                                        Selecionar imagem
                                    </button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={aoSelecionarImagem}
                                        className="hidden"
                                        aria-label="Selecionar imagem com QR Code"
                                    />
                                </div>
                            ) : (
                                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href={route('reservas.index')}
                                        className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-[#14B8A6] px-6 py-3 text-sm font-bold text-white shadow-[0_12px_28px_rgba(20,184,166,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0F9C8E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                                    >
                                        <CalendarDays size={18} strokeWidth={1.9} />
                                        Ver minhas reservas
                                    </Link>

                                    <Link
                                        href={route('reservas.create')}
                                        className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-navy-900 bg-white px-6 py-3 text-sm font-bold text-navy-900 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-900"
                                    >
                                        <CalendarPlus size={18} strokeWidth={1.9} />
                                        Reservar espaço
                                    </Link>
                                </div>
                            )}

                            {temReservaElegivel && (
                                <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400 dark:text-slate-500">
                                    <Lock size={12} strokeWidth={2} />
                                    A câmara só será utilizada durante a leitura.
                                </p>
                            )}

                            {/* Alvo oculto para a leitura por ficheiro */}
                            <div id={FILE_READER_ID} className="hidden" />
                        </section>
                    </div>
                </main>
            </DashboardLayout>
        </>
    );
}

function ScannerCorner({ position }) {
    const positions = {
        'left-top':
            'left-5 top-5 rounded-tl-2xl border-l-2 border-t-2',
        'right-top':
            'right-5 top-5 rounded-tr-2xl border-r-2 border-t-2',
        'left-bottom':
            'bottom-5 left-5 rounded-bl-2xl border-b-2 border-l-2',
        'right-bottom':
            'bottom-5 right-5 rounded-br-2xl border-b-2 border-r-2',
    };

    return (
        <span
            className={`pointer-events-none absolute z-20 h-9 w-9 border-[#14B8A6] ${positions[position]}`}
        />
    );
}
