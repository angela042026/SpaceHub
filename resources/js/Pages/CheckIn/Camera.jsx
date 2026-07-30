import { Head } from '@inertiajs/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
    AlertTriangle,
    Camera as CameraIcon,
    CheckCircle2,
    CircleCheck,
    ImageUp,
    Info,
    LocateFixed,
    QrCode,
    ScanLine,
    ShieldCheck,
    Smartphone,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';

const READER_ID = 'qr-reader';

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

const steps = [
    {
        icon: LocateFixed,
        number: '01',
        title: 'Encontre a secretária',
        description:
            'Dirija-se à secretária indicada na sua reserva e localize o QR Code afixado.',
    },
    {
        icon: Smartphone,
        number: '02',
        title: 'Autorize a câmara',
        description:
            'Clique em iniciar leitura e permita o acesso à câmara do dispositivo.',
    },
    {
        icon: ScanLine,
        number: '03',
        title: 'Leia o QR Code',
        description:
            'Mantenha o código enquadrado na área de leitura durante alguns segundos.',
    },
    {
        icon: CircleCheck,
        number: '04',
        title: 'Confirme o check-in',
        description:
            'O sistema valida a reserva e confirma automaticamente a sua chegada.',
    },
];

export default function Camera() {
    const scannerRef = useRef(null);
    const redirectTimeoutRef = useRef(null);

    const [scannerStarted, setScannerStarted] = useState(false);
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [qrInvalido, setQrInvalido] = useState(false);

    useEffect(() => {
        if (!scannerStarted || status === 'success') {
            return;
        }

        const scanner = new Html5QrcodeScanner(
            READER_ID,
            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250,
                },
                aspectRatio: 1,
            },
            false,
        );

        scannerRef.current = scanner;

        scanner.render(
            async (decodedText) => {
                if (!ehLinkDeCheckinValido(decodedText)) {
                    setQrInvalido(true);
                    return;
                }

                setQrInvalido(false);
                setStatus('success');
                setMessage(
                    'QR Code lido com sucesso. Estamos a validar a sua reserva...',
                );

                try {
                    await scanner.clear();
                } catch {
                    // O leitor pode já estar encerrado.
                }

                scannerRef.current = null;

                redirectTimeoutRef.current = window.setTimeout(() => {
                    window.location.assign(decodedText);
                }, 1200);
            },
            () => {
                // É normal existirem falhas enquanto o código não está enquadrado.
            },
        );

        return () => {
            scannerRef.current?.clear().catch(() => { });
            scannerRef.current = null;
        };
    }, [scannerStarted, status]);

    useEffect(() => {
        return () => {
            if (redirectTimeoutRef.current) {
                window.clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, []);

    const startScanner = () => {
        setMessage('');
        setQrInvalido(false);
        setStatus('scanning');
        setScannerStarted(true);
    };

    return (
        <>
            <Head title="Check-in" />

            <DashboardLayout>
                <main className="mx-auto max-w-6xl pb-10">
                    {/* Cabeçalho */}
                    <header className="mb-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#14B8A6]/20 bg-[#14B8A6]/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[#0F766E] dark:text-[#5EEAD4]">
                            <QrCode size={14} />
                            Check-in
                        </div>

                        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Confirme a sua chegada
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                            Leia o QR Code afixado na secretária reservada para
                            confirmar a sua presença no espaço.
                        </p>
                    </header>

                    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        {/* Passo a passo */}
                        <section className="dashboard-card overflow-hidden">
                            <div className="border-b border-slate-100 bg-gradient-to-r from-[#03172B] to-[#0A2C48] px-6 py-6 text-white dark:border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#5EEAD4]">
                                        <ShieldCheck size={25} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5EEAD4]">
                                            Guia rápido
                                        </p>

                                        <h2 className="mt-1 text-xl font-black">
                                            Como fazer o check-in
                                        </h2>
                                    </div>
                                </div>

                                <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                                    O processo demora apenas alguns segundos.
                                    Siga os passos apresentados abaixo.
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                    {steps.map((step) => (
                                        <StepCard
                                            key={step.number}
                                            {...step}
                                        />
                                    ))}
                                </div>

                                <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
                                    <div className="flex gap-3">
                                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
                                            <Info size={18} />
                                        </div>

                                        <div>
                                            <p className="text-sm font-bold text-sky-900 dark:text-sky-200">
                                                Validação da reserva
                                            </p>

                                            <p className="mt-1 text-sm leading-6 text-sky-700 dark:text-sky-300">
                                                O check-in só será aceite na
                                                secretária correta, durante o
                                                horário da reserva e dentro do
                                                período permitido.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Scanner */}
                        <section className="dashboard-card p-6 sm:p-7">
                            <div className="flex items-center gap-4">
                                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#14B8A6]/10 text-[#14B8A6]">
                                    <CameraIcon size={24} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                                        Ler QR Code
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Utilize a câmara ou selecione uma
                                        imagem.
                                    </p>
                                </div>
                            </div>

                            {/* Estado inicial */}
                            {!scannerStarted && (
                                <div className="relative mt-7 overflow-hidden rounded-[26px] border border-slate-200 bg-gradient-to-b from-slate-50 to-white px-6 py-12 text-center dark:border-slate-700 dark:from-slate-900/60 dark:to-slate-900/20">
                                    <ScannerCorner position="left-top" />
                                    <ScannerCorner position="right-top" />
                                    <ScannerCorner position="left-bottom" />
                                    <ScannerCorner position="right-bottom" />

                                    <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-[26px] border border-slate-100 bg-white text-[#14B8A6] shadow-[0_18px_45px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-800">
                                        <QrCode
                                            size={47}
                                            strokeWidth={1.7}
                                        />

                                        <span className="absolute inset-x-5 top-1/2 h-0.5 animate-pulse bg-[#14B8A6]/70 shadow-[0_0_10px_rgba(20,184,166,0.8)]" />
                                    </div>

                                    <h3 className="mt-7 text-xl font-black text-slate-900 dark:text-white">
                                        Pronto para começar?
                                    </h3>

                                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                                        Clique no botão e aponte a câmara para o
                                        QR Code da secretária reservada.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={startScanner}
                                        className="group mt-7 inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-[#14B8A6] bg-[#14B8A6] px-10 py-3.5 text-base font-black text-white shadow-[0_16px_38px_rgba(20,184,166,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#14B8A6] hover:shadow-[0_14px_34px_rgba(15,23,42,0.10)] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#14B8A6]/20 dark:hover:bg-slate-800"
                                    >
                                        <CameraIcon
                                            size={20}
                                            className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                                        />

                                        Iniciar leitura
                                    </button>

                                    <p className="mt-4 text-xs text-slate-400">
                                        O navegador poderá solicitar autorização
                                        para utilizar a câmara.
                                    </p>
                                </div>
                            )}

                            {/* Scanner ativo */}
                            {scannerStarted && status === 'scanning' && (
                                <div className="mt-7">
                                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                Enquadre o QR Code
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Mantenha o dispositivo estável
                                                durante a leitura.
                                            </p>
                                        </div>

                                        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                                            <span className="relative flex h-2.5 w-2.5">
                                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                            </span>

                                            Câmara ativa
                                        </div>
                                    </div>

                                    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                        <div
                                            id={READER_ID}
                                            className="overflow-hidden rounded-[18px]"
                                        />
                                    </div>

                                    {qrInvalido && (
                                        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                                            <AlertTriangle
                                                size={18}
                                                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                                            />

                                            <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
                                                Este código não é um QR Code de
                                                check-in do SpaceHub. Certifique-se
                                                de que está a ler o código afixado
                                                na secretária correta.
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/40">
                                        <ScanLine
                                            size={18}
                                            className="mt-0.5 shrink-0 text-[#14B8A6]"
                                        />

                                        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                            Coloque todo o QR Code dentro da
                                            moldura de leitura. A deteção é
                                            automática.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Sucesso */}
                            {status === 'success' && (
                                <div className="mt-7 overflow-hidden rounded-[26px] border border-emerald-200 bg-gradient-to-b from-emerald-50 to-white px-6 py-12 text-center dark:border-emerald-900/40 dark:from-emerald-950/30 dark:to-slate-900/20">
                                    <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-[0_15px_35px_rgba(16,185,129,0.2)] dark:bg-emerald-900/40 dark:text-emerald-300">
                                        <CheckCircle2 size={40} />
                                    </div>

                                    <h3 className="mt-6 text-xl font-black text-emerald-900 dark:text-emerald-200">
                                        QR Code lido com sucesso
                                    </h3>

                                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                                        {message}
                                    </p>

                                    <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                        <div className="h-full w-full origin-left animate-pulse rounded-full bg-emerald-500" />
                                    </div>
                                </div>
                            )}

                            {/* Alternativa por imagem */}
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/30">
                                <div className="flex items-start gap-3">
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
                                        <ImageUp size={19} />
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            Não consegue utilizar a câmara?
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                                            Ao iniciar o leitor, também pode
                                            escolher uma imagem que contenha o
                                            QR Code guardado no dispositivo.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {import.meta.env.DEV && (
                                <p className="mt-4 text-xs leading-5 text-slate-400">
                                    Ambiente de desenvolvimento: o acesso à
                                    câmara requer localhost ou uma ligação HTTPS.
                                </p>
                            )}
                        </section>
                    </div>
                </main>
            </DashboardLayout>
        </>
    );
}

function StepCard({ icon: Icon, number, title, description }) {
    return (
        <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#14B8A6]/50 hover:shadow-lg hover:shadow-slate-200/50 dark:border-slate-700 dark:bg-slate-900/30 dark:hover:border-[#14B8A6]/40 dark:hover:shadow-none">
            <span className="absolute right-4 top-3 text-3xl font-black text-slate-100 transition-colors group-hover:text-[#14B8A6]/10 dark:text-slate-800">
                {number}
            </span>

            <div className="relative flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#14B8A6]/10 text-[#14B8A6] transition-all duration-300 group-hover:bg-[#14B8A6] group-hover:text-[#03172B]">
                    <Icon size={21} />
                </div>

                <div className="pr-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {title}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                </div>
            </div>
        </article>
    );
}

function ScannerCorner({ position }) {
    const positions = {
        'left-top':
            'left-6 top-6 rounded-tl-2xl border-l-2 border-t-2',
        'right-top':
            'right-6 top-6 rounded-tr-2xl border-r-2 border-t-2',
        'left-bottom':
            'bottom-6 left-6 rounded-bl-2xl border-b-2 border-l-2',
        'right-bottom':
            'bottom-6 right-6 rounded-br-2xl border-b-2 border-r-2',
    };

    return (
        <span
            className={`absolute h-11 w-11 border-[#14B8A6] ${positions[position]}`}
        />
    );
}
