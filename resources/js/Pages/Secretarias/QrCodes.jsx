import { Head } from '@inertiajs/react';

import DashboardLayout from '@/Layouts/DashboardLayout';

export default function QrCodes({ pisos }) {
    return (
        <>
            <Head title="QR Codes das Secretárias" />

            <DashboardLayout>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            QR Codes das Secretárias
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Imprime ou faz download do código de cada secretária para afixar no
                            espaço físico.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="btn-primary self-start"
                    >
                        Imprimir tudo
                    </button>
                </div>

                <div className="space-y-8">
                    {pisos.map((piso) => (
                        <div key={piso.id} className="dashboard-card p-6">
                            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                                {piso.nome}
                            </h2>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                                {piso.secretarias.map((secretaria) => (
                                    <div
                                        key={secretaria.id}
                                        className="rounded-xl border border-slate-100 p-4 text-center dark:border-slate-800"
                                    >
                                        <img
                                            src={secretaria.qrUrl}
                                            alt={`QR Code ${secretaria.codigo}`}
                                            className="mx-auto h-28 w-28"
                                        />

                                        <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                                            {secretaria.codigo}
                                        </p>

                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {secretaria.setor}
                                        </p>

                                        <a
                                            href={secretaria.qrUrl}
                                            download={`${secretaria.codigo}.svg`}
                                            className="mt-2 inline-block text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400"
                                        >
                                            Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardLayout>
        </>
    );
}
