import axios from "axios";

/**
 * Instância única de HTTP client da aplicação.
 * A fonte principal é a API real via NEXT_PUBLIC_API_URL (definida em .env.local;
 * o .env.example já traz a URL hospedada como padrão).
 * O `localhost:4000` é apenas fallback de desenvolvimento — não há dados mockados
 * no frontend; sem a API, as queries entram em estado de erro tratado pela UI.
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});
