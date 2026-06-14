import { NextResponse } from "next/server";
import { getMessages, sendMessage } from "@/modules/inbox/services/inbox.service";
import {
  sanitizeMessages,
  sanitizeSentMessage,
} from "@/modules/inbox/services/inbox.sanitizer";
import { bffError, forwardHeaders, handleBffError } from "@/services/http/server/bff";

interface RouteContext {
  params: Promise<{ conversationId: string }>;
}

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const { conversationId } = await params;
    const result = await getMessages(conversationId, {
      headers: forwardHeaders(request),
    });
    return NextResponse.json(sanitizeMessages(result));
  } catch (error) {
    return handleBffError(error);
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { conversationId } = await params;
    const body = (await request.json()) as { text?: unknown };
    const text = typeof body.text === "string" ? body.text.trim() : "";

    if (!text) {
      return bffError("INVALID_INPUT", "Mensagem vazia", 400);
    }

    const result = await sendMessage(conversationId, text, {
      headers: forwardHeaders(request),
    });
    return NextResponse.json(sanitizeSentMessage(result), { status: 201 });
  } catch (error) {
    return handleBffError(error);
  }
}