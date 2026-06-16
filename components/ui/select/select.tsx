"use client";

import {
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/utils/cn";
import type { SelectOption, SelectProps } from "./select.types";

export function Select({
  label,
  value,
  onValueChange,
  options,
  placeholder = "Selecione",
  disabled = false,
  error,
  className,
}: SelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value]
  );
  const [highlightedIndex, setHighlightedIndex] = useState(
    selectedIndex >= 0 ? selectedIndex : 0
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;
  const listboxId = `${id}-listbox`;
  const activeOptionId =
    open && options[highlightedIndex]
      ? `${id}-option-${highlightedIndex}`
      : undefined;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    if (open) {
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
  }, [open, selectedIndex]);

  const moveHighlight = (direction: 1 | -1) => {
    if (options.length === 0) return;
    setHighlightedIndex((current) => {
      const next = current + direction;
      if (next < 0) return options.length - 1;
      if (next >= options.length) return 0;
      return next;
    });
  };

  const choose = (option: SelectOption) => {
    onValueChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open && options[highlightedIndex]) {
        choose(options[highlightedIndex]);
        return;
      }
      setOpen(true);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        moveHighlight(1);
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        moveHighlight(-1);
      }
    }
  };

  return (
    <div ref={rootRef} className={cn("relative flex flex-col gap-1", className)}>
      {label && (
        <label htmlFor={id} className="text-[12px] text-text-muted">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-activedescendant={activeOptionId}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm text-text transition-colors",
          "outline-none hover:bg-surface-raised focus:border-accent focus:ring-1 focus:ring-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-danger focus:border-danger focus:ring-danger"
        )}
      >
        <span
          className={cn(
            "min-w-0 truncate",
            !selectedOption && "text-text-muted"
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDownIcon
          className={cn(
            "h-4 w-4 shrink-0 text-text-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={id}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-[#111717] p-1 shadow-xl shadow-black/40"
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            const highlighted = index === highlightedIndex;

            return (
              <button
                key={option.value || "__empty"}
                id={`${id}-option-${index}`}
                type="button"
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => choose(option)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm text-text transition-colors",
                  highlighted && "bg-surface-active",
                  selected && "bg-accent/15 text-accent"
                )}
              >
                <span className="min-w-0 truncate">{option.label}</span>
                {selected && <CheckIcon className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-[12px] text-danger">{error}</p>}
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="m4.5 10.5 3.3 3.3 7.7-8.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
