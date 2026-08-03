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
 * Resolve a imagem de fallback de um setor, por nome ou por tipo.
 */
export function resolverImagemPorSetor(setor) {
    return (
        IMAGEM_POR_NOME_SETOR[setor?.nome] ??
        IMAGEM_POR_TIPO_SETOR[setor?.tipo] ??
        null
    );
}

/**
 * Resolve a imagem de uma secretária: usa a foto própria se existir,
 * senão cai para a imagem do setor a que pertence.
 */
export function resolverImagemSecretaria(secretaria) {
    return secretaria?.imagem_url ?? resolverImagemPorSetor(secretaria?.setor);
}
