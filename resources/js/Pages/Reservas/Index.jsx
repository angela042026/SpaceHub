import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ reservas }) {

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    As Minhas Reservas
                </h2>
            }
        >
            <Head title="Reservas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                        <div className="p-6">

                            <div className="flex items-center justify-between mb-6">

                                <h3 className="text-lg font-semibold">
                                    As Minhas Reservas
                                </h3>

                                <Link
                                    href={route('reservas.create')}
                                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                >
                                    Nova Reserva
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

                                    {reservas.length === 0 ? (

                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-4 py-6 text-center text-gray-500"
                                            >
                                                Ainda não existem reservas.
                                            </td>
                                        </tr>

                                    ) : (

                                        reservas.map((reserva) => (

                                            <tr key={reserva.id}>

                                                <td className="px-4 py-3">
                                                    {new Date(reserva.data).toLocaleDateString('pt-PT')}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {reserva.periodo.nome}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {reserva.secretaria.codigo}
                                                </td>

                                                <td className="px-4 py-3">

                                                    <span className="rounded bg-yellow-100 px-2 py-1 text-sm text-yellow-800">
                                                        {reserva.estado_reserva.nome}
                                                    </span>

                                                </td>

                                            </tr>

                                        ))

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}