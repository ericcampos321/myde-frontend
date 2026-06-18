import { cn } from "@/utils/cn";

interface AvatarProps {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function Avatar({ name, color, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0",
        sizes[size],
        className
      )}
      style={{ backgroundColor: color ?? "#6a7175" }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
