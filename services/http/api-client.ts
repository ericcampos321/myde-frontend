import { ApiError } from "@/services/http/api-error";

/**
 * Cliente HTTP do BROWSER.
 *
 * Regra: SEMPRE chama as rotas internas do Next (`/api/...`), NUNCA o backend real.
 * As rotas BFF retornam JSON sanitizado em caso de sucesso e `{ error }` em caso de
 * falha — aqui desembrulhamos isso, lançando `ApiError` em status não-ok.
 *
 * Uso:
 *   apiClient.get<Conversation[]>("/conversations")
 *   apiClient.get<Contact[]>("/contacts", { query: { q: term } })
 *   apiClient.post<SentMessage>(`/conversations/${id}/messages`, { text }, {
 *     headers: { "X-Tenant-ID": tenantId },
 *   })
 */

const API_BASE = "/api";

export interface RequestConfig {
  /** Query params (valores vazios/undefined são ignorados). */
  query?: Record<string, string | undefined>;
  /** Headers extras (ex.: X-Tenant-ID). */
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestConfig["query"]): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${normalizedPath}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data === "object") {
      const err = (data as { error?: unknown }).error;
      // Shape padrão do BFF: { error: { code, message } }
      if (err && typeof err === "object") {
        const message = (err as { message?: unknown }).message;
        if (typeof message === "string" && message.trim()) return message;
      }
      // Compat: { error: "string" }
      if (typeof err === "string" && err.trim()) return err;
    }
  } catch {
    // corpo não-JSON ou vazio
  }
  return "Erro ao comunicar com o servidor";
}

async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body: unknown,
  config: RequestConfig = {}
): Promise<T> {
  const { query, headers, signal } = config;
  const hasBody = body !== undefined;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(hasBody ? { body: JSON.stringify(body) } : {}),
      ...(signal ? { signal } : {}),
    });
  } catch {
    throw new ApiError("Falha de conexão com o servidor", 0);
  }

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response), response.status);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, config?: RequestConfig) =>
    request<T>("GET", path, undefined, config),
  post: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("POST", path, body, config),
  put: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("PUT", path, body, config),
  patch: <T>(path: string, body?: unknown, config?: RequestConfig) =>
    request<T>("PATCH", path, body, config),
  delete: <T>(path: string, config?: RequestConfig) =>
    request<T>("DELETE", path, undefined, config),
} as const;
