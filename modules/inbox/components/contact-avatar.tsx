"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/utils/cn";
import { getContactAvatarUrl } from "@/modules/inbox/utils/avatar-fallback";

interface ContactAvatarProps {
  name?: string | null;
  phone?: string | null;
  id?: string | null;
  avatarUrl?: string | null;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function ContactAvatar({
  name,
  phone,
  id,
  avatarUrl,
  color,
  size = "md",
  className,
}: ContactAvatarProps) {
  const displayName = name?.trim() || "Contato";
  const resolvedAvatarUrl = getContactAvatarUrl({
    avatarUrl,
    phone,
    id,
    name: displayName,
  });
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedAvatarUrl]);

  if (imageFailed) {
    return (
      <Avatar
        name={displayName}
        color={color}
        size={size}
        className={className}
      />
    );
  }

  return (
    <img
      src={resolvedAvatarUrl}
      alt={displayName}
      onError={() => setImageFailed(true)}
      className={cn(
        "shrink-0 rounded-full bg-surface-raised object-cover",
        sizes[size],
        className
      )}
    />
  );
}
