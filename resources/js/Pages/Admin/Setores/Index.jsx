import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import { LoadingOverlay } from '@/Components/Loading';
import { Head, Link, router } from '@inertiajs/react';
import {
    MapPinned,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    Search,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tipoSetorLabel } from '@/utils/tiposSetor';
import { formatarNomePiso } from '@/utils/formatarNomePiso';
import { ESTADO_UTILIZADOR, etiqueta } from '@/utils/estados';

export default function Index({ setores, pisos, filters }) {
    const { t } = useTranslation('admin');
    const { t: tc } = useTranslation('common');
    const [processingId, setProcessingId] = useState(null);
    const [carregando, setCarregando] = useState(false);

    const [search, setSearch] = useState(filters.search ?? '');
    const [pisoId, setPisoId] = useState(filters.piso_id ?? '');
    const [ativoFiltro, setAtivoFiltro] = useState(filters.ativo ?? '');
    const primeiraRenderizacao = useRef(true);

    const irComFiltros = (valores) => {
        router.get(route('admin.setores.index'), valores, {
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
            irComFiltros({ search, piso_id: pisoId, ativo: ativoFiltro });
        }, 350);

        return () => clearTimeout(temporizador);
    }, [search]);

    const handlePisoChange = (value) => {
        setPisoId(value);
        irComFiltros({ search, piso_id: value, ativo: ativoFiltro });
    };

    const handleAtivoChange = (value) => {
        setAtivoFiltro(value);
        irComFiltros({ search, piso_id: pisoId, ativo: value });
    };

    const limpar = () => {
        setSearch('');
        setPisoId('');
        setAtivoFiltro('');
        irComFiltros({});
    };

    const alternarAtivo = (setor) => {
        const mensagem = setor.ativo
            ? t('setores.index.confirmarDesativar', { nome: setor.nome })
            : t('setores.index.confirmarAtivar', { nome: setor.nome });

        if (!confirm(mensagem)) {
            return;
        }

        setProcessingId(setor.id);

        router.patch(
            route('admin.setores.toggleAtivo', setor.id),
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
            label: t('setores.index.colunaSetor'),
            render: (setor) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {setor.nome}
                    </p>
                    <p className="text-xs text-slate-400">{setor.codigo}</p>
                </div>
            ),
        },
        {
            key: 'piso',
            label: t('campos.piso'),
            render: (setor) => formatarNomePiso(setor.piso),
        },
        {
            key: 'tipo',
            label: t('campos.tipo'),
            render: (setor) => tipoSetorLabel(setor.tipo, t),
        },
        {
            key: 'reservavel',
            label: t('setores.index.reservavel'),
            render: (setor) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        setor.reservavel
                            ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                    }`}
                >
                    {setor.reservavel ? t('setores.index.reservavel') : t('setores.index.naoReservavel')}
                </span>
            ),
        },
        {
            key: 'ativo',
            label: t('listagem.estado'),
            render: (setor) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        setor.ativo
                            ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                >
                    {etiqueta(ESTADO_UTILIZADOR, String(setor.ativo), setor.ativo ? 'Ativo' : 'Inativo', tc)}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: t('listagem.acoes'),
            align: 'right',
            render: (setor) => (
                <div className="flex justify-end gap-2">
                    <Link
                        href={route('admin.setores.edit', setor.id)}
                        title={t('setores.index.editarSetor')}
                        aria-label={t('setores.index.editarSetor')}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                    >
                        <Pencil size={16} strokeWidth={1.9} />
                    </Link>

                    <button
                        type="button"
                        onClick={() => alternarAtivo(setor)}
                        disabled={processingId === setor.id}
                        title={setor.ativo ? t('setores.index.desativarSetor') : t('setores.index.ativarSetor')}
                        aria-label={setor.ativo ? t('setores.index.desativarSetor') : t('setores.index.ativarSetor')}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            setor.ativo
                                ? 'border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500 dark:border-slate-700'
                                : 'border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700'
                        }`}
                    >
                        {processingId === setor.id ? (
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
            <Head title={t('setores.index.titulo')} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <MapPinned size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('setores.index.titulo')}
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('setores.index.registados', { count: setores.meta.total })}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.setores.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                    >
                        <Plus size={18} strokeWidth={2} />
                        {t('setores.index.novoSetor')}
                    </Link>
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
                            placeholder={t('setores.index.pesquisarPlaceholder')}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <select
                        value={pisoId}
                        onChange={(event) => handlePisoChange(event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">{t('setores.index.todosOsPisos')}</option>

                        {pisos.map((piso) => (
                            <option key={piso.id} value={piso.id}>
                                {piso.nome}
                            </option>
                        ))}
                    </select>

                    <select
                        value={ativoFiltro}
                        onChange={(event) => handleAtivoChange(event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">{t('listagem.todosOsEstados')}</option>
                        <option value="1">{t('listagem.ativos')}</option>
                        <option value="0">{t('listagem.inativos')}</option>
                    </select>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={limpar}
                            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-500 transition hover:border-slate-300 dark:border-slate-700"
                        >
                            {t('listagem.limpar')}
                        </button>
                    </div>
                </div>

                <div className="relative p-6">
                    <LoadingOverlay show={carregando} />

                    <Table
                        columns={columns}
                        data={setores.data}
                        emptyMessage={t('setores.index.semResultados')}
                    />

                    <Pagination
                        pagination={setores}
                        disabled={carregando}
                        onStart={() => setCarregando(true)}
                        onFinish={() => setCarregando(false)}
                    />
                </div>
            </section>
        </DashboardLayout>
    );
}
