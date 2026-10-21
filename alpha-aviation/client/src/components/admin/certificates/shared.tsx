import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, CheckCircle2, RefreshCcw, X } from "lucide-react";
import type { CertificateStatus, CertificateStats } from "@/lib/certificates/types";
import { cn } from "@/lib/utils";

// ─── Form primitives (match the admin form styling) ──────────────────────────

export const fieldLabel = "mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[#53647C]";
export const fieldInput =
  "w-full rounded-xl border border-[#DCE2EB] bg-white px-4 py-3 text-sm text-[#172B49] outline-none transition placeholder:text-[#8C9AB0] focus:border-[#1246C8] focus:ring-4 focus:ring-[#1246C8]/10 disabled:cursor-not-allowed disabled:bg-[#F5F7FB]";
export const fieldInputError = "border-red-300 focus:border-red-500 focus:ring-red-500/10";

export function FieldError({ children, id }: { children?: ReactNode; id?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
      {children}
    </p>
  );
}

// ─── Status ──────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<CertificateStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 ring-emerald-600/15", icon: CheckCircle2 },
  revoked: { label: "Revoked", className: "bg-red-50 text-red-700 ring-red-600/15", icon: Ban },
  superseded: { label: "Replaced", className: "bg-amber-50 text-amber-800 ring-amber-600/20", icon: RefreshCcw },
};

export function CertificateStatusBadge({ status, className }: { status: CertificateStatus; className?: string }) {
  const style = STATUS_STYLE[status];
  const Icon = style.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
        style.className,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {style.label}
    </span>
  );
}

// ─── Dialog ──────────────────────────────────────────────────────────────────

interface CertDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  /** Blocks Esc / backdrop close while a request is running. */
  busy?: boolean;
}

const SIZES = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-6xl" };

export function CertDialog({ open, onClose, title, description, icon, children, footer, size = "md", busy }: CertDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the first field, or the panel itself
    requestAnimationFrame(() => {
      const target = panelRef.current?.querySelector<HTMLElement>("[data-autofocus], input, textarea, select") ?? panelRef.current;
      target?.focus();
    });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, busy, onClose]);

  // Portalled: the admin content column is its own stacking context below the sidebar
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-[#07152E]/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !busy && onClose()}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-panel border border-[#DCE2EB] bg-white shadow-float outline-none sm:rounded-panel",
              SIZES[size],
            )}
          >
            <div className="flex items-start gap-4 border-b border-[#DCE2EB] px-6 py-5">
              {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="text-lg font-bold tracking-tighter text-[#10264B]">
                  {title}
                </h2>
                {description && <div className="mt-1 text-sm leading-relaxed text-[#53647C]">{description}</div>}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                aria-label="Close"
                className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#53647C] transition-colors hover:bg-[#F5F7FB] hover:text-[#10264B] disabled:opacity-40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && (
              <div className="flex flex-col-reverse gap-2 border-t border-[#DCE2EB] bg-[#F5F7FB]/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

const monthLabel = (key: string, style: "short" | "long" = "short") => {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: style,
    ...(style === "long" ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
};

/** Six-month issuance columns. Single series, so the tile title names it (no legend). */
export function IssuanceSparkline({ series }: { series: CertificateStats["monthly"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...series.map((s) => s.count));
  const W = 168;
  const H = 52;
  const gap = 2;
  const barW = (W - gap * (series.length - 1)) / series.length;
  const summary = series.map((s) => `${monthLabel(s.month, "long")}: ${s.count}`).join(", ");

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H + 16}`} className="h-[68px] w-full max-w-[200px]" role="img" aria-label={`Certificates issued per month — ${summary}`}>
        <line x1={0} y1={H + 0.5} x2={W} y2={H + 0.5} stroke="#DCE2EB" strokeWidth={1} />
        {series.map((s, i) => {
          const h = s.count === 0 ? 0 : Math.max(4, (s.count / max) * (H - 4));
          const x = i * (barW + gap);
          const r = Math.min(4, barW / 2, h);
          const d = h
            ? `M${x} ${H}V${H - h + r}Q${x} ${H - h} ${x + r} ${H - h}H${x + barW - r}Q${x + barW} ${H - h} ${x + barW} ${H - h + r}V${H}Z`
            : "";
          const isLast = i === series.length - 1;
          return (
            <g key={s.month} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              {/* Hit target taller than the mark */}
              <rect x={x} y={0} width={barW} height={H} fill="transparent" />
              {d && <path d={d} fill={isLast ? "#1246C8" : hover === i ? "#5B86FF" : "#BFD2FF"} />}
              <text x={x + barW / 2} y={H + 13} textAnchor="middle" fontSize={9} fontWeight={600} fill={isLast ? "#10264B" : "#8C9AB0"}>
                {monthLabel(s.month)[0]}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-lg bg-[#10264B] px-2.5 py-1.5 text-[11px] font-semibold text-white shadow-elevated"
          style={{ left: `${((hover + 0.5) / series.length) * 100}%`, transform: "translateX(-50%)" }}
        >
          {monthLabel(series[hover].month, "long")} · {series[hover].count} issued
        </div>
      )}
    </div>
  );
}
