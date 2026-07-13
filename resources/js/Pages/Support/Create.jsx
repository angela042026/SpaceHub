import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Create() {

    // Dados do utilizador autenticado
    const { auth } = usePage().props;

    // Formulário
    const { data, setData, post, processing, errors } = useForm({
        assunto: '',
        mensagem: '',
    });

    /** Envia o pedido de suporte.*/
    const submit = (e) => {
        e.preventDefault();
        post(route('support.store'));
    };

    return (
        <AuthenticatedLayout header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Contactar Suporte
                </h2>
            }
        >

            <Head title="Contactar Suporte" />
            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-6 text-2xl font-bold">
                                Contactar Suporte
                            </h3>
                            <p className="mb-8 text-gray-600">
                                Não encontrou a resposta que procurava?
                                Envie-nos a sua questão e responderemos com a maior brevidade possível.
                            </p>
                            <form onSubmit={submit}>
                                {/* Nome */}
                                <div className="mb-4">
                                    <label className="mb-2 block font-medium">
                                        Nome
                                    </label>
                                    <input
                                        type="text"
                                        value={auth.user.name}
                                        disabled
                                        className="w-full rounded border bg-gray-100 p-2" />
                                </div>

                                {/* Email */}
                                <div className="mb-4">
                                    <label className="mb-2 block font-medium">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={auth.user.email}
                                        disabled
                                        className="w-full rounded border bg-gray-100 p-2" />
                                </div>

                                {/* Assunto */}
                                <div className="mb-4">
                                    <label className="mb-2 block font-medium">
                                        Assunto
                                    </label>
                                    <select
                                        value={data.assunto}
                                        onChange={(e) => setData('assunto', e.target.value)}
                                        className="w-full rounded border p-2"
                                    >
                                        <option value="">Selecione...</option>
                                        <option>Reservas</option>
                                        <option>Check-in</option>
                                        <option>Conta</option>
                                        <option>Problema Técnico</option>
                                        <option>Outro</option>
                                    </select>

                                    {errors.assunto && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.assunto}
                                        </p>
                                    )}

                                </div>

                                {/* Mensagem */}
                                <div className="mb-6">
                                    <label className="mb-2 block font-medium">
                                        Mensagem
                                    </label>
                                    <textarea
                                        rows="6"
                                        value={data.mensagem}
                                        onChange={(e) => setData('mensagem', e.target.value)}
                                        className="w-full rounded border p-2" />

                                    {errors.mensagem && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.mensagem}
                                        </p> 
                                    )}

                                </div>

                                {/* Botão */}
                                <button type="submit" disabled={processing} className="rounded-lg px-6 py-3 font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: '#14B8A6' }}>
                                    {processing
                                        ? 'A enviar...'
                                        : 'Enviar Pedido'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </AuthenticatedLayout>

    );
}