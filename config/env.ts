/**
 * Variáveis de ambiente do frontend.
 *
 * - `serverEnv`  → usado APENAS server-side (route handlers, services). Contém a URL
 *   do backend real, que NÃO deve ser exposta ao browser (sem prefixo NEXT_PUBLIC_).
 * - `publicEnv`  → mantido por compatibilidade; o browser agora fala apenas com `/api`.
 */

/** Erro de configuração do servidor (ex.: variável obrigatória ausente). */
export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

function resolveBackendBaseUrl(): string {
  // SERVER-SIDE apenas. Não cai mais em NEXT_PUBLIC_* — a URL do backend real
  // nunca deve depender de variável pública.
  const value = (
    process.env.API_BASE_URL ??
    process.env.BACKEND_BASE_URL ??
    ""
  ).trim();

  if (!value) {
    throw new ConfigError(
      "[env] API_BASE_URL é obrigatória (server-side). Defina API_BASE_URL " +
        "(ex.: http://127.0.0.1:8000) no .env.local — veja .env.example."
    );
  }

  return value.replace(/\/+$/, "");
}

function resolvePublicApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    ""
  ).trim();
}

/**
 * Config server-only. Lê preguiçosamente para evitar erro de import em contexto de browser
 * (a URL do backend nunca chega ao bundle do client).
 */
export const serverEnv = {
  get backendBaseUrl(): string {
    return resolveBackendBaseUrl();
  },
} as const;

/** Config pública (browser). Mantida por compat — o tráfego real passa por `/api`. */
export const publicEnv = {
  apiBaseUrl: resolvePublicApiBaseUrl(),
} as const;
