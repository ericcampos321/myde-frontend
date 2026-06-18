import { NextResponse } from "next/server";
import { getConversations } from "@/modules/inbox/services/inbox.service";
import { sanitizeConversations } from "@/modules/inbox/services/inbox.sanitizer";
import { forwardHeaders, handleBffError } from "@/services/http/server/bff";

export async function GET(request: Request) {
  try {
    const result = await getConversations({ headers: forwardHeaders(request) });
    return NextResponse.json(sanitizeConversations(result));
  } catch (error) {
    return handleBffError(error);
  }
}