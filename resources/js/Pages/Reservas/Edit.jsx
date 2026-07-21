import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Edit({ reserva, secretarias, periodos }) {

    // Lista de secretárias disponíveis para a data/período selecionados
    const [secretariasDisponiveis, setSecretariasDisponiveis] = useState(secretarias);

    const { data, setData, put, processing, errors } = useForm({
        data: reserva.data,
        periodo_id: String(reserva.periodo_id),
        secretaria_id: String(reserva.secretaria_id),
        observacoes: reserva.observacoes ?? '',
    });

    // Atualiza a lista de secretárias disponíveis quando a data ou o
    // período são alterados (mantém a secretária atual na lista).
    useEffect(() => {

        if (!data.data || !data.periodo_id) {
            return;
        }

        fetch(route('reservas.availability', { data: data.data, periodo_id: data.periodo_id }), {
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erro ao consultar disponibilidade.');
                }

                return response.json();
            })
            .then((disponiveis) => {

                // Garante que a secretária atualmente atribuída continua
                // selecionável, mesmo que já não conste como "disponível".
                const jaIncluida = disponiveis.some((s) => String(s.id) === data.secretaria_id);

                if (!jaIncluida) {
                    const atual = secretarias.find((s) => String(s.id) === data.secretaria_id);

                    if (atual) {
                        disponiveis = [...disponiveis, atual];
                    }
                }

                setSecretariasDisponiveis(disponiveis);
            })
            .catch((error) => {
                console.error(error);
            });

    }, [data.data, data.periodo_id]);

    const submit = (e) => {
        e.preventDefault();
        put(route('reservas.update', reserva.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Editar Reserva
                </h2>
            }
        >
            <Head title="Editar Reserva" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                        <div className="p-6">

                            <h3 className="mb-6 text-lg font-semibold">
                                Editar Reserva
                            </h3>

                            <form onSubmit={submit}>

                                {/* Data */}
                                <div className="mb-4">
                                    <label className="mb-2 block font-medium">
                                        Data
                                    </label>

                                    <input
                                        type="date"
                                        value={data.data}
                                        onChange={(e) => setData('data', e.target.value)}
                                        className="w-full rounded border p-2"
                                    />

                                    {errors.data && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.data}
                                        </p>
                                    )}
                                </div>

                                {/* Período */}
                                <div className="mb-4">
                                    <label className="mb-2 block font-medium">
                                        Período
                                    </label>

                                    <select
                                        value={data.periodo_id}
                                        onChange={(e) => setData('periodo_id', e.target.value)}
                                        className="w-full rounded border p-2"
                                    >
                                        <option value="">
                                            Selecione...
                                        </option>

                                        {periodos.map((periodo) => (
                                            <option
                                                key={periodo.id}
                                                value={periodo.id}
                                            >
                                                {periodo.nome}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.periodo_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.periodo_id}
                                        </p>
                                    )}
                                </div>

                                {/* Espaço */}
                                <div className="mb-4">
                                    <label className="mb-2 block font-medium">
                                        Espaço
                                    </label>

                                    <select
                                        value={data.secretaria_id}
                                        onChange={(e) => setData('secretaria_id', e.target.value)}
                                        className="w-full rounded border p-2"
                                    >
                                        <option value="">
                                            Selecione...
                                        </option>

                                        {secretariasDisponiveis.map((secretaria) => (
                                            <option
                                                key={secretaria.id}
                                                value={secretaria.id}
                                            >
                                                {secretaria.codigo}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.secretaria_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.secretaria_id}
                                        </p>
                                    )}
                                </div>

                                {/* Observações */}
                                <div className="mb-6">
                                    <label className="mb-2 block font-medium">
                                        Observações
                                    </label>

                                    <textarea
                                        rows={4}
                                        value={data.observacoes}
                                        onChange={(e) => setData('observacoes', e.target.value)}
                                        className="w-full rounded border p-2"
                                    />

                                    {errors.observacoes && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.observacoes}
                                        </p>
                                    )}
                                </div>

                                {/* Botão */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'A guardar...' : 'Guardar Alterações'}
                                </button>

                            </form>

                        </div>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}
