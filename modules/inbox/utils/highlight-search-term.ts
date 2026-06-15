export interface HighlightPart {
  text: string;
  match: boolean;
}

/**
 * Divide `text` em partes destacando TODAS as ocorrências de `term`
 * (case-insensitive), **sem regex** e **sem HTML** — só `indexOf` sobre lowercase.
 * O caller renderiza cada parte como `<span>` (o React escapa o texto).
 *
 * Termo vazio ou sem match → `[{ text, match: false }]`.
 */
export function highlightSearchTerm(text: string, term: string): HighlightPart[] {
  const needle = term.trim().toLowerCase();
  if (needle.length === 0 || text.length === 0) {
    return [{ text, match: false }];
  }

  const haystack = text.toLowerCase();
  const parts: HighlightPart[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const found = haystack.indexOf(needle, cursor);
    if (found === -1) {
      parts.push({ text: text.slice(cursor), match: false });
      break;
    }
    if (found > cursor) {
      parts.push({ text: text.slice(cursor, found), match: false });
    }
    parts.push({ text: text.slice(found, found + needle.length), match: true });
    cursor = found + needle.length;
  }

  return parts.length > 0 ? parts : [{ text, match: false }];
}
