/*
 * Lista fixa de características filtráveis — aparece sempre, desde
 * que a página abre, independentemente do piso/espaço escolhido.
 * Marcar uma que o espaço não tem simplesmente devolve zero lugares.
 */
/*
 * `label` guarda a chave de tradução (namespace "reservas"), não o
 * texto em si — resolve-se com t(preferencia.label) no componente que
 * consome a lista.
 */
export const PREFERENCIAS = [
    { key: "monitor", label: "preferencias.monitor" },
    { key: "dock_usb", label: "preferencias.dockUsb" },
    { key: "hdmi", label: "preferencias.hdmi" },
    { key: "ergonomica", label: "preferencias.ergonomica" },
    { key: "junto_janela", label: "preferencias.juntoJanela" },
    { key: "luz_natural", label: "preferencias.luzNatural" },
    { key: "zona_silenciosa", label: "preferencias.zonaSilenciosa" },
    { key: "proximo_copa", label: "preferencias.proximoCopa" },
];

/* `nome`/`descricao` guardam chaves de tradução, mesmo motivo. */
export const DURACOES = {
    diaria: {
        nome: 'duracoes.diaria.nome',
        descricao: 'duracoes.diaria.descricao',
    },
    semanal: {
        nome: 'duracoes.semanal.nome',
        descricao: 'duracoes.semanal.descricao',
    },
    mensal: {
        nome: 'duracoes.mensal.nome',
        descricao: 'duracoes.mensal.descricao',
    },
    anual: {
        nome: 'duracoes.anual.nome',
        descricao: 'duracoes.anual.descricao',
    },
};

// Imagem por tipo de setor (fallback quando a secretária não tem foto
// própria) — mesmas imagens já usadas no carrossel da landing page.
export const IMAGEM_POR_TIPO_SETOR = {
    open_space: '/images/landing/espaco-trabalho.png',
    escritorio: '/images/landing/escritorio-privado.png',
    escritorio_executivo: '/images/landing/escritorio-privado.png',
    sala_reunioes: '/images/landing/saladereuniao.png',
    sala_criativa: '/images/landing/espaco-comum.png',
    sala_espera: '/images/landing/rececao.png',
    rececao: '/images/landing/rececao.png',
    copa: '/images/landing/lounge.png',
    lounge: '/images/landing/lounge.png',
    phone_booth: '/images/landing/phone-booth.png',
};

// Setores com imagem própria (têm prioridade sobre a imagem do tipo).
export const IMAGEM_POR_NOME_SETOR = {
    'Sala de Reuniões Redonda': '/images/landing/salamesaredonda.png',
    'Sala Criativa': '/images/landing/salacriativa.png',
    'Sala de Reuniões Média': '/images/landing/salaReunioes.png',
};

/**
 * Criar um objeto Date sem problemas de conversão de fuso horário.
 */
export const criarDataLocal = (data) => {
    if (!data) {
        return null;
    }

    const partes = data.split('-').map(Number);

    if (partes.length !== 3) {
        return null;
    }

    const [ano, mes, dia] = partes;

    return new Date(ano, mes - 1, dia, 12, 0, 0);
};

/**
 * Converter um objeto Date para o formato YYYY-MM-DD.
 */
export const formatarDataInput = (data) => {
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
        return '';
    }

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
};

/**
 * Apresentar a data por extenso, sem o problema de fuso horário de
 * `new Date('YYYY-MM-DD')` (que interpreta a string como UTC e pode
 * recuar um dia em fusos negativos) — por isso não usa formatarData()
 * de utils/formatadores.js diretamente, que não tem essa proteção.
 */
export const formatarDataPortugues = (data, locale = 'pt') => {
    const dataLocal = criarDataLocal(data);

    if (!dataLocal) {
        return '';
    }

    return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(dataLocal);
};

/**
 * Próxima data válida para uma nova reserva.
 *
 * Não existe, no sistema, nenhuma regra que impeça reservar hoje nem
 * que exija começar num dia específico da semana — todos os planos
 * (diário, semanal, mensal, anual) funcionam em qualquer dia, incluindo
 * sábados e domingos. Por isso a próxima data válida é sempre hoje.
 */
export const proximaDataValida = () => formatarDataInput(new Date());

/**
 * Somar um mês de calendário a uma data sem "transbordar" para o mês
 * seguinte quando o mês de destino é mais curto (ex.: 31 de janeiro
 * não deve avançar para 3 de março — fica em 28/29 de fevereiro).
 */
const adicionarMesSemTransbordo = (data) => {
    const dia = data.getDate();

    const resultado = new Date(data);
    resultado.setDate(1);
    resultado.setMonth(resultado.getMonth() + 1);

    const ultimoDiaDoMes = new Date(
        resultado.getFullYear(),
        resultado.getMonth() + 1,
        0,
    ).getDate();

    resultado.setDate(Math.min(dia, ultimoDiaDoMes));

    return resultado;
};

/**
 * Somar um ano de calendário a uma data sem "transbordar" quando a
 * data é 29 de fevereiro e o ano de destino não é bissexto (fica em 28
 * de fevereiro).
 */
const adicionarAnoSemTransbordo = (data) => {
    const dia = data.getDate();
    const mes = data.getMonth();

    const resultado = new Date(data);
    resultado.setDate(1);
    resultado.setFullYear(resultado.getFullYear() + 1);

    const ultimoDiaDoMes = new Date(
        resultado.getFullYear(),
        mes + 1,
        0,
    ).getDate();

    resultado.setMonth(mes);
    resultado.setDate(Math.min(dia, ultimoDiaDoMes));

    return resultado;
};

/**
 * Calcular a data final do intervalo, em dias corridos — inclui
 * sábados, domingos e feriados, sem os saltar nem os adicionar à
 * parte. Mesma regra usada no backend (ReservaCriacaoService).
 *
 * Semanal soma 7 dias corridos ao todo (data de início inclusive).
 * Mensal e anual somam um mês/ano de calendário e depois subtraem um
 * dia, para lidar corretamente com mudança de mês, mudança de ano,
 * fevereiro e anos bissextos.
 */
export const calcularDataFim = (dataInicio, tipoDuracao) => {
    if (!dataInicio) {
        return '';
    }

    const dataAtual = criarDataLocal(dataInicio);

    if (!dataAtual) {
        return '';
    }

    let dataFim;

    switch (tipoDuracao) {
        case 'semanal':
            dataFim = new Date(dataAtual);
            dataFim.setDate(dataFim.getDate() + 6);
            break;

        case 'mensal':
            dataFim = adicionarMesSemTransbordo(dataAtual);
            dataFim.setDate(dataFim.getDate() - 1);
            break;

        case 'anual':
            dataFim = adicionarAnoSemTransbordo(dataAtual);
            dataFim.setDate(dataFim.getDate() - 1);
            break;

        default:
            dataFim = dataAtual;
    }

    return formatarDataInput(dataFim);
};

/*
 * Estados a partir dos quais uma reserva já não pode ser cancelada.
 * Único sítio a definir isto — ReservationCard.jsx e Reservas/Index.jsx
 * usavam critérios diferentes (um permitia cancelar em mais estados do
 * que o outro), o que fazia o mesmo botão aparecer ativo num ecrã e
 * desativado noutro para a mesma reserva.
 *
 * O backend (ReservaController::cancelar()) só recusa reservas já
 * canceladas — este critério do frontend é mais conservador de
 * propósito (esconde o botão depois do check-in e nos estados
 * terminais), mas tem de ser sempre o mesmo em todo o lado.
 */
export const ESTADOS_SEM_CANCELAMENTO = ['cancelada', 'expirada', 'concluida', 'nao_compareceu'];

export function podeCancelarReserva(reserva) {
    return (
        !reserva?.check_in_at &&
        !ESTADOS_SEM_CANCELAMENTO.includes(reserva?.estado_reserva?.codigo)
    );
}
