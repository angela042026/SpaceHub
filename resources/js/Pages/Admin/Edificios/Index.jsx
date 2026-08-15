import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import { LoadingOverlay } from '@/Components/Loading';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    Search,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function Index({ edificios, filters }) {
    const [processingId, setProcessingId] = useState(null);
    const [carregando, setCarregando] = useState(false);

    const [search, setSearch] = useState(filters.search ?? '');
    const [ativoFiltro, setAtivoFiltro] = useState(filters.ativo ?? '');
    const primeiraRenderizacao = useRef(true);

    const irComFiltros = (valores) => {
        router.get(route('admin.edificios.index'), valores, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setCarregando(true),
            onFinish: () => setCarregando(false),
        });
    };

    // Pesquisa automática, com debounce, enquanto o utilizador escreve.
    useEffect(() => {
        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false;
            return;
        }

        const temporizador = setTimeout(() => {
            irComFiltros({ search, ativo: ativoFiltro });
        }, 350);

        return () => clearTimeout(temporizador);
    }, [search]);

    const handleAtivoChange = (value) => {
        setAtivoFiltro(value);
        irComFiltros({ search, ativo: value });
    };

    const limpar = () => {
        setSearch('');
        setAtivoFiltro('');
        irComFiltros({});
    };

    const alternarAtivo = (edificio) => {
        const mensagem = edificio.ativo
            ? `Desativar o edifício ${edificio.nome}?`
            : `Ativar o edifício ${edificio.nome}?`;

        if (!confirm(mensagem)) {
            return;
        }

        setProcessingId(edificio.id);

        router.patch(
            route('admin.edificios.toggleAtivo', edificio.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const columns = [
        {
            key: 'nome',
            label: 'Edifício',
            render: (edificio) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {edificio.nome}
                    </p>
                    <p className="text-xs text-slate-400">{edificio.codigo}</p>
                </div>
            ),
        },
        {
            key: 'morada',
            label: 'Localização',
            render: (edificio) => (
                <span className="text-slate-600 dark:text-slate-300">
                    {[edificio.cidade, edificio.pais].filter(Boolean).join(', ') || '-'}
                </span>
            ),
        },
        {
            key: 'ativo',
            label: 'Estado',
            render: (edificio) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        edificio.ativo
                            ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                >
                    {edificio.ativo ? 'Ativo' : 'Inativo'}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: 'Ações',
            align: 'right',
            render: (edificio) => (
                <div className="flex justify-end gap-2">
                    <Link
                        href={route('admin.edificios.edit', edificio.id)}
                        title="Editar edifício"
                        aria-label="Editar edifício"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                    >
                        <Pencil size={16} strokeWidth={1.9} />
                    </Link>

                    <button
                        type="button"
                        onClick={() => alternarAtivo(edificio)}
                        disabled={processingId === edificio.id}
                        title={edificio.ativo ? 'Desativar edifício' : 'Ativar edifício'}
                        aria-label={edificio.ativo ? 'Desativar edifício' : 'Ativar edifício'}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            edificio.ativo
                                ? 'border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500 dark:border-slate-700'
                                : 'border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700'
                        }`}
                    >
                        {processingId === edificio.id ? (
                            <RotateCcw size={16} strokeWidth={1.9} className="animate-spin" />
                        ) : (
                            <Power size={16} strokeWidth={1.9} />
                        )}
                    </button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout>
            <Head title="Edifícios" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <Building2 size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Edifícios
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {edificios.meta.total} edifício{edificios.meta.total === 1 ? '' : 's'} registado{edificios.meta.total === 1 ? '' : 's'}.
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.edificios.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                    >
                        <Plus size={18} strokeWidth={2} />
                        Novo edifício
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:grid-cols-[1fr_160px_auto]">
                    <div className="relative">
                        <Search
                            size={16}
                            strokeWidth={1.9}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Pesquisar por nome, código ou cidade"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <select
                        value={ativoFiltro}
                        onChange={(event) => handleAtivoChange(event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">Todos os estados</option>
                        <option value="1">Ativos</option>
                        <option value="0">Inativos</option>
                    </select>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={limpar}
                            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:border-slate-300 dark:border-slate-700"
                        >
                            Limpar
                        </button>
                    </div>
                </div>

                <div className="relative p-6">
                    <LoadingOverlay show={carregando} />

                    <Table
                        columns={columns}
                        data={edificios.data}
                        emptyMessage="Nenhum edifício encontrado."
                    />

                    <Pagination
                        pagination={edificios}
                        disabled={carregando}
                        onStart={() => setCarregando(true)}
                        onFinish={() => setCarregando(false)}
                    />
                </div>
            </section>
        </DashboardLayout>
    );
}
