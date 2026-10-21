import { useState, type KeyboardEvent } from "react";
import { Check, Plus, X } from "lucide-react";
import { COURSE_CATALOG } from "@/data/courseCatalog";
import { CERTIFICATE_LIMITS } from "@/lib/certificates/template";
import { cleanText } from "@/lib/certificates/validation";
import { cn } from "@/lib/utils";
import { fieldInput } from "./shared";

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
  ariaLabel: string;
  disabled?: boolean;
}

export function Segmented<T extends string>({ value, onChange, options, ariaLabel, disabled }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid gap-1 rounded-2xl bg-[#F5F7FB] p-1 ring-1 ring-[#DCE2EB]"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "truncate rounded-xl px-3 py-2 text-[13px] font-semibold transition-all disabled:cursor-not-allowed",
              selected ? "bg-white text-[#10264B] shadow-subtle ring-1 ring-[#DCE2EB]" : "text-[#53647C] hover:text-[#10264B]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

interface ProgrammePickerProps {
  value: string[];
  onChange: (value: string[]) => void;
  /** Programmes from the linked student's enrolment, flagged in the list. */
  enrolled?: string[];
  invalid?: boolean;
  compact?: boolean;
}

/** Catalogue programmes plus free-text ones, kept in the order they were picked (the print order). */
export function ProgrammePicker({ value, onChange, enrolled = [], invalid, compact }: ProgrammePickerProps) {
  const [custom, setCustom] = useState("");
  const catalog = COURSE_CATALOG.map((c) => c.title as string);
  const lower = value.map((v) => v.toLowerCase());
  const extras = value.filter((v) => !catalog.some((c) => c.toLowerCase() === v.toLowerCase()));
  const enrolledLower = enrolled.map((e) => e.toLowerCase());
  const full = value.length >= CERTIFICATE_LIMITS.programmesMax;

  const toggle = (title: string) => {
    const idx = lower.indexOf(title.toLowerCase());
    if (idx >= 0) onChange(value.filter((_, i) => i !== idx));
    else if (!full) onChange([...value, title]);
  };

  const addCustom = () => {
    const title = cleanText(custom).slice(0, CERTIFICATE_LIMITS.programmeMax);
    if (!title || full) return;
    if (!lower.includes(title.toLowerCase())) onChange([...value, title]);
    setCustom("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustom();
    }
  };

  return (
    <div className="space-y-3">
      <div className={cn("overflow-hidden rounded-2xl border bg-white", invalid ? "border-red-300" : "border-[#DCE2EB]")}>
        {catalog.map((title, i) => {
          const order = lower.indexOf(title.toLowerCase());
          const selected = order >= 0;
          const fromEnrolment = enrolledLower.includes(title.toLowerCase());
          return (
            <button
              key={title}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(title)}
              disabled={!selected && full}
              className={cn(
                "flex w-full items-center gap-3 px-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                compact ? "py-2.5" : "py-3",
                i > 0 && "border-t border-[#DCE2EB]/70",
                selected ? "bg-[#F2F6FF]" : "hover:bg-[#F5F7FB]",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tabular-nums transition-colors",
                  selected ? "bg-[#1246C8] text-white" : "border border-[#C3CCDA] bg-white text-transparent",
                )}
                aria-hidden
              >
                {selected ? (value.length > 1 ? order + 1 : <Check className="h-3.5 w-3.5" />) : ""}
              </span>
              <span className={cn("min-w-0 flex-1 text-sm", selected ? "font-semibold text-[#10264B]" : "text-[#172B49]")}>{title}</span>
              {fromEnrolment && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Enrolled
                </span>
              )}
            </button>
          );
        })}
      </div>

      {extras.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {extras.map((title) => (
            <span key={title} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#10264B] py-1.5 pl-3 pr-1.5 text-[12px] font-semibold text-white">
              <span className="rounded-full bg-white/15 px-1.5 text-[10px] tabular-nums">{lower.indexOf(title.toLowerCase()) + 1}</span>
              <span className="truncate">{title}</span>
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== title))}
                className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-white/20"
                aria-label={`Remove ${title}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={onKey}
          disabled={full}
          maxLength={CERTIFICATE_LIMITS.programmeMax}
          placeholder={full ? `Maximum of ${CERTIFICATE_LIMITS.programmesMax} programmes` : "Add another programme or short course"}
          className={cn(fieldInput, "py-2.5")}
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!custom.trim() || full}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#DCE2EB] bg-white px-3.5 text-[13px] font-semibold text-[#10264B] transition-colors hover:border-[#1246C8] hover:text-[#1246C8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}
