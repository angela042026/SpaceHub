import i18n from '@/i18n';

// Lista sincronizada com Rule::in(...) em StoreSetorRequest/UpdateSetorRequest.
// Os values são os valores reais guardados na coluna `tipo` da tabela
// `setores`; os labels são chaves de tradução (namespace "admin"), não o
// texto em si — ver a nota equivalente em utils/estados.js.
export const TIPOS_SETOR = [
    { value: 'open_space', label: 'setores.tipos.open_space' },
    { value: 'escritorio', label: 'setores.tipos.escritorio' },
    { value: 'escritorio_executivo', label: 'setores.tipos.escritorio_executivo' },
    { value: 'sala_reunioes', label: 'setores.tipos.sala_reunioes' },
    { value: 'sala_criativa', label: 'setores.tipos.sala_criativa' },
    { value: 'phone_booth', label: 'setores.tipos.phone_booth' },
    { value: 'rececao', label: 'setores.tipos.rececao' },
    { value: 'copa', label: 'setores.tipos.copa' },
    { value: 'lounge', label: 'setores.tipos.lounge' },
    { value: 'sala_espera', label: 'setores.tipos.sala_espera' },
    { value: 'wc', label: 'setores.tipos.wc' },
    { value: 'estacionamento', label: 'setores.tipos.estacionamento' },
    { value: 'tecnico', label: 'setores.tipos.tecnico' },
    { value: 'outro', label: 'setores.tipos.outro' },
];

/**
 * `t` é opcional — passa o `t` de `useTranslation('admin')` do componente
 * que chama isto, para o texto atualizar de imediato quando o idioma
 * muda. Sem `t`, cai para a instância global do i18next.
 */
export function tipoSetorLabel(tipo, t) {
    const chaveTraducao = TIPOS_SETOR.find((item) => item.value === tipo)?.label;

    if (!chaveTraducao) {
        return tipo ?? '-';
    }

    return (t ?? i18n.t.bind(i18n))(chaveTraducao);
}
