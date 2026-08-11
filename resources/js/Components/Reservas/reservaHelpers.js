/*
 * Lista fixa de características filtráveis — aparece sempre, desde
 * que a página abre, independentemente do piso/espaço escolhido.
 * Marcar uma que o espaço não tem simplesmente devolve zero lugares.
 */
export const PREFERENCIAS = [
    { key: "monitor", label: "Monitor" },
    { key: "dock_usb", label: "Dock USB" },
    { key: "hdmi", label: "HDMI" },
    { key: "ergonomica", label: "Cadeira Ergonómica" },
    { key: "junto_janela", label: "Junto à Janela" },
    { key: "luz_natural", label: "Luz Natural" },
    { key: "zona_silenciosa", label: "Zona Silenciosa" },
    { key: "proximo_copa", label: "Junto à Copa" },
];

export const DURACOES = {
    diaria: {
        nome: 'Diária',
        diasUteis: 1,
    },
    semanal: {
        nome: 'Semanal',
        diasUteis: 5,
    },
    mensal: {
        nome: 'Mensal',
        diasUteis: 22,
    },
    anual: {
        nome: 'Anual',
        diasUteis: 264,
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
 * Apresentar a data no formato português.
 */
export const formatarDataPortugues = (data) => {
    const dataLocal = criarDataLocal(data);

    if (!dataLocal) {
        return '';
    }

    return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(dataLocal);
};

/**
 * Verificar se uma data corresponde a sábado ou domingo.
 */
export const dataEhFimDeSemana = (data) => {
    const dataLocal = criarDataLocal(data);

    if (!dataLocal) {
        return false;
    }

    const diaSemana = dataLocal.getDay();

    return diaSemana === 0 || diaSemana === 6;
};

/**
 * Próxima data válida para uma nova reserva.
 *
 * Para a duração "Diária" (a duração padrão) não existe, no sistema,
 * nenhuma regra que impeça reservar hoje nem que exija começar num dia
 * útil — essa restrição só se aplica às durações longas (semanal,
 * mensal, anual), já verificada à parte por dataEhFimDeSemana(). Por
 * isso a próxima data válida, por omissão, é sempre hoje.
 */
export const proximaDataValida = () => formatarDataInput(new Date());

/**
 * Calcular a data final contando apenas dias úteis.
 *
 * A data inicial conta como primeiro dia útil.
 */
export const calcularDataFim = (dataInicio, tipoDuracao) => {
    if (!dataInicio) {
        return '';
    }

    const dataAtual = criarDataLocal(dataInicio);

    if (!dataAtual) {
        return '';
    }

    const quantidadeDiasUteis =
        DURACOES[tipoDuracao]?.diasUteis ?? 1;

    if (quantidadeDiasUteis === 1) {
        return formatarDataInput(dataAtual);
    }

    /*
     * As reservas longas não devem começar ao fim de semana.
     * O backend também valida esta regra.
     */
    if (dataEhFimDeSemana(dataInicio)) {
        return '';
    }

    let diasContados = 1;

    while (diasContados < quantidadeDiasUteis) {
        dataAtual.setDate(dataAtual.getDate() + 1);

        const diaSemana = dataAtual.getDay();

        if (diaSemana !== 0 && diaSemana !== 6) {
            diasContados += 1;
        }
    }

    return formatarDataInput(dataAtual);
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
export const ESTADOS_SEM_CANCELAMENTO = ['cancelada', 'expirada', 'concluida'];

export function podeCancelarReserva(reserva) {
    return (
        !reserva?.check_in_at &&
        !ESTADOS_SEM_CANCELAMENTO.includes(reserva?.estado_reserva?.codigo)
    );
}
