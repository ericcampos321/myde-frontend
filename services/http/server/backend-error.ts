/**
 * Erro lançado pelo backend-client quando o backend real responde com status não-ok
 * (ou em falha de rede/timeout). Carrega o status HTTP e um `code` opcional para que o
 * route handler propague ao browser de forma padronizada via `handleBffError`.
 */
export class BackendError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "BackendError";
    this.status = status;
    this.code = code;
  }
}