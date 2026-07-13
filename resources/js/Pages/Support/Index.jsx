import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ pedidos }) {

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Pedidos de Suporte
                </h2>
            }
        >
            <Head title="Pedidos de Suporte" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-6 text-2xl font-bold">
                                Pedidos de Suporte
                            </h3>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Data
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Utilizador
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Email
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Assunto
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {pedidos.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                                                Ainda não existem pedidos de suporte.
                                            </td>
                                        </tr>

                                    ) : (
                                        pedidos.map((pedido) => (
                                            <tr key={pedido.id}>
                                                <td className="px-4 py-3">
                                                    {new Date(pedido.created_at).toLocaleDateString('pt-PT')}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {pedido.user.name}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {pedido.user.email}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {pedido.assunto}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="rounded bg-yellow-100 px-2 py-1 text-sm text-yellow-800">
                                                        {pedido.estado}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                                                        Ver
                                                    </button>
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