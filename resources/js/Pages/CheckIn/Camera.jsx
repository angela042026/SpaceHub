import { Head } from '@inertiajs/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

import DashboardLayout from '@/Layouts/DashboardLayout';

const READER_ID = 'qr-reader';

export default function Camera() {
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(READER_ID, { fps: 10, qrbox: 250 }, false);
        scannerRef.current = scanner;

        scanner.render(
            (decodedText) => {
                scanner.clear().catch(() => {});
                window.location.assign(decodedText);
            },
            () => {
                // Ignora falhas de leitura frame-a-frame (normal enquanto o QR não está enquadrado).
            },
        );

        return () => {
            scannerRef.current?.clear().catch(() => {});
        };
    }, []);

    return (
        <>
            <Head title="Ler QR Code" />

            <DashboardLayout>
                <div className="mx-auto max-w-lg">
                    <div className="dashboard-card p-6">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Fazer Check-in
                        </h1>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Aponta a câmara para o QR Code afixado na secretária.
                        </p>

                        <div id={READER_ID} className="mt-6 overflow-hidden rounded-2xl" />

                        <p className="mt-4 text-xs text-slate-400">
                            A leitura por câmara requer HTTPS ou acesso via localhost. Também
                            podes visitar diretamente o link do QR Code no browser.
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        </>
    );
}
