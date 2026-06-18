export const FALLBACK_AVATARS = [
  "/avatar/avatar-001.png",
  "/avatar/avatar-002.png",
  "/avatar/avatar-003.png",
  "/avatar/avatar-004.png",
  "/avatar/avatar-005.png",
  "/avatar/avatar-006.png",
] as const;

export function getStableAvatarIndex(seed: string): number {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }

  return (hash >>> 0) % FALLBACK_AVATARS.length;
}

export function getFallbackAvatarUrl(seed?: string | null): string {
  const normalizedSeed = seed?.trim() || "default";
  return FALLBACK_AVATARS[getStableAvatarIndex(normalizedSeed)]!;
}

export function getContactAvatarUrl(input: {
  avatarUrl?: string | null;
  id?: string | null;
  phone?: string | null;
  name?: string | null;
}): string {
  const avatarUrl = input.avatarUrl?.trim();
  if (avatarUrl) return avatarUrl;

  return getFallbackAvatarUrl(input.phone || input.id || input.name || "default");
}
