import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Create({ secretarias, periodos }) {

    // Lista de secretárias disponíveis
    const [secretariasDisponiveis, setSecretariasDisponiveis] = useState(secretarias);

    const { data, setData, post, processing, errors } = useForm({
        data: '',
        periodo_id: '',
        secretaria_id: '',
        observacoes: '',
    });

    // Atualiza automaticamente as secretárias disponíveis
    // quando a data ou o período são alterados.
    useEffect(() => {

        // Apenas consulta a disponibilidade quando ambos os campos estão preenchidos.
        if (!data.data || !data.periodo_id) {
            return;
        }

        fetch(route('reservas.availability', { data: data.data, periodo_id: data.periodo_id }), {
            headers: { Accept: 'application/json' },
        })
            .then((response) => {

                // Verifica se a resposta é válida
                if (!response.ok) {
                    throw new Error('Erro ao consultar disponibilidade.');
                }

                return response.json();

            })
            .then((secretarias) => {

                // Atualiza a lista de secretárias disponíveis
                setSecretariasDisponiveis(secretarias);

                // Limpa a secretária anteriormente selecionada
                setData('secretaria_id', '');

            })
            .catch((error) => {

                console.error(error);

            });

    }, [data.data, data.periodo_id]);

    const submit = (e) => {
        e.preventDefault();
        post(route('reservas.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Nova Reserva
                </h2>
            }
        >
            <Head title="Nova Reserva" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                        <div className="p-6">

                            <h3 className="mb-6 text-lg font-semibold">
                                Criar Reserva
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

                                    {secretariasDisponiveis.length === 0 && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            Não há secretárias disponíveis para a data e período selecionados.
                                        </p>
                                    )}

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
                                    {processing ? 'A guardar...' : 'Reservar'}
                                </button>

                            </form>

                        </div>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}