import { NextResponse } from "next/server";
import {
  clearRecentSearches,
  getRecentSearches,
  saveRecentSearch,
} from "@/modules/inbox/services/inbox.service";
import { sanitizeRecentSearches } from "@/modules/inbox/services/inbox.sanitizer";
import { bffError, forwardHeaders, handleBffError } from "@/services/http/server/bff";
import type { SaveRecentSearchPayload } from "@/modules/inbox/types/inbox.types";

export async function GET(request: Request) {
  try {
    const result = await getRecentSearches({ headers: forwardHeaders(request) });
    return NextResponse.json(sanitizeRecentSearches(result));
  } catch (error) {
    return handleBffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<SaveRecentSearchPayload>;

    if (
      (body.targetType !== "conversation" && body.targetType !== "contact") ||
      typeof body.targetId !== "string" ||
      !body.targetId.trim()
    ) {
      return bffError("INVALID_INPUT", "Payload inválido", 400);
    }

    await saveRecentSearch(
      { targetType: body.targetType, targetId: body.targetId },
      { headers: forwardHeaders(request) }
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleBffError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await clearRecentSearches({ headers: forwardHeaders(request) });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleBffError(error);
  }
}