import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Index({ reservas, setores, filters }) {

    // Cancelar reserva
    const cancelarReserva = (id) => {
        if (!confirm('Tem a certeza que pretende cancelar esta reserva?')) {
            return;
        }

        router.delete(route('reservas.destroy', id));
    };

    // Filtros
    const { data, setData, get } = useForm({
        estado: filters.estado ?? '',
        data: filters.data ?? '',
        setor: filters.setor ?? '',
    });

    // Pesquisar
    const pesquisar = (e) => {
        e.preventDefault();

        get(route('reservas.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Limpar filtros
    const limpar = () => {
        router.get(route('reservas.index'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Reservas
                </h2>
            }
        >
            <Head title="Reservas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                        <div className="p-6">

                            <div className="mb-6 flex items-center justify-between">

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

                            {/* Filtros */}

                            <form
                                onSubmit={pesquisar}
                                className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5"
                            >

                                <div>

                                    <label className="mb-1 block text-sm font-medium">
                                        Estado
                                    </label>

                                    <select
                                        value={data.estado}
                                        onChange={(e) => setData('estado', e.target.value)}
                                        className="w-full rounded border p-2"
                                    >
                                        <option value="">Todos</option>
                                        <option value="pendente">Pendente</option>
                                        <option value="confirmada">Confirmada</option>
                                        <option value="cancelada">Cancelada</option>
                                        <option value="concluida">Concluída</option>
                                        <option value="expirada">Expirada</option>
                                    </select>

                                </div>

                                <div>

                                    <label className="mb-1 block text-sm font-medium">
                                        Data
                                    </label>

                                    <input
                                        type="date"
                                        value={data.data}
                                        onChange={(e) => setData('data', e.target.value)}
                                        className="w-full rounded border p-2"
                                    />

                                </div>

                                <div>

                                    <label className="mb-1 block text-sm font-medium">
                                        Espaço
                                    </label>

                                    <select
                                        value={data.setor}
                                        onChange={(e) => setData('setor', e.target.value)}
                                        className="w-full rounded border p-2"
                                    >

                                        <option value="">Todos</option>

                                        {setores.map((setor) => (
                                            <option
                                                key={setor.id}
                                                value={setor.id}
                                            >
                                                {setor.nome}
                                            </option>
                                        ))}

                                    </select>

                                </div>

                                <div className="flex items-end gap-2">

                                    <button
                                        type="submit"
                                        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                                    >
                                        Pesquisar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={limpar}
                                        className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
                                    >
                                        Limpar
                                    </button>

                                </div>

                            </form>

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

                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Ações
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-gray-200 bg-white">

                                    {reservas.length === 0 ? (

                                        <tr>

                                            <td
                                                colSpan="5"
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

                                                    <div className="font-medium">
                                                        {reserva.secretaria.setor.nome}
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        Código: {reserva.secretaria.codigo}
                                                    </div>

                                                </td>

                                                <td className="px-4 py-3">

                                                    <span
                                                        className={`rounded px-2 py-1 text-sm
                                                            ${
                                                                reserva.estadoReserva.codigo === 'pendente'
                                                                    ? 'bg-yellow-100 text-yellow-800'
                                                                    : reserva.estadoReserva.codigo === 'confirmada'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : reserva.estadoReserva.codigo === 'cancelada'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : reserva.estadoReserva.codigo === 'expirada'
                                                                    ? 'bg-gray-200 text-gray-700'
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}
                                                    >
                                                        {reserva.estadoReserva.nome}
                                                    </span>

                                                </td>

                                                <td className="px-4 py-3">

                                                    {reserva.estadoReserva.codigo === 'pendente' ? (

                                                        <button
                                                            onClick={() => cancelarReserva(reserva.id)}
                                                            className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                                                        >
                                                            Cancelar
                                                        </button>

                                                    ) : (

                                                        <span className="text-sm text-gray-500">
                                                            Sem ações
                                                        </span>

                                                    )}

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
