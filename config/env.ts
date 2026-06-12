function resolveApiBaseUrl(): string {
  const value = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
  if (!value) {
    throw new Error(
      "[env] NEXT_PUBLIC_API_URL is required — copy .env.example to .env.local"
    );
  }
  return value;
}

export const publicEnv = {
  apiBaseUrl: resolveApiBaseUrl(),
} as const;
