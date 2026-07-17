import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const badgeClasses = {
    pendente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-blue-100 text-blue-800',
    cancelada: 'bg-red-100 text-red-800',
    expirada: 'bg-gray-200 text-gray-700',
    concluida: 'bg-green-100 text-green-800',
};

export default function History({ reservas }) {

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Histórico de Reservas
                </h2>
            }
        >
            <Head title="Histórico de Reservas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                        <div className="p-6">

                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Reservas Passadas
                                </h3>

                                <Link
                                    href={route('reservas.index')}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Ver reservas atuais
                                </Link>
                            </div>

                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Data
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Período
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Espaço
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {reservas.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                                                Ainda não existem reservas no histórico.
                                            </td>
                                        </tr>
                                    ) : (
                                        reservas.data.map((reserva) => (
                                            <tr key={reserva.id}>
                                                <td className="px-4 py-3">
                                                    {new Date(reserva.data).toLocaleDateString('pt-PT')}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {reserva.periodo.nome}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="font-medium">
                                                        {reserva.secretaria.setor.nome}
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        Código: {reserva.secretaria.codigo}
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`rounded px-2 py-1 text-sm ${badgeClasses[reserva.estadoReserva.codigo] ?? 'bg-gray-100 text-gray-700'}`}
                                                    >
                                                        {reserva.estadoReserva.nome}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {reservas.data.length > 0 && (
                                <div className="mt-6 flex flex-wrap items-center justify-center gap-1">
                                    {reservas.links.map((link, index) => (
                                        link.url === null ? (
                                            <span
                                                key={index}
                                                className="rounded px-3 py-1 text-sm text-gray-400"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                preserveScroll
                                                className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </div>
                            )}

                        </div>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}
