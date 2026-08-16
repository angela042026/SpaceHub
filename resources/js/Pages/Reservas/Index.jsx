import DashboardLayout from '@/Layouts/DashboardLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    ImageOff,
    Pencil,
    Plus,
    RotateCcw,
    Star,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolverImagemSecretaria } from '@/utils/imagemSetor';
import { ESTADO_RESERVA, badge, etiqueta, etiquetaPeriodo } from '@/utils/estados';
import { formatarData } from '@/utils/formatadores';
import { ESTADOS_SEM_CANCELAMENTO, podeCancelarReserva } from '@/Components/Reservas/reservaHelpers';
import LocalizacaoEspaco from '@/Components/Reservas/LocalizacaoEspaco';
import { linkGoogleCalendar } from '@/utils/calendario';
import GoogleCalendarIcon from '@/Components/GoogleCalendarIcon';

/*
 * Texto corrido, não um badge: entra a seguir a "Avaliação " numa frase.
 * Por isso não vem do ESTADO_AVALIACAO, que tem etiquetas soltas.
 */
const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

export default function Index({ reservas, setores, pisos, edificios, filters, secretariasFavoritas = [], googleCalendarConectado = false }) {
    const { t, i18n } = useTranslation('reservas');
    const { t: tc } = useTranslation('common');

    // Estrela de "secretária favorita" — marca a secretária (não a
    // reserva), otimista no clique e revertida se o pedido falhar.
    const [favoritas, setFavoritas] = useState(
        () => new Set(secretariasFavoritas),
    );

    const alternarFavorita = (secretariaId) => {
        const jaEraFavorita = favoritas.has(secretariaId);

        setFavoritas((atual) => {
            const seguinte = new Set(atual);
            jaEraFavorita ? seguinte.delete(secretariaId) : seguinte.add(secretariaId);
            return seguinte;
        });

        router.post(
            route('secretarias.favorita.toggle', secretariaId),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    // Reverte se o backend recusar o pedido.
                    setFavoritas((atual) => {
                        const seguinte = new Set(atual);
                        jaEraFavorita ? seguinte.add(secretariaId) : seguinte.delete(secretariaId);
                        return seguinte;
                    });
                },
            },
        );
    };

    // Cancelar reserva
    const [reservaParaCancelar, setReservaParaCancelar] = useState(null);
    const [aCancelar, setACancelar] = useState(false);
    const [erroCancelamento, setErroCancelamento] = useState(null);

    // Limpa o erro de uma tentativa anterior ao abrir o modal para OUTRA
    // reserva — sem isto, o erro de "pagamento já pago" de uma reserva
    // ficava colado ao abrir o modal de outra, antes de sequer tentar.
    const abrirCancelamento = (reserva) => {
        setErroCancelamento(null);
        setReservaParaCancelar(reserva);
    };

    const cancelarReserva = () => {
        setACancelar(true);
        setErroCancelamento(null);

        router.patch(route('reservas.cancelar', reservaParaCancelar.id), {}, {
            preserveScroll: true,
            // Só fecha o modal quando o cancelamento é mesmo aceite —
            // se o backend recusar (ex.: pagamento já pago, sem
            // reembolso disponível), o modal fica aberto a mostrar
            // porquê, em vez de fechar como se nada tivesse acontecido.
            onSuccess: () => setReservaParaCancelar(null),
            onError: (erros) => setErroCancelamento(
                erros.pagamento ?? t('index.modalCancelar.erroGenerico'),
            ),
            onFinish: () => setACancelar(false),
        });
    };

    // Avaliar reserva
    const [reservaParaAvaliar, setReservaParaAvaliar] = useState(null);
    const [notaHover, setNotaHover] = useState(0);

    const avaliacaoForm = useForm({
        nota: 0,
        comentario: '',
    });

    const fecharModalAvaliar = () => {
        setReservaParaAvaliar(null);
        setNotaHover(0);
        avaliacaoForm.reset();
        avaliacaoForm.clearErrors();
    };

    const submeterAvaliacao = (e) => {
        e.preventDefault();

        avaliacaoForm.post(route('avaliacoes.store', reservaParaAvaliar.id), {
            preserveScroll: true,
            onSuccess: () => fecharModalAvaliar(),
        });
    };

    // Filtros
    const { data, setData, get } = useForm({
        estado: filters.estado ?? '',
        data: filters.data ?? '',
        setor: filters.setor ?? '',
        piso: filters.piso ?? '',
        edificio: filters.edificio ?? '',
    });

    const filtrosAtivos = Object.values(data).some(Boolean);

    // Atualiza os resultados automaticamente ao mudar qualquer filtro,
    // sem botão de pesquisa — ignora a primeira renderização, para não
    // repetir o pedido que já trouxe estes props do servidor.
    const primeiraRenderizacao = useRef(true);

    useEffect(() => {
        if (primeiraRenderizacao.current) {
            primeiraRenderizacao.current = false;
            return;
        }

        get(route('reservas.index'), {
            preserveState: true,
            preserveScroll: true,
        });
    }, [data.estado, data.data, data.setor, data.piso, data.edificio]);

    // Limpar filtros
    const limpar = () => {
        router.get(route('reservas.index'));
    };

    // Paginação — o URL já traz os filtros aplicados (withQueryString).
    const irParaPagina = (url) => {
        if (!url) {
            return;
        }

        router.get(url, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <DashboardLayout>
            <Head title={t('index.titulo')} />

            <section className="dashboard-card overflow-hidden">
                <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                            <CalendarDays size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                                {t('index.titulo')}
                            </h1>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('index.descricao', { count: reservas.total })}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('reservas.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg"
                    >
                        <Plus size={18} strokeWidth={2} />
                        {t('index.novaReserva')}
                    </Link>
                </div>

                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800 lg:flex-row lg:items-center">
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        <select
                            value={data.estado}
                            onChange={(e) => setData('estado', e.target.value)}
                            className={fieldClass}
                        >
                            <option value="">{t('index.todosOsEstados')}</option>
                            <option value="pendente">{tc('estados.reserva.pendente')}</option>
                            <option value="confirmada">{tc('estados.reserva.confirmada')}</option>
                            <option value="cancelada">{tc('estados.reserva.cancelada')}</option>
                            <option value="concluida">{tc('estados.reserva.concluida')}</option>
                            <option value="expirada">{tc('estados.reserva.expirada')}</option>
                        </select>

                        <input
                            type="date"
                            value={data.data}
                            onChange={(e) => setData('data', e.target.value)}
                            className={fieldClass}
                        />

                        <select
                            value={data.edificio}
                            onChange={(e) => setData('edificio', e.target.value)}
                            className={fieldClass}
                        >
                            <option value="">{t('index.todosOsEdificios')}</option>

                            {edificios.map((edificio) => (
                                <option key={edificio.id} value={edificio.id}>
                                    {edificio.nome}
                                </option>
                            ))}
                        </select>

                        <select
                            value={data.piso}
                            onChange={(e) => setData('piso', e.target.value)}
                            className={fieldClass}
                        >
                            <option value="">{t('index.todosOsPisos')}</option>

                            {pisos.map((piso) => (
                                <option key={piso.id} value={piso.id}>
                                    {piso.nome}
                                </option>
                            ))}
                        </select>

                        <select
                            value={data.setor}
                            onChange={(e) => setData('setor', e.target.value)}
                            className={fieldClass}
                        >
                            <option value="">{t('index.todosOsEspacos')}</option>

                            {setores.map((setor) => (
                                <option key={setor.id} value={setor.id}>
                                    {setor.nome}
                                </option>
                            ))}
                        </select>
                    </div>

                    {filtrosAtivos && (
                        <button
                            type="button"
                            onClick={limpar}
                            className="shrink-0 self-start text-sm font-semibold text-teal-600 underline underline-offset-2 transition hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 focus-visible:ring-offset-2 dark:text-teal-400 dark:focus-visible:ring-offset-slate-900 lg:self-auto"
                        >
                            {t('index.limparFiltros')}
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {reservas.data.length === 0 ? (
                        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
                            <p className="text-sm text-slate-400">
                                {t('index.semReservas')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {reservas.data.map((reserva) => {
                                const emVigor = !ESTADOS_SEM_CANCELAMENTO.includes(
                                    reserva.estado_reserva?.codigo,
                                );
                                const linkCalendario = emVigor
                                    ? linkGoogleCalendar(reserva)
                                    : null;

                                return (
                                <div
                                    key={reserva.id}
                                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                                >
                                    <div className="relative">
                                        {resolverImagemSecretaria(reserva.secretaria) ? (
                                            <img
                                                src={resolverImagemSecretaria(reserva.secretaria)}
                                                alt={reserva.secretaria?.codigo ?? ''}
                                                className="h-40 w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                                                <ImageOff size={28} strokeWidth={1.6} />
                                            </div>
                                        )}

                                        {reserva.secretaria?.codigo && (
                                            <span className="absolute left-2.5 top-2.5 rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-slate-600 shadow-sm dark:bg-slate-900/90 dark:text-slate-300">
                                                {reserva.secretaria.codigo}
                                            </span>
                                        )}

                                        {reserva.secretaria?.id && (
                                            <button
                                                type="button"
                                                onClick={() => alternarFavorita(reserva.secretaria.id)}
                                                aria-label={
                                                    favoritas.has(reserva.secretaria.id)
                                                        ? t('index.removerDasFavoritas', { codigo: reserva.secretaria.codigo })
                                                        : t('index.marcarComoFavorita', { codigo: reserva.secretaria.codigo })
                                                }
                                                aria-pressed={favoritas.has(reserva.secretaria.id)}
                                                title={
                                                    favoritas.has(reserva.secretaria.id)
                                                        ? t('index.removerDosFavoritos')
                                                        : t('index.adicionarAosFavoritos')
                                                }
                                                className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-400 shadow-sm backdrop-blur transition hover:scale-110 hover:text-amber-500 dark:bg-slate-900/80 dark:text-slate-500"
                                            >
                                                <Star
                                                    size={16}
                                                    strokeWidth={1.9}
                                                    className={
                                                        favoritas.has(reserva.secretaria.id)
                                                            ? 'text-amber-500'
                                                            : ''
                                                    }
                                                    fill={
                                                        favoritas.has(reserva.secretaria.id)
                                                            ? 'currentColor'
                                                            : 'none'
                                                    }
                                                />
                                            </button>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {reserva.secretaria?.setor?.nome ?? '-'}
                                            </p>

                                            <span
                                                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-bold ${badge(
                                                    ESTADO_RESERVA,
                                                    reserva.estado_reserva?.codigo,
                                                )}`}
                                            >
                                                {etiqueta(ESTADO_RESERVA, reserva.estado_reserva?.codigo, '-', tc)}
                                            </span>
                                        </div>

                                        <LocalizacaoEspaco secretaria={reserva.secretaria} className="mt-1.5" />

                                        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                                            {formatarData(reserva.data, i18n.language)} · {etiquetaPeriodo(reserva.periodo?.nome, tc) ?? '-'}
                                        </p>

                                        {emVigor && googleCalendarConectado ? (
                                            <p className="mt-1.5 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                                                <GoogleCalendarIcon size={26} />
                                                {t('index.sincronizadoGoogleCalendar')}
                                            </p>
                                        ) : linkCalendario && (
                                            <a
                                                href={linkCalendario}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-1.5 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-teal-600 transition hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
                                            >
                                                <GoogleCalendarIcon size={26} />
                                                {t('index.adicionarAoGoogleCalendar')}
                                            </a>
                                        )}

                                        <div className="mt-auto pt-4">
                                            {reserva.estado_reserva?.codigo === 'pendente' ? (
                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                                    <Link
                                                        href={route('reservas.edit', reserva.id)}
                                                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-500 dark:border-slate-700 dark:text-slate-300"
                                                    >
                                                        <Pencil size={16} strokeWidth={1.9} />
                                                        {t('index.editar')}
                                                    </Link>

                                                    {podeCancelarReserva(reserva) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => abrirCancelamento(reserva)}
                                                            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:text-slate-300"
                                                        >
                                                            <XCircle size={16} strokeWidth={1.9} />
                                                            {t('index.cancelar')}
                                                        </button>
                                                    )}

                                                    {reserva.pagamento?.estado === 'pendente' && (
                                                        <Link
                                                            href={route('pagamentos.show', reserva.pagamento.id)}
                                                            className="flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-md"
                                                        >
                                                            <CreditCard size={16} strokeWidth={1.9} />
                                                            {t('index.pagar')}
                                                        </Link>
                                                    )}

                                                    {reserva.pagamento?.estado === 'pago' && (
                                                        <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                            <CreditCard size={16} strokeWidth={1.9} />
                                                            {t('index.pago')}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : podeCancelarReserva(reserva) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => abrirCancelamento(reserva)}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-400 hover:text-red-500 dark:border-slate-700 dark:text-slate-300"
                                                >
                                                    <XCircle size={16} strokeWidth={1.9} />
                                                    {t('index.cancelar')}
                                                </button>
                                            ) : reserva.check_in_at && !reserva.avaliacao ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setReservaParaAvaliar(reserva)}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-600 transition hover:border-amber-400 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-400 dark:hover:bg-amber-500/10"
                                                >
                                                    <Star size={16} strokeWidth={1.9} />
                                                    {t('index.avaliar')}
                                                </button>
                                            ) : reserva.avaliacao ? (
                                                <p className="text-center text-xs font-semibold text-slate-400">
                                                    {t('index.avaliacaoPrefixo')} {t(`index.avaliacaoEstado.${reserva.avaliacao.estado}`)}
                                                </p>
                                            ) : reserva.estado_reserva?.codigo === 'cancelada' ? (
                                                <p className="text-center text-xs text-slate-400">
                                                    {reserva.cancelada_at
                                                        ? t('index.canceladaEm', { data: formatarData(reserva.cancelada_at, i18n.language) })
                                                        : t('index.cancelada')}
                                                </p>
                                            ) : (
                                                <p className="text-center text-xs text-slate-400">
                                                    {t('index.semAcoes')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}

                    {reservas.last_page > 1 && (
                        <div className="mt-5 flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                                {tc('paginacao.pagina', { atual: reservas.current_page, total: reservas.last_page })}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    disabled={!reservas.prev_page_url}
                                    onClick={() => irParaPagina(reservas.prev_page_url)}
                                    aria-label={tc('paginacao.paginaAnterior')}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronLeft size={16} strokeWidth={1.9} />
                                </button>

                                <button
                                    type="button"
                                    disabled={!reservas.next_page_url}
                                    onClick={() => irParaPagina(reservas.next_page_url)}
                                    aria-label={tc('paginacao.paginaSeguinte')}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-500 hover:text-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700"
                                >
                                    <ChevronRight size={16} strokeWidth={1.9} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <Modal show={reservaParaCancelar !== null} onClose={() => setReservaParaCancelar(null)}>
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                            <AlertTriangle size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {t('index.modalCancelar.titulo')}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {t('index.modalCancelar.descricao', {
                                    codigo: reservaParaCancelar?.secretaria?.codigo,
                                    periodo: etiquetaPeriodo(reservaParaCancelar?.periodo?.nome, tc),
                                })}
                            </p>
                        </div>
                    </div>

                    {erroCancelamento && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                            {erroCancelamento}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setReservaParaCancelar(null)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            {t('index.modalCancelar.voltar')}
                        </button>

                        <button
                            type="button"
                            onClick={cancelarReserva}
                            disabled={aCancelar}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {aCancelar ? (
                                <>
                                    <RotateCcw size={16} strokeWidth={2} className="animate-spin" />
                                    {t('index.modalCancelar.aCancelar')}
                                </>
                            ) : (
                                t('index.modalCancelar.cancelarReserva')
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal show={reservaParaAvaliar !== null} onClose={fecharModalAvaliar}>
                <form onSubmit={submeterAvaliacao} className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
                            <Star size={22} strokeWidth={1.9} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {t('index.modalAvaliar.titulo', { codigo: reservaParaAvaliar?.secretaria?.codigo })}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {t('index.modalAvaliar.descricao')}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
                            {t('index.modalAvaliar.nota')}
                        </label>

                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((valor) => (
                                <button
                                    key={valor}
                                    type="button"
                                    onClick={() => avaliacaoForm.setData('nota', valor)}
                                    onMouseEnter={() => setNotaHover(valor)}
                                    onMouseLeave={() => setNotaHover(0)}
                                    className="text-amber-400 transition"
                                    aria-label={t('index.modalAvaliar.estrela', { count: valor })}
                                >
                                    <Star
                                        size={28}
                                        strokeWidth={1.5}
                                        fill={valor <= (notaHover || avaliacaoForm.data.nota) ? 'currentColor' : 'none'}
                                    />
                                </button>
                            ))}
                        </div>

                        {avaliacaoForm.errors.nota && (
                            <p className="mt-1.5 text-xs font-medium text-red-600">
                                {avaliacaoForm.errors.nota}
                            </p>
                        )}
                    </div>

                    <div className="mt-5">
                        <label className="mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200">
                            {t('index.modalAvaliar.comentario')}
                        </label>

                        <textarea
                            value={avaliacaoForm.data.comentario}
                            onChange={(e) => avaliacaoForm.setData('comentario', e.target.value)}
                            rows={4}
                            maxLength={1000}
                            placeholder={t('index.modalAvaliar.comentarioPlaceholder')}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                        />

                        <p className="mt-1 text-right text-xs text-slate-400">
                            {avaliacaoForm.data.comentario.length}/1000
                        </p>

                        {avaliacaoForm.errors.comentario && (
                            <p className="mt-1.5 text-xs font-medium text-red-600">
                                {avaliacaoForm.errors.comentario}
                            </p>
                        )}
                    </div>

                    {avaliacaoForm.errors.avaliacao && (
                        <p className="mt-3 text-sm font-medium text-red-600">
                            {avaliacaoForm.errors.avaliacao}
                        </p>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={fecharModalAvaliar}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            {t('index.cancelar')}
                        </button>

                        <button
                            type="submit"
                            disabled={avaliacaoForm.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {avaliacaoForm.processing ? (
                                <>
                                    <RotateCcw size={16} strokeWidth={2} className="animate-spin" />
                                    {t('index.modalAvaliar.aEnviar')}
                                </>
                            ) : (
                                t('index.modalAvaliar.enviarAvaliacao')
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
}