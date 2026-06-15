/** Tamanho mínimo do termo para disparar a busca de mensagens. */
export const MIN_MESSAGE_SEARCH_LENGTH = 2;

/** Predicado puro: só busca com termo (após trim) de pelo menos 2 caracteres. */
export function shouldSearchMessages(term: string): boolean {
  return term.trim().length >= MIN_MESSAGE_SEARCH_LENGTH;
}
