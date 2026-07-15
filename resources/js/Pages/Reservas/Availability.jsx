import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Availability({ periodos, secretariasDisponiveis, filters }) {

    const { data, setData, get, processing } = useForm({
        data: filters.data ?? '',
        periodo_id: filters.periodo_id ?? '',
    });

    const consultar = (e) => {
        e.preventDefault();

        get(route('reservas.availability'), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const jaConsultou = secretariasDisponiveis !== null;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Disponibilidade
                </h2>
            }
        >
            <Head title="Consultar Disponibilidade" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                        <div className="p-6">

                            <h3 className="mb-6 text-lg font-semibold">
                                Consultar Disponibilidade
                            </h3>

                            <form
                                onSubmit={consultar}
                                className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3"
                            >
                                <div>
                                    <label className="mb-2 block font-medium">
                                        Data
                                    </label>

                                    <input
                                        type="date"
                                        value={data.data}
                                        onChange={(e) => setData('data', e.target.value)}
                                        className="w-full rounded border p-2"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block font-medium">
                                        Período
                                    </label>

                                    <select
                                        value={data.periodo_id}
                                        onChange={(e) => setData('periodo_id', e.target.value)}
                                        className="w-full rounded border p-2"
                                        required
                                    >
                                        <option value="">
                                            Selecione...
                                        </option>

                                        {periodos.map((periodo) => (
                                            <option key={periodo.id} value={periodo.id}>
                                                {periodo.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        Consultar
                                    </button>
                                </div>
                            </form>

                            {jaConsultou && (
                                secretariasDisponiveis.length === 0 ? (
                                    <p className="py-6 text-center text-gray-500">
                                        Não há secretárias disponíveis para a data e período selecionados.
                                    </p>
                                ) : (
                                    <div className="divide-y divide-gray-200 rounded border">
                                        {secretariasDisponiveis.map((secretaria) => (
                                            <div
                                                key={secretaria.id}
                                                className="flex items-center justify-between p-4"
                                            >
                                                <div>
                                                    <div className="font-medium">
                                                        {secretaria.codigo}
                                                    </div>

                                                    <div className="text-sm text-gray-500">
                                                        {secretaria.setor?.piso?.edificio?.nome} · {secretaria.setor?.piso?.nome} · {secretaria.setor?.nome}
                                                    </div>
                                                </div>

                                                <Link
                                                    href={route('reservas.create', {
                                                        data: data.data,
                                                        periodo_id: data.periodo_id,
                                                    })}
                                                    className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                                >
                                                    Reservar
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}

                        </div>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}
