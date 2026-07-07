import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ secretarias, periodos }) {

    const { data, setData, post, processing, errors } = useForm({
        data: '',
        periodo_id: '',
        secretaria_id: '',
        observacoes: '',
    });

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

                            <h3 className="text-lg font-semibold mb-6">
                                Criar Reserva
                            </h3>

                            <form onSubmit={submit}>

                                {/* Data */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Data
                                    </label>

                                    <input
                                        type="date"
                                        value={data.data}
                                        onChange={(e) => setData('data', e.target.value)}
                                        className="w-full border rounded p-2"
                                    />

                                    {errors.data && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.data}
                                        </p>
                                    )}
                                </div>

                                {/* Período */}
                                <div className="mb-4">
                                    <label className="block font-medium mb-2">
                                        Período
                                    </label>

                                    <select
                                        value={data.periodo_id}
                                        onChange={(e) => setData('periodo_id', e.target.value)}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Selecione...</option>

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
                                    <label className="block font-medium mb-2">
                                        Espaço
                                    </label>

                                    <select
                                        value={data.secretaria_id}
                                        onChange={(e) => setData('secretaria_id', e.target.value)}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Selecione...</option>

                                        {secretarias.map((secretaria) => (
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
                                    <label className="block font-medium mb-2">
                                        Observações
                                    </label>

                                    <textarea
                                        rows="4"
                                        value={data.observacoes}
                                        onChange={(e) => setData('observacoes', e.target.value)}
                                        className="w-full border rounded p-2"
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