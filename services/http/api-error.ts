import { AxiosError } from "axios";

export interface ApiErrorPayload {
  message: string;
  status: number;
}

export function parseApiError(error: unknown): ApiErrorPayload {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const message =
      (error.response?.data as { error?: string })?.error ??
      error.message ??
      "Erro desconhecido";
    return { message, status };
  }
  if (error instanceof Error) return { message: error.message, status: 0 };
  return { message: "Erro desconhecido", status: 0 };
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof AxiosError && !error.response;
}
