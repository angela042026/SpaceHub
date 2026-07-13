import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ faqs }) {

    // Texto introduzido na pesquisa
    const [pesquisa, setPesquisa] = useState('');

    // Guarda a FAQ atualmente aberta
    const [faqAberta, setFaqAberta] = useState(null);

    return (
        <AuthenticatedLayout header={
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                Help Center
            </h2>
        }
        >
            <Head title="Help Center" />
            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="mb-6 text-2xl font-bold">
                                Help Center
                            </h3>
                            <p className="mb-8 text-gray-600">
                                Encontre respostas rápidas às perguntas mais frequentes sobre a utilização do SPACE HUB.
                            </p>

                            {/* Barra de pesquisa Inteligente*/}
                            <div className="mb-8">
                                <input type="text" placeholder="Pesquisar uma pergunta..." value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} className="w-full rounded-lg border border-gray-300 p-3 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200" />
                            </div>

                            {/* FAQs */}
                            {Object.keys(faqs).map((categoria) => {

                                // Filtra apenas as FAQs que correspondem à pesquisa
                                const faqsFiltradas = faqs[categoria].filter((faq) =>

                                    faq.pergunta.toLowerCase().includes(pesquisa.toLowerCase()) ||
                                    faq.resposta.toLowerCase().includes(pesquisa.toLowerCase())

                                );

                                // Não apresenta categorias sem resultados
                                if (faqsFiltradas.length === 0) {
                                    return null;
                                }

                                return (
                                    <div key={categoria} className="mb-8">
                                        <h4 className="mb-4 border-b pb-2 text-xl font-semibold text-teal-600">
                                            {categoria}
                                        </h4>
                                        {faqsFiltradas.map((faq) => (
                                            <div key={faq.id} className="mb-4 overflow-hidden rounded-lg border border-gray-200 shadow-sm" >
                                                {/* Pergunta */}
                                                <button
                                                    onClick={() => setFaqAberta(faqAberta === faq.id ? null : faq.id)} className="flex w-full items-center justify-between bg-white p-4 text-left font-semibold hover:bg-gray-50" >
                                                    <span>{faq.pergunta}</span>
                                                    <span className="text-xl text-teal-600">
                                                        {faqAberta === faq.id ? '−' : '+'}
                                                    </span>
                                                </button>

                                                {/* Resposta */}
                                                {faqAberta === faq.id && (
                                                    <div className="border-t bg-gray-50 p-4">
                                                        <p className="text-gray-600">
                                                            {faq.resposta}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}

                            {/* Contactar Suporte */}
                            <div className="mt-12 rounded-xl border border-teal-200 bg-teal-50 p-8 text-center">
                                <h3 className="mb-3 text-2xl font-semibold text-gray-800">
                                    Ainda precisa de ajuda?
                                </h3>
                                <p className="mb-8 text-gray-600">
                                    A nossa equipa está disponível para o ajudar.
                                </p>
                                <Link href={route('support.create')} className="inline-block rounded-lg px-6 py-3 font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: '#14B8A6' }} >
                                    Contactar Suporte
                                </Link>
                            </div>

                        </div>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}