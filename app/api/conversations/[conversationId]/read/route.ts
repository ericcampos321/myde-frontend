import { NextResponse } from "next/server";
import { markConversationAsRead } from "@/modules/inbox/services/inbox.service";
import { forwardHeaders, handleBffError } from "@/services/http/server/bff";

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { conversationId } = await params;
    await markConversationAsRead(conversationId, {
      headers: forwardHeaders(request),
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleBffError(error);
  }
}