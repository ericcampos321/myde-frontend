"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import type { InputProps } from "./input.types";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted",
        "outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
