import { NextResponse } from "next/server";
import { getAiUsage } from "@/modules/inbox/services/inbox.service";
import { sanitizeAiUsagePage } from "@/modules/inbox/services/inbox.sanitizer";
import { forwardHeaders, handleBffError } from "@/services/http/server/bff";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await getAiUsage(
      {
        from: searchParams.get("from") ?? undefined,
        to: searchParams.get("to") ?? undefined,
        conversationId: searchParams.get("conversationId") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
        cursor: searchParams.get("cursor") ?? undefined,
        model: searchParams.get("model") ?? undefined,
        source: searchParams.get("source") ?? undefined,
        provider: searchParams.get("provider") ?? undefined,
        riskLevel: searchParams.get("riskLevel") ?? undefined,
        blocked: searchParams.get("blocked") ?? undefined,
        stage: searchParams.get("stage") ?? undefined,
      },
      { headers: forwardHeaders(request) }
    );
    return NextResponse.json(sanitizeAiUsagePage(result));
  } catch (error) {
    return handleBffError(error);
  }
}
