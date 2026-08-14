/**
 * Link para adicionar uma reserva ao Google Calendar — sem OAuth nem
 * chamadas à API, apenas o URL de template que o Google Calendar
 * interpreta e pré-preenche com os dados da reserva.
 */
export function linkGoogleCalendar(reserva) {
    const horaInicio = reserva?.periodo?.hora_inicio;
    const horaFim = reserva?.periodo?.hora_fim;

    if (!reserva?.data || !horaInicio || !horaFim) {
        return null;
    }

    /*
     * reserva.data / data_fim vêm como timestamp ISO completo
     * ("2026-08-17T00:00:00.000000Z"), não "YYYY-MM-DD" — daí o
     * substring(0, 10), o mesmo truque já usado em formatarDataCurta.
     */
    const dataInicio = String(reserva.data).substring(0, 10);
    const dataFim = String(reserva.data_fim ?? reserva.data).substring(0, 10);

    const formatoDataValido = /^\d{4}-\d{2}-\d{2}$/;
    const formatoHoraValido = /^\d{2}:\d{2}/;

    if (
        !formatoDataValido.test(dataInicio)
        || !formatoDataValido.test(dataFim)
        || !formatoHoraValido.test(horaInicio)
        || !formatoHoraValido.test(horaFim)
    ) {
        return null;
    }

    /*
     * As horas guardadas na base de dados já são hora local de Portugal
     * (SpaceHub Braga) — em vez de as converter para UTC (o que
     * dependeria do fuso horário do browser, nem sempre Europe/Lisbon,
     * e já causou um evento com a hora errada), usa-se o formato "sem
     * Z" do Google Calendar e indica-se o fuso explicitamente via ctz.
     */
    const paraFormatoGoogle = (data, hora) =>
        `${data.replace(/-/g, '')}T${hora.slice(0, 5).replace(':', '')}00`;

    const setor = reserva?.secretaria?.setor;
    const nomeEdificio = setor?.piso?.edificio?.nome;
    const numeroPiso = setor?.piso?.numero;

    const titulo = `Reserva - ${setor?.nome ?? 'Espaço'} (${reserva?.secretaria?.codigo ?? '-'})`;

    const localizacao = [nomeEdificio, numeroPiso != null ? `Piso ${numeroPiso}` : null]
        .filter(Boolean)
        .join(' · ');

    const detalhes = [
        `Código: ${reserva?.secretaria?.codigo ?? '-'}`,
        `Período: ${reserva?.periodo?.nome ?? '-'}`,
    ].join('\n');

    const parametros = new URLSearchParams({
        action: 'TEMPLATE',
        text: titulo,
        dates: `${paraFormatoGoogle(dataInicio, horaInicio)}/${paraFormatoGoogle(dataFim, horaFim)}`,
        details: detalhes,
        location: localizacao,
        ctz: 'Europe/Lisbon',
    });

    return `https://calendar.google.com/calendar/render?${parametros.toString()}`;
}
