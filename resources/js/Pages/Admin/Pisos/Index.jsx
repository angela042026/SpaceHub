import DashboardLayout from '@/Layouts/DashboardLayout';
import Table from '@/Components/Table';
import Pagination from '@/Components/Pagination';
import { LoadingOverlay } from '@/Components/Loading';
import { Head, Link, router } from '@inertiajs/react';
import {
    Layers3,
    Pencil,
    Plus,
    Power,
    RotateCcw,
    Search,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ESTADO_UTILIZADOR, etiqueta } from '@/utils/estados';

export default function Index({ pisos, edificios, filters }) {
    const { t } = useTranslation('admin');
    const { t: tc } = useTranslation('common');
    const [processingId, setProcessingId] = useState(null);
    const [carregando, setCarregando] = useState(false);

    const [search, setSearch] = useState(filters.search ?? '');
    const [edificioId, setEdificioId] = useState(filters.edificio_id ?? '');
    const [ativoFiltro, setAtivoFiltro] = useState(filters.ativo ?? '');
    const primeiraRenderizacao = useRef(true);

    const irComFiltros = (valores) => {
        router.get(route('admin.pisos.index'), valores, {
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
            irComFiltros({ search, edificio_id: edificioId, ativo: ativoFiltro });
        }, 350);

        return () => clearTimeout(temporizador);
    }, [search]);

    const handleEdificioChange = (value) => {
        setEdificioId(value);
        irComFiltros({ search, edificio_id: value, ativo: ativoFiltro });
    };

    const handleAtivoChange = (value) => {
        setAtivoFiltro(value);
        irComFiltros({ search, edificio_id: edificioId, ativo: value });
    };

    const limpar = () => {
        setSearch('');
        setEdificioId('');
        setAtivoFiltro('');
        irComFiltros({});
    };

    const alternarAtivo = (piso) => {
        const mensagem = piso.ativo
            ? t('pisos.index.confirmarDesativar', { nome: piso.nome })
            : t('pisos.index.confirmarAtivar', { nome: piso.nome });

        if (!confirm(mensagem)) {
            return;
        }

        setProcessingId(piso.id);

        router.patch(
            route('admin.pisos.toggleAtivo', piso.id),
            {},
            {
                preserveScroll: true,
                onFinish: () => setProcessingId(null),
            },
        );
    };

    // Apenas apresentação: alguns pisos guardam o nome como "Piso -1 Garagem"
    // (prefixo + designação colados só por um espaço). Sem tocar nos dados
    // guardados, insere-se um separador visual entre as duas partes.
    const formatarNomePiso = (piso) => {
        const prefixo = `Piso ${piso.numero}`;

        if (typeof piso.nome === 'string' && piso.nome.startsWith(prefixo)) {
            const resto = piso.nome.slice(prefixo.length).trim();
            return resto ? `${prefixo} · ${resto}` : prefixo;
        }

        return piso.nome;
    };

    const columns = [
        {
            key: 'nome',
            label: t('pisos.index.colunaPiso'),
            render: (piso) => (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {formatarNomePiso(piso)}
                    </p>
                    <p className="text-xs text-slate-400">{piso.codigo}</p>
                </div>
            ),
        },
        {
            key: 'edificio',
            label: t('campos.edificio'),
            render: (piso) => piso.edificio ?? '-',
        },
        {
            key: 'ativo',
            label: t('listagem.estado'),
            render: (piso) => (
                <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                        piso.ativo
                            ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}
                >
                    {etiqueta(ESTADO_UTILIZADOR, String(piso.ativo), piso.ativo ? 'Ativo' : 'Inativo', tc)}
                </span>
            ),
        },
        {
            key: 'acoes',
            label: t('listagem.acoes'),
            align: 'right',
            render: (piso) => (
                <div className="flex justify-end gap-2">
                    <Link
                        href={route('admin.pisos.edit', piso.id)}
                        title={t('pisos.index.editarPiso')}
                        aria-label={t('pisos.index.editarPiso')}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700"
                    >
                        <Pencil size={16} strokeWidth={1.9} />
                    </Link>

                    <button
                        type="button"
                        onClick={() => alternarAtivo(piso)}
                        disabled={processingId === piso.id}
                        title={piso.ativo ? t('pisos.index.desativarPiso') : t('pisos.index.ativarPiso')}
                        aria-label={piso.ativo ? t('pisos.index.desativarPiso') : t('pisos.index.ativarPiso')}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            piso.ativo
                                ? 'border-slate-200 text-slate-500 hover:border-red-400 hover:text-red-500 dark:border-slate-700'
                                : 'border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-500 dark:border-slate-700'
                        }`}
                    >
                        {processingId === piso.id ? (
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
            <Head title={t('pisos.index.titulo')} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <Layers3 size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('pisos.index.titulo')}
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('pisos.index.registados', { count: pisos.meta.total })}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.pisos.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                    >
                        <Plus size={18} strokeWidth={2} />
                        {t('pisos.index.novoPiso')}
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
                            placeholder={t('pisos.index.pesquisarPlaceholder')}
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />
                    </div>

                    <select
                        value={edificioId}
                        onChange={(event) => handleEdificioChange(event.target.value)}
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                        <option value="">{t('pisos.index.todosOsEdificios')}</option>

                        {edificios.map((edificio) => (
                            <option key={edificio.id} value={edificio.id}>
                                {edificio.nome}
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
                        data={pisos.data}
                        emptyMessage={t('pisos.index.semResultados')}
                    />

                    <Pagination
                        pagination={pisos}
                        disabled={carregando}
                        onStart={() => setCarregando(true)}
                        onFinish={() => setCarregando(false)}
                    />
                </div>
            </section>
        </DashboardLayout>
    );
}
