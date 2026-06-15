import type { Message, MessagePage } from "@/modules/inbox/types/inbox.types";

/**
 * Achata as páginas do `useInfiniteQuery` para a lista renderizável (ASC).
 *
 * Convenção de ordem (importante):
 * - `pages[0]` é a página MAIS RECENTE (primeira buscada), em ordem ASC.
 * - `pages[1..]` são páginas progressivamente MAIS ANTIGAS, cada uma ASC.
 *
 * Para renderizar de cima (mais antiga) para baixo (mais recente), invertemos a
 * ordem das páginas e concatenamos os items:
 *   `pages.slice().reverse().flatMap(p => p.items)`
 */
export function flattenMessagePages(
  pages: MessagePage[] | undefined
): Message[] {
  if (!pages || pages.length === 0) return [];
  return pages
    .slice()
    .reverse()
    .flatMap((page) => page.items);
}