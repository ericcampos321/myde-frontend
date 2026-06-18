import { NextResponse } from "next/server";
import { getMe } from "@/modules/inbox/services/inbox.service";
import { sanitizeAgent } from "@/modules/inbox/services/inbox.sanitizer";
import { forwardHeaders, handleBffError } from "@/services/http/server/bff";

export async function GET(request: Request) {
  try {
    const result = await getMe({ headers: forwardHeaders(request) });
    return NextResponse.json(sanitizeAgent(result));
  } catch (error) {
    return handleBffError(error);
  }
}