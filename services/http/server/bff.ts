import "server-only";

import { NextResponse } from "next/server";
import { BackendError } from "@/services/http/server/backend-error";
import { ConfigError } from "@/config/env";

/**
 * Helpers para os route handlers do BFF (app/api/**).
 *
 * Sucesso: o JSON sanitizado direto. Erro: shape padronizado
 * `{ error: { code, message } }`, preservando o status real do backend quando houver.
 */

interface BffErrorBody {
  error: { code: string; message: string };
}

/** Headers do request do browser que devem ser repassados ao backend real. */
const FORWARDABLE_HEADERS = ["x-tenant-id", "cookie"] as const;

/**
 * Extrai do request recebido apenas os headers que o backend precisa
 * (tenant + cookies de sessão). Tudo o mais é descartado.
 */
export function forwardHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const name of FORWARDABLE_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
}

/** Resposta de erro padronizada do BFF. */
export function bffError(
  code: string,
  message: string,
  status: number
): NextResponse<BffErrorBody> {
  return NextResponse.json({ error: { code, message } }, { status });
}

function defaultCodeForStatus(status: number): string {
  if (status === 400) return "INVALID_INPUT";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 503) return "BACKEND_UNAVAILABLE";
  if (status >= 500) return "BACKEND_ERROR";
  return "ERROR";
}

/**
 * Converte um erro em resposta padronizada.
 * - BackendError: preserva status + code/message vindos do backend real
 *   (conexão/timeout viram 503 BACKEND_UNAVAILABLE pelo backend-client).
 * - ConfigError: 500 com mensagem clara de configuração (não genérica).
 * - Demais: 500 genérico (sem vazar detalhes internos).
 */
export function handleBffError(error: unknown): NextResponse<BffErrorBody> {
  if (error instanceof BackendError) {
    return bffError(
      error.code ?? defaultCodeForStatus(error.status),
      error.message,
      error.status
    );
  }

  if (error instanceof ConfigError) {
    console.error("[bff] Erro de configuração:", error.message);
    return bffError("CONFIG_ERROR", error.message, 500);
  }

  console.error("[bff] Erro não tratado no route handler:", error);
  return bffError("INTERNAL_ERROR", "Erro interno do servidor", 500);
}