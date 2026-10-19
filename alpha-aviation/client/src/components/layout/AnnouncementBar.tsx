import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AnnouncementBarProps {
  collapsed?: boolean;
  onDismiss: () => void;
}

export function AnnouncementBar({ collapsed = false, onDismiss }: AnnouncementBarProps) {
  return (
    <div
      role="region"
      aria-label="Admissions announcement"
      className={cn(
        "grid overflow-hidden bg-[#1246C8] text-white transition-[grid-template-rows] duration-500 ease-out-expo",
        collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]"
      )}
    >
      <div className="min-h-0">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <p className="flex min-w-0 items-center gap-2.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="hidden font-semibold uppercase tracking-[0.16em] sm:inline">Admissions open</span>
            <span className="truncate text-white/85">
              4-week cohorts in Lagos (in-person) and live virtual classes.
            </span>
            <Link to="/enroll" className="shrink-0 font-semibold underline decoration-white/40 underline-offset-4 hover:decoration-white">
              Review intakes
            </Link>
          </p>
          <button
            type="button"
            onClick={onDismiss}
            tabIndex={collapsed ? -1 : 0}
            className="shrink-0 rounded-full p-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Dismiss announcement"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
