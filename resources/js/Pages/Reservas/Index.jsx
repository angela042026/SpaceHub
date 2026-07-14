import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <Head title="As Minhas Reservas" />

            {/* Container principal */}
            <div className="py-8">
                <div className="mx-auto max-w-7xl px-6">

                    {/* =========================================================
                       Cabeçalho da página
                    ========================================================== */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">
                                As Minhas Reservas
                            </h1>
                            <p className="mt-2 text-gray-600">
                                Consulte, crie, altere ou cancele as suas reservas de secretárias.
                            </p>
                        </div>

                        {/* Botão Nova Reserva */}
                        <Link
                            href={route('reservas.create')}
                            className="rounded-lg bg-teal-500 px-5 py-3 font-semibold text-white shadow transition hover:bg-teal-600"
                        >
                            + Nova Reserva
                        </Link>

                    </div>

                    {/* =========================================================
                       Área dos Filtros
                       (Nesta fase apenas visual)
                    ========================================================== */}

                    <div className="mb-6 rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold">
                            Filtros
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">

                            {/* Data */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Data
                                </label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border border-gray-300"
                                />
                            </div>

                            {/* Edifício */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Edifício
                                </label>
                                <select className="w-full rounded-lg border border-gray-300">
                                    <option>Todos</option>
                                </select>
                            </div>

                            {/* Piso */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Piso
                                </label>
                                <select className="w-full rounded-lg border border-gray-300">
                                    <option>Todos</option>
                                </select>
                            </div>

                            {/* Setor */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Setor
                                </label>
                                <select className="w-full rounded-lg border border-gray-300">
                                    <option>Todos</option>
                                </select>
                            </div>

                            {/* Período */}
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Período
                                </label>
                                <select className="w-full rounded-lg border border-gray-300">
                                    <option>Todos</option>
                                    <option>Manhã</option>
                                    <option>Tarde</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* =========================================================
                       Área da Tabela
                       (Ainda sem dados)
                    ========================================================== */}

                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="mb-4 text-lg font-semibold">
                            Reservas
                        </h2>

                        {/* Estado vazio */}
                        <div className="py-20 text-center">
                            <h3 className="text-xl font-semibold text-gray-700">
                                Ainda não possui reservas.
                            </h3>
                            <p className="mt-2 text-gray-500">
                                Quando criar a primeira reserva, ela aparecerá aqui.
                            </p>
                            <Link href={route('reservas.create')}
                                className="mt-6 inline-block rounded-lg bg-[#1E3A5F] px-6 py-3 font-semibold text-white transition hover:bg-[#16314f]"
                            >
                                Criar primeira reserva
                            </Link>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}