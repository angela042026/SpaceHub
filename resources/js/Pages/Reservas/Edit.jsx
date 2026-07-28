import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, ImageOff, Info, Pencil } from 'lucide-react';
import { resolverImagemPorSetor } from '@/utils/imagemSetor';

const fieldClass =
    'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-white';

const labelClass =
    'mb-1.5 block text-sm font-bold text-slate-700 dark:text-slate-200';

const PREFERENCIAS = [
    { key: 'monitor', label: 'Monitor' },
    { key: 'dock_usb', label: 'Dock USB' },
    { key: 'junto_janela', label: 'Junto à janela' },
    { key: 'ergonomica', label: 'Cadeira ergonómica' },
];

export default function Edit({ reserva, periodos, pisos, setores, parDiaInteiro }) {
    const { errors } = usePage().props;

    const [filtros, setFiltros] = useState({
        data: reserva.data,
        piso_id: String(reserva.secretaria.setor.piso_id),
        setor_id: String(reserva.secretaria.setor_id),
    });
    const [preferencias, setPreferencias] = useState({
        monitor: false,
        dock_usb: false,
        junto_janela: false,
        ergonomica: false,
    });
    const [setoresFiltrados, setSetoresFiltrados] = useState([]);
    const [lugares, setLugares] = useState([]);
    const [selecao, setSelecao] = useState({
        secretariaId: reserva.secretaria_id,
        periodoId: reserva.periodo_id,
    });
    const [observacoes, setObservacoes] = useState(reserva.observacoes ?? '');
    const [aGuardar, setAGuardar] = useState(false);

    // Filtra os tipos de espaço conforme o piso selecionado. Mantém o
    // setor atual se continuar válido para o piso.
    useEffect(() => {
        if (!filtros.piso_id) {
            setSetoresFiltrados([]);
            return;
        }

        const filtrados = setores.filter((setor) => setor.piso_id == filtros.piso_id);
        setSetoresFiltrados(filtrados);

        setFiltros((atual) => {
            const setorAindaValido = filtrados.some((setor) => setor.id == atual.setor_id);
            return setorAindaValido ? atual : { ...atual, setor_id: '' };
        });
    }, [filtros.piso_id]);

    // Consulta os lugares do setor escolhido, excluindo esta própria
    // reserva do cálculo de disponibilidade (para não aparecer bloqueada
    // a si mesma).
    useEffect(() => {
        if (!filtros.data || !filtros.setor_id) {
            setLugares([]);
            return;
        }

        fetch(route('reservas.lugaresPorSetor', {
            data: filtros.data,
            setor_id: filtros.setor_id,
            excluir_reserva_id: reserva.id,
            ...preferencias,
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
            .then((dados) => setLugares(dados))
            .catch((error) => {
                console.error(error);
                setLugares([]);
            });
    }, [filtros.data, filtros.setor_id, preferencias]);

    const setorSelecionado = setores.find(
        (setor) => setor.id == filtros.setor_id,
    );

    const imagemPorTipo = resolverImagemPorSetor(setorSelecionado);

    const escolher = (secretariaId, periodoId) => {
        setSelecao({ secretariaId, periodoId });
    };

    const submit = (e) => {
        e.preventDefault();

        if (!selecao.secretariaId || !selecao.periodoId || aGuardar) {
            return;
        }

        setAGuardar(true);

        router.put(route('reservas.update', reserva.id), {
            data: filtros.data,
            periodo_id: selecao.periodoId,
            secretaria_id: selecao.secretariaId,
            observacoes,
        }, {
            onFinish: () => setAGuardar(false),
        });
    };

    return (
        <DashboardLayout>
            <Head title="Editar Reserva" />

            <section className="dashboard-card overflow-hidden">
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-500">
                        <Pencil size={22} strokeWidth={1.9} />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Editar Reserva
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Escolhe a data e o tipo de espaço, depois seleciona o novo período/lugar.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className="p-6" noValidate>
                    {parDiaInteiro && (
                        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                            <Info size={18} strokeWidth={1.9} className="mt-0.5 shrink-0" />
                            <span>
                                Esta reserva faz parte de uma reserva de dia inteiro — também tens o
                                período <strong>{parDiaInteiro}</strong> reservado nesta secretária. Alterar
                                aqui só afeta este período.
                            </span>
                        </div>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300">
                            {Object.keys(errors).length === 1 ? (
                                Object.values(errors)[0]
                            ) : (
                                <ul className="list-disc space-y-1 pl-4">
                                    {Object.values(errors).map((mensagem, indice) => (
                                        <li key={indice}>{mensagem}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div>
                            <label htmlFor="data" className={labelClass}>Data</label>
                            <input
                                id="data"
                                type="date"
                                value={filtros.data}
                                onChange={(e) => setFiltros((atual) => ({ ...atual, data: e.target.value }))}
                                required
                                className={fieldClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="piso_id" className={labelClass}>Piso</label>
                            <select
                                id="piso_id"
                                value={filtros.piso_id}
                                onChange={(e) => setFiltros((atual) => ({ ...atual, piso_id: e.target.value }))}
                                required
                                className={fieldClass}
                            >
                                <option value="" disabled>Selecione...</option>

                                {pisos.map((piso) => (
                                    <option key={piso.id} value={piso.id}>
                                        {piso.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="setor_id" className={labelClass}>Categoria do Espaço</label>
                            <select
                                id="setor_id"
                                value={filtros.setor_id}
                                onChange={(e) => setFiltros((atual) => ({ ...atual, setor_id: e.target.value }))}
                                disabled={!filtros.piso_id}
                                required
                                className={fieldClass}
                            >
                                <option value="" disabled>
                                    {filtros.piso_id ? 'Selecione...' : 'Selecione primeiro o piso'}
                                </option>

                                {setoresFiltrados.map((setor) => (
                                    <option key={setor.id} value={setor.id}>
                                        {setor.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-5">
                        <p className={labelClass}>Preferências</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                            {PREFERENCIAS.map((preferencia) => (
                                <label
                                    key={preferencia.key}
                                    className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
                                >
                                    <input
                                        type="checkbox"
                                        checked={preferencias[preferencia.key]}
                                        onChange={() => setPreferencias((atual) => ({
                                            ...atual,
                                            [preferencia.key]: !atual[preferencia.key],
                                        }))}
                                        className="h-4 w-4 rounded border-slate-300 text-teal-500 focus:ring-teal-500"
                                    />
                                    {preferencia.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        {lugares.length === 0 ? (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Não existem lugares disponíveis para a data e categoria selecionadas.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {lugares.map((secretaria) => {
                                    const ehAtual = secretaria.id === reserva.secretaria_id;
                                    const selecionada = selecao.secretariaId === secretaria.id;

                                    return (
                                        <div
                                            key={secretaria.id}
                                            className={`overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-slate-900 ${
                                                selecionada
                                                    ? 'border-teal-500 ring-4 ring-teal-500/10'
                                                    : 'border-slate-200 dark:border-slate-800'
                                            }`}
                                        >
                                            <div className="relative">
                                                {secretaria.imagem || imagemPorTipo ? (
                                                    <img
                                                        src={secretaria.imagem || imagemPorTipo}
                                                        alt={secretaria.codigo}
                                                        className="h-40 w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-40 w-full items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                                                        <ImageOff size={28} strokeWidth={1.6} />
                                                    </div>
                                                )}

                                                {ehAtual && (
                                                    <span className="absolute left-3 top-3 rounded-full bg-navy-900/90 px-2.5 py-1 text-xs font-bold text-white">
                                                        Atual
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-4">
                                                <p className="font-bold text-slate-900 dark:text-white">
                                                    {secretaria.codigo}
                                                </p>

                                                {secretaria.descricao && (
                                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                        {secretaria.descricao}
                                                    </p>
                                                )}

                                                <div className="mt-4 flex gap-2">
                                                    {periodos.map((periodo) => {
                                                        const ehSlotOriginal = ehAtual
                                                            && filtros.data === reserva.data
                                                            && periodo.id === reserva.periodo_id;
                                                        const disponivel = ehSlotOriginal || secretaria.periodos_disponiveis[periodo.id];
                                                        const escolhido = selecionada && selecao.periodoId === periodo.id;

                                                        return (
                                                            <button
                                                                key={periodo.id}
                                                                type="button"
                                                                disabled={!disponivel}
                                                                onClick={() => escolher(secretaria.id, periodo.id)}
                                                                className={`flex-1 rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                                                    escolhido
                                                                        ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400'
                                                                        : 'border-slate-200 text-slate-600 hover:border-teal-500/50 dark:border-slate-700 dark:text-slate-300'
                                                                }`}
                                                            >
                                                                {periodo.nome}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <label htmlFor="observacoes" className={labelClass}>Observações</label>
                        <textarea
                            id="observacoes"
                            rows={4}
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            className={`${fieldClass} h-auto py-2.5`}
                        />
                    </div>

                    <div className="mt-8 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={!selecao.secretariaId || !selecao.periodoId || aGuardar}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {aGuardar ? 'A guardar...' : 'Guardar Alterações'}
                        </button>

                        <Link
                            href={route('reservas.index')}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
                        >
                            <ArrowLeft size={16} strokeWidth={1.9} />
                            Cancelar
                        </Link>
                    </div>
                </form>
            </section>
        </DashboardLayout>
    );
}
