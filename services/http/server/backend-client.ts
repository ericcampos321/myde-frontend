import "server-only";

import { serverEnv } from "@/config/env";
import { BackendError } from "@/services/http/server/backend-error";

/**
 * Cliente HTTP para uso SERVER-SIDE (route handlers, services).
 *
 * Fluxo: Next.js Server -> Backend Myde real.
 * (repassados pelo route handler). A URL do backend nunca vai para o browser.
 */

const DEFAULT_TIMEOUT_MS = 20_000;

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface BackendRequestOptions {
  /** Headers extras a repassar ao backend (ex.: X-Tenant-ID, Cookie). */
  headers?: Record<string, string>;
  /** Timeout em ms (default 20s). */
  timeout?: number;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    if (typeof obj.error === "string" && obj.error.trim()) return obj.error;
    if (obj.error && typeof obj.error === "object") {
      const message = (obj.error as Record<string, unknown>).message;
      if (typeof message === "string" && message.trim()) return message;
    }
    if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
  }

  if (typeof data === "string" && data.trim()) return data;
  return fallback;
}

async function request<T>(method: HttpMethod, path: string, body?: unknown, options: BackendRequestOptions = {}): Promise<T> {
  const { headers: extraHeaders, timeout = DEFAULT_TIMEOUT_MS } = options;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${serverEnv.backendBaseUrl}${normalizedPath}`;
  // URL sem query, para log seguro (nunca loga token/cookie/body).
  const safeUrl = `${serverEnv.backendBaseUrl}${normalizedPath.split("?")[0]}`;
  const isDev = process.env.NODE_ENV !== "production";

  const hasBody = method !== "GET" && method !== "DELETE" && body !== undefined;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    "X-Request-Source": "nextjs-server",
    ...extraHeaders,
  };
  if (hasBody) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      cache: "no-store",
      signal: controller.signal,
      ...(hasBody ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    clearTimeout(timeoutId);
    const isAbort = error instanceof DOMException && error.name === "AbortError";
    // `cause.code` traz ECONNREFUSED/ENOTFOUND/etc. (undici) — útil para diagnóstico.
    const cause = (error as { cause?: { code?: string } } | undefined)?.cause;
    if (isDev) {
      console.error(`[backend-client] ${method} ${safeUrl} -> ${isAbort ? "TIMEOUT" : cause?.code ?? "NETWORK_ERROR"}`);
    }
    throw new BackendError("Backend unavailable", 503, "BACKEND_UNAVAILABLE");
  }
  clearTimeout(timeoutId);

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json") ?? false;

  if (isDev) {
    console.info(`[backend-client] ${method} ${safeUrl} -> ${response.status}`);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as T;
  }

  const data: unknown = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new BackendError(extractErrorMessage(data, "Erro na requisição ao backend"), response.status);
  }

  return data as T;
}

export const backendClient = {
  get: <T>(path: string, options?: BackendRequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: BackendRequestOptions) => request<T>("POST", path, body, options),
  put: <T>(path: string, body?: unknown, options?: BackendRequestOptions) => request<T>("PUT", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: BackendRequestOptions) => request<T>("PATCH", path, body, options),
  delete: <T>(path: string, body?: unknown, options?: BackendRequestOptions) => request<T>("DELETE", path, body, options),
} as const;
