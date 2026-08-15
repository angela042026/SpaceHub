import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import { LoadingOverlay } from '@/Components/Loading';
import { Head, Link, router } from '@inertiajs/react';
import {
    Armchair,
    Pencil,
    Plus,
    Power,
    QrCode,
    RotateCcw,
    Search,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { formatarNomePiso } from '@/utils/formatarNomePiso';

export default function Index({ secretarias, setores, filters }) {
    const [processingId, setProcessingId] = useState(null);
    const [carregando, setCarregando] = useState(false);

    const [search, setSearch] = useState(filters.search ?? '');
    const [setorId, setSetorId] = useState(filters.setor_id ?? '');
    const [ativoFiltro, setAtivoFiltro] = useState(filters.ativo ?? '');
    const primeiraRenderizacao = useRef(true);

    const irComFiltros = (valores) => {
        router.get(route('admin.secretarias.index'), valores, {
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
            irComFiltros({ search, setor_id: setorId, ativo: ativoFiltro });
        }, 350);

        return () => clearTimeout(temporizador);
    }, [search]);

    const handleSetorChange = (value) => {
        setSetorId(value);
        irComFiltros({ search, setor_id: value, ativo: ativoFiltro });
    };

    const handleAtivoChange = (value) => {
        setAtivoFiltro(value);
        irComFiltros({ search, setor_id: setorId, ativo: value });
    };

    const limpar = () => {
        setSearch('');
        setSetorId('');
        setAtivoFiltro('');
        irComFiltros({});
    };

    const alternarAtivo = (secretaria) => {
        const mensagem = secretaria.ativo
            ? `Desativar a secretária ${secretaria.codigo}?`
            : `Ativar a secretária ${secretaria.codigo}?`;

        if (!confirm(mensagem)) {
            return;
        }

        setProcessingId(secretaria.id);

        router.patch(
            route('admin.secretarias.toggleAtivo', secretaria.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const columns = [
        {
            key: 'codigo',
            label: 'Secretária',
            render: (secretaria) => (
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                        <Armchair size={16} strokeWidth={1.9} />
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {secretaria.codigo}
                    </p>
                </div>
            ),
        },
        {
            key: 'setor',
            label: 'Setor',
            render: (secretaria) => secretaria.setor ?? '-',
        },
        {
            key: 'piso',
            label: 'Piso',
            render: (secretaria) => formatarNomePiso(secretaria.piso),
        },
        {
            key: 'reservavel',
            label: 'Reservável',
            render: (secretaria) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        secretaria.reservavel
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                    }`}
                >
                    {secretaria.reservavel ? 'Reservável' : 'Não reservável'}
                </span>
            ),
        },
        {
            key: 'ativo',
            label: 'Estado',
            render: (secretaria) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        secretaria.ativo
                            ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                >
                    {secretaria.ativo ? 'Ativa' : 'Inativa'}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: 'Ações',
            align: 'right',
            render: (secretaria) => (
                <div className="flex justify-end gap-2">
                    <Link
                        href={route('secretarias.qrcode', secretaria.id)}
                        title="Ver QR Code"
                        aria-label="Ver QR Code"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                    >
                        <QrCode size={16} strokeWidth={1.9} />
                    </Link>

                    <Link
                        href={route('admin.secretarias.edit', secretaria.id)}
                        title="Editar secretária"
                        aria-label="Editar secretária"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                    >
                        <Pencil size={16} strokeWidth={1.9} />
                    </Link>

                    <button
                        type="button"
                        onClick={() => alternarAtivo(secretaria)}
                        disabled={processingId === secretaria.id}
                        title={secretaria.ativo ? 'Desativar secretária' : 'Ativar secretária'}
                        aria-label={secretaria.ativo ? 'Desativar secretária' : 'Ativar secretária'}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            secretaria.ativo
                                ? 'border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500 dark:border-slate-700'
                                : 'border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700'
                        }`}
                    >
                        {processingId === secretaria.id ? (
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
            <Head title="Secretárias" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <Armchair size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                Secretárias
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {secretarias.meta.total} secretária{secretarias.meta.total === 1 ? '' : 's'} registada{secretarias.meta.total === 1 ? '' : 's'}.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href={route('secretarias.qrcodes')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300"
                        >
                            <QrCode size={18} strokeWidth={1.9} />
                            Ver QR Codes
                        </Link>

                        <Link
                            href={route('admin.secretarias.create')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                        >
                            <Plus size={18} strokeWidth={2} />
                            Nova secretária
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 sm:grid-cols-[1fr_200px_160px_auto]">
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
                            placeholder="Pesquisar por código"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <select
                        value={setorId}
                        onChange={(event) => handleSetorChange(event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">Todos os setores</option>

                        {setores.map((setor) => (
                            <option key={setor.id} value={setor.id}>
                                {setor.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        value={ativoFiltro}
                        onChange={(event) => handleAtivoChange(event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">Todos os estados</option>
                        <option value="1">Ativas</option>
                        <option value="0">Inativas</option>
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
                        data={secretarias.data}
                        emptyMessage="Nenhuma secretária encontrada."
                    />

                    <Pagination
                        pagination={secretarias}
                        disabled={carregando}
                        onStart={() => setCarregando(true)}
                        onFinish={() => setCarregando(false)}
                    />
                </div>
            </section>
        </DashboardLayout>
    );
}
