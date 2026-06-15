import { NextResponse } from "next/server";
import { getMessageSearchPage } from "@/modules/inbox/services/inbox.service";
import { sanitizeMessageSearchPage } from "@/modules/inbox/services/inbox.sanitizer";
import { forwardHeaders, handleBffError } from "@/services/http/server/bff";

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const result = await getMessageSearchPage(
      conversationId,
      {
        q: searchParams.get("q") ?? "",
        date: searchParams.get("date") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
        cursor: searchParams.get("cursor") ?? undefined,
      },
      { headers: forwardHeaders(request) }
    );
    return NextResponse.json(sanitizeMessageSearchPage(result));
  } catch (error) {
    return handleBffError(error);
  }
}
