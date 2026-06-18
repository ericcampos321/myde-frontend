"use client";

import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Spinner } from "@/components/ui/spinner";
import type { ButtonProps } from "./button.types";
import {
  buttonBase,
  buttonSizes,
  buttonSpinnerSize,
  buttonVariants,
} from "./button.variants";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        buttonBase,
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={buttonSpinnerSize[size]} className="text-current" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </button>
  )
);

Button.displayName = "Button";
