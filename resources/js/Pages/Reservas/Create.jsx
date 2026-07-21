import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Create({ periodos, pisos, setores }) {

    console.log('Pisos:', pisos);
    console.log('Setores:', setores);

    const [setoresFiltrados, setSetoresFiltrados] = useState([]);
    const [secretariasDisponiveis, setSecretariasDisponiveis] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        data: '',
        periodo_id: '',
        piso_id: '',
        setor_id: '',
        secretaria_id: '',
        observacoes: '',
    });

    // Filtra os tipos de espaço conforme o piso selecionado
    useEffect(() => {

        if (!data.piso_id) {
            setSetoresFiltrados([]);
            setSecretariasDisponiveis([]);
            setData('setor_id', '');
            setData('secretaria_id', '');
            return;
        }

        const lista = setores.filter(setor => setor.piso_id == data.piso_id);

        setSetoresFiltrados(lista);
        setSecretariasDisponiveis([]);
        setData('setor_id', '');
        setData('secretaria_id', '');

    }, [data.piso_id]);

    // Atualiza os lugares disponíveis
    useEffect(() => {

        if (!data.data || !data.periodo_id || !data.setor_id) {
            setSecretariasDisponiveis([]);
            setData('secretaria_id', '');
            return;
        }

        fetch(route('reservas.availability', {
            data: data.data,
            periodo_id: data.periodo_id,
            setor_id: data.setor_id,
        }), {
            headers: {
                Accept: 'application/json',
            },
        })
            .then((response) => {

                if (!response.ok) {
                    throw new Error('Erro ao consultar disponibilidade.');
                }
                return response.json();
            })
            .then((secretarias) => {

                setSecretariasDisponiveis(secretarias);
                setData('secretaria_id', '');
            })
            .catch((error) => {
                console.error(error);
            });

    }, [data.data, data.periodo_id, data.setor_id]);

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
                                        className="w-full rounded border p-2" />

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
                                        className="w-full rounded border p-2" >
                                        <option value="">
                                            Selecione...
                                        </option>
                                        {periodos.map((periodo) => (
                                            <option
                                                key={periodo.id}
                                                value={periodo.id}>
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

                                {/* Piso */}
                                <div className="mb-4">
                                    <label className="mb-2 block font-medium">
                                        Piso
                                    </label>

                                    <select
                                        value={data.piso_id}
                                        onChange={(e) => setData('piso_id', e.target.value)}
                                        className="w-full rounded border p-2" >
                                        <option value="">
                                            Selecione...
                                        </option>

                                        {pisos.map((piso) => (
                                            <option
                                                key={piso.id}
                                                value={piso.id} >
                                                {piso.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tipo de Espaço */}
                                <div className="mb-4">
                                    <label className="mb-2 block font-medium">
                                        Tipo de Espaço
                                    </label>
                                    <select
                                        value={data.setor_id}
                                        onChange={(e) => setData('setor_id', e.target.value)}
                                        className="w-full rounded border p-2" >
                                        <option value="">
                                            Selecione...
                                        </option>
                                        {setoresFiltrados.map((setor) => (
                                            <option
                                                key={setor.id}
                                                value={setor.id}>
                                                {setor.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Lugar */}
                                <div className="mb-4">
                                    <label className="mb-2 block font-medium">
                                        Lugar
                                    </label>
                                    <select
                                        value={data.secretaria_id}
                                        onChange={(e) => setData('secretaria_id', e.target.value)}
                                        className="w-full rounded border p-2" >
                                        <option value="">
                                            Selecione...
                                        </option>
                                        {secretariasDisponiveis.map((secretaria) => (
                                            <option
                                                key={secretaria.id}
                                                value={secretaria.id} >
                                                {secretaria.codigo} — {secretaria.descricao}
                                            </option>
                                        ))}
                                    </select>
                                    {secretariasDisponiveis.length === 0 && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            Não existem lugares disponíveis para a data, período e tipo de espaço selecionados.
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
                                        className="w-full rounded border p-2" />
                                    {errors.observacoes && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.observacoes}
                                        </p>
                                    )}
                                </div>
                                <button type="submit"
                                    disabled={processing}
                                    className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50" >
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