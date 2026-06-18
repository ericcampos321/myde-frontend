import { cn } from "@/utils/cn";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 px-6 text-center",
        className
      )}
    >
      {icon && (
        <div className="text-text-muted opacity-40 mb-1">{icon}</div>
      )}
      <p className="text-sm font-medium text-text">{title}</p>
      {description && (
        <p className="text-xs text-text-muted max-w-[240px]">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
