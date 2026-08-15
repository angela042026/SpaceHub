// Apenas apresentação: "Piso -1 Garagem" (prefixo + designação colados só
// por um espaço) fica mais legível como "Piso -1 · Garagem". Não altera o
// valor guardado na base de dados — só a forma como é mostrado.
export function formatarNomePiso(nomePiso) {
    if (typeof nomePiso !== 'string') {
        return nomePiso ?? '-';
    }

    const match = nomePiso.match(/^(Piso\s+-?\d+)\s+(.+)$/);

    return match ? `${match[1]} · ${match[2]}` : nomePiso;
}
