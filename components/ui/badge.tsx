import { cn } from "@/utils/cn";

interface BadgeProps {
  count: number;
  className?: string;
}

export function Badge({ count, className }: BadgeProps) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full",
        "bg-accent text-white text-[10px] font-semibold leading-none",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
