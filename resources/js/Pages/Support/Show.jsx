import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Show({ pedido }) {

    const { patch, processing } = useForm();

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Pedido de Suporte
                </h2>
            }
        >
            <Head title="Pedido de Suporte" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">

                        <div className="p-6">

                            <h3 className="mb-8 text-2xl font-bold">
                                Pedido de Suporte #{pedido.id}
                            </h3>

                            <div className="grid gap-6 md:grid-cols-2">

                                {/* Utilizador */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">
                                        Utilizador
                                    </p>

                                    <p className="mt-1 text-lg">
                                        {pedido.user.name}
                                    </p>
                                </div>

                                {/* Email */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">
                                        Email
                                    </p>

                                    <p className="mt-1 text-lg">
                                        {pedido.user.email}
                                    </p>
                                </div>

                                {/* Assunto */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">
                                        Assunto
                                    </p>

                                    <p className="mt-1 text-lg">
                                        {pedido.assunto}
                                    </p>
                                </div>

                                {/* Data */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">
                                        Data
                                    </p>

                                    <p className="mt-1 text-lg">
                                        {new Date(pedido.created_at).toLocaleDateString('pt-PT')}
                                    </p>
                                </div>

                                {/* Estado */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-500">
                                        Estado
                                    </p>

                                    <span className="mt-2 inline-block rounded bg-yellow-100 px-3 py-1 text-sm text-yellow-800">
                                        {pedido.estado}
                                    </span>
                                </div>

                            </div>

                            {/* Mensagem */}
                            <div className="mt-8">

                                <p className="mb-2 text-sm font-semibold text-gray-500">
                                    Mensagem
                                </p>

                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">

                                    <p className="whitespace-pre-line text-gray-700">
                                        {pedido.mensagem}
                                    </p>

                                </div>

                            </div>

                            {/* Botões */}
                            <div className="mt-8 flex gap-4">

                                {pedido.estado === 'Pendente' ? (

                                    <button onClick={() => patch(route('support.update', pedido.id))} disabled={processing}
                                        className="rounded px-6 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"style={{ backgroundColor: '#14B8A6' }}>
                                        {processing ? 'A atualizar...' : 'Marcar como Resolvido'}
                                    </button>

                                ) : (
                                    <span className="rounded bg-green-100 px-4 py-2 font-semibold text-green-800">
                                        Pedido Resolvido
                                    </span>
                                )}

                                <Link
                                    href={route('support.index')}
                                    className="rounded border border-gray-300 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    Voltar
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}