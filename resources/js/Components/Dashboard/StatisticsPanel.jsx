function EmptyState({ text }) {
    return <p className="text-sm text-slate-400">{text}</p>;
}

function RankingList({ title, items, getKey, renderItem, getTotal }) {
    return (
        <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                {title}
            </h3>

            <div className="space-y-3">
                {items?.length > 0 ? (
                    items.map((item, index) => (
                        <div
                            key={getKey(item, index)}
                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700">
                                    {index + 1}
                                </div>

                                <div>{renderItem(item)}</div>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                                {getTotal ? getTotal(item) : item.total}
                            </span>
                        </div>
                    ))
                ) : (
                    <EmptyState text="Ainda não existem dados suficientes." />
                )}
            </div>
        </div>
    );
}

export default function StatisticsPanel({ estatisticas }) {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Estatísticas de ocupação
                    </h2>
                    <p className="text-sm text-slate-500">
                        Dados calculados com base nas reservas registadas.
                    </p>
                </div>

                <select className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
                    <option>Geral</option>
                    <option>Esta semana</option>
                    <option>Este mês</option>
                </select>
            </div>

            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-600">
                    Piso mais utilizado
                </p>

                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {estatisticas?.pisoMaisUtilizado?.nome ?? 'Sem dados'}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    {estatisticas?.pisoMaisUtilizado?.total
                        ? `${estatisticas.pisoMaisUtilizado.total} reservas registadas`
                        : 'Ainda não existem reservas suficientes.'}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <RankingList
                    title="Secretárias mais utilizadas"
                    items={estatisticas?.secretariasMaisUtilizadas}
                    getKey={(item) => item.secretaria_id}
                    renderItem={(item) => (
                        <>
                            <p className="text-sm font-semibold text-slate-800">
                                {item.secretaria?.codigo ?? 'Secretária removida'}
                            </p>
                            <p className="text-xs text-slate-500">
                                {item.total} reservas
                            </p>
                        </>
                    )}
                />

                <RankingList
                    title="Secretárias menos utilizadas"
                    items={estatisticas?.secretariasMenosUtilizadas}
                    getKey={(item) => item.id}
                    getTotal={(item) => item.reservas_count}
                    renderItem={(item) => (
                        <>
                            <p className="text-sm font-semibold text-slate-800">
                                {item.codigo}
                            </p>
                            <p className="text-xs text-slate-500">
                                {item.reservas_count} reservas
                            </p>
                        </>
                    )}
                />

                <RankingList
                    title="Utilizadores com mais reservas"
                    items={estatisticas?.utilizadoresComMaisReservas}
                    getKey={(item) => item.user_id}
                    renderItem={(item) => (
                        <>
                            <p className="text-sm font-semibold text-slate-800">
                                {item.user?.name ?? 'Utilizador removido'}
                            </p>
                            <p className="text-xs text-slate-500">
                                {item.total} reservas
                            </p>
                        </>
                    )}
                />

                <RankingList
                    title="Dias com maior ocupação"
                    items={estatisticas?.diasComMaiorOcupacao}
                    getKey={(item) => item.data}
                    renderItem={(item) => (
                        <>
                            <p className="text-sm font-semibold text-slate-800">
                                {item.data}
                            </p>
                            <p className="text-xs text-slate-500">
                                {item.total} reservas
                            </p>
                        </>
                    )}
                />
            </div>
        </div>
    );
}
