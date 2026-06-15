"use client";

import { useState } from "react";
import { cn } from "@/utils/cn";

interface MessageSearchCalendarProps {
  selectedDate: string | null;
  onSelect: (date: string) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function MessageSearchCalendar({
  selectedDate,
  onSelect,
}: MessageSearchCalendarProps) {
  const selected = selectedDate ? parseLocalDate(selectedDate) : null;
  const [visibleMonth, setVisibleMonth] = useState(
    () => selected ?? new Date()
  );
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from(
    { length: firstWeekday + daysInMonth },
    (_, index) => (index < firstWeekday ? null : index - firstWeekday + 1)
  );

  function moveMonth(delta: number) {
    setVisibleMonth(new Date(year, month + delta, 1));
  }

  return (
    <div className="absolute left-4 top-full z-30 mt-1 w-[320px] rounded-xl bg-surface-raised p-3 shadow-[0_8px_28px_rgba(0,0,0,0.45)]">
      <div className="mb-2 flex items-center justify-between">
        <strong className="text-[14px] capitalize text-text">
          {visibleMonth.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </strong>
        <div className="flex gap-1">
          <CalendarNavButton label="Mês anterior" onClick={() => moveMonth(-1)}>
            ‹
          </CalendarNavButton>
          <CalendarNavButton label="Próximo mês" onClick={() => moveMonth(1)}>
            ›
          </CalendarNavButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="py-1 text-[11px] text-text-muted">
            {weekday}
          </span>
        ))}
        {cells.map((day, index) =>
          day === null ? (
            <span key={`empty-${index}`} />
          ) : (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(formatLocalDate(year, month, day))}
              className={cn(
                "h-8 cursor-pointer rounded-full text-[13px] text-text transition-colors hover:bg-surface-active",
                selectedDate === formatLocalDate(year, month, day) &&
                  "bg-accent text-white hover:bg-accent-hover"
              )}
            >
              {day}
            </button>
          )
        )}
      </div>
    </div>
  );
}

function CalendarNavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-xl text-text-muted hover:bg-surface-active hover:text-text"
    >
      {children}
    </button>
  );
}

function parseLocalDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year!, month! - 1, day!);
}

function formatLocalDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
