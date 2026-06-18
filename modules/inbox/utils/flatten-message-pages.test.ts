import { describe, expect, it } from "vitest";
import { flattenMessagePages } from "@/modules/inbox/utils/flatten-message-pages";
import type { Message, MessagePage } from "@/modules/inbox/types/inbox.types";

function msg(id: string): Message {
  return { id, direction: "in", body: id, status: "sent", createdAt: null };
}

function page(ids: string[], hasMore = false): MessagePage {
  return { items: ids.map(msg), nextCursor: hasMore ? "c" : null, hasMore };
}

describe("flattenMessagePages", () => {
  it("vazio/undefined → []", () => {
    expect(flattenMessagePages(undefined)).toEqual([]);
    expect(flattenMessagePages([])).toEqual([]);
  });

  it("uma página: mantém a ordem ASC dos items", () => {
    const result = flattenMessagePages([page(["m1", "m2", "m3"])]);
    expect(result.map((m) => m.id)).toEqual(["m1", "m2", "m3"]);
  });

  it("várias páginas: páginas antigas primeiro (pages[0] é a mais recente)", () => {
    // pages[0] = chunk mais recente; pages[1] = chunk mais antigo.
    const recent = page(["m3", "m4"], true);
    const older = page(["m1", "m2"], false);
    const result = flattenMessagePages([recent, older]);
    // ordem final top→bottom: antigas (m1,m2) depois recentes (m3,m4).
    expect(result.map((m) => m.id)).toEqual(["m1", "m2", "m3", "m4"]);
  });
});
