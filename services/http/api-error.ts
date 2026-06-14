/**
 * Erros HTTP do lado do browser.
 *
 * O browser fala apenas com as rotas BFF (`/api/...`). Quando uma rota responde
 * com status não-ok, o `api-client` lança um `ApiError` com a mensagem padronizada
 * (`{ error }`) e o status. `parseApiError` normaliza qualquer erro para exibição.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface ApiErrorPayload {
  message: string;
  status: number;
}

export function parseApiError(error: unknown): ApiErrorPayload {
  if (error instanceof ApiError) {
    return { message: error.message, status: error.status };
  }
  if (error instanceof Error) {
    return { message: error.message || "Erro desconhecido", status: 0 };
  }
  return { message: "Erro desconhecido", status: 0 };
}

/** Erros de rede/indisponibilidade (sem resposta útil do servidor). */
export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 0 || error.status === 503 || error.status === 504)
  );
}