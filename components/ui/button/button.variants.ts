import type { ButtonSize, ButtonVariant } from "./button.types";

export const buttonBase =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors outline-none cursor-pointer " +
  "focus-visible:ring-2 focus-visible:ring-offset-0 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent",
  secondary:
    "border border-border bg-surface-raised text-text hover:bg-surface-active focus-visible:ring-border",
  ghost:
    "bg-transparent text-text-muted hover:bg-surface-raised hover:text-text focus-visible:ring-border",
  danger:
    "bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger",
  success:
    "bg-success text-white hover:bg-success/90 focus-visible:ring-success",
  warning:
    "bg-warning text-black hover:bg-warning/90 focus-visible:ring-warning",
};

export const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-11 px-6 text-base gap-2",
  icon: "h-9 w-9 p-0",
};

export const buttonSpinnerSize: Record<ButtonSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
  icon: 16,
};
