import { NextResponse } from "next/server";
import { getContacts } from "@/modules/inbox/services/inbox.service";
import { sanitizeContacts } from "@/modules/inbox/services/inbox.sanitizer";
import { forwardHeaders, handleBffError } from "@/services/http/server/bff";

export async function GET(request: Request) {
  try {
    const searchTerm = new URL(request.url).searchParams.get("q") ?? undefined;
    const result = await getContacts(searchTerm, {
      headers: forwardHeaders(request),
    });
    return NextResponse.json(sanitizeContacts(result));
  } catch (error) {
    return handleBffError(error);
  }
}