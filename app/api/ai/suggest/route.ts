import { NextResponse } from "next/server";
import { suggestReply } from "@/modules/inbox/services/inbox.service";
import { sanitizeAiSuggestion } from "@/modules/inbox/services/inbox.sanitizer";
import { bffError, forwardHeaders, handleBffError } from "@/services/http/server/bff";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { conversationId?: unknown };
    const conversationId =
      typeof body.conversationId === "string" ? body.conversationId.trim() : "";

    if (!conversationId) {
      return bffError("INVALID_INPUT", "conversationId é obrigatório", 400);
    }

    const result = await suggestReply(conversationId, {
      headers: forwardHeaders(request),
    });
    return NextResponse.json(sanitizeAiSuggestion(result));
  } catch (error) {
    return handleBffError(error);
  }
}