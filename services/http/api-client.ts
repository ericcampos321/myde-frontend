import axios from "axios";

const DEV_FALLBACK_BASE_URL = "http://localhost:4000";

/**
 * Instância única de HTTP client da aplicação.
 * A fonte principal é a API real via NEXT_PUBLIC_API_URL (definida em .env.local;
 * o .env.example já traz a URL hospedada como padrão).
 * O `localhost:4000` é apenas fallback de desenvolvimento — não há dados mockados
 * no frontend; sem a API, as queries entram em estado de erro tratado pela UI.
 *
 * Quando a env está ausente, avisamos explicitamente em vez de cair no fallback
 * silenciosamente — assim "não foi possível carregar" não se confunde com
 * "variável ausente / dev server não reiniciado após criar o .env.local".
 */
const baseURL = process.env.NEXT_PUBLIC_API_URL ?? DEV_FALLBACK_BASE_URL;

if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV !== "production") {
  console.warn(
    `[api-client] NEXT_PUBLIC_API_URL ausente — usando fallback ${DEV_FALLBACK_BASE_URL}. ` +
      "Copie .env.example para .env.local e reinicie o dev server."
  );
}

export const apiClient = axios.create({
  baseURL,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});
