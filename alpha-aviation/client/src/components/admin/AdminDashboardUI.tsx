import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type Accent = "indigo" | "emerald" | "amber" | "rose" | "sky" | "slate";

const accentClasses: Record<
  Accent,
  {
    icon: string;
    badge: string;
  }
> = {
  indigo: {
    icon: "bg-[#DCE8FF] text-[#1246C8]",
    badge: "bg-[#DCE8FF] text-[#1246C8] ring-1 ring-[#1246C8]/15",
  },
  emerald: {
    icon: "bg-emerald-50 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/15",
  },
  amber: {
    icon: "bg-amber-50 text-amber-600",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/15",
  },
  rose: {
    icon: "bg-red-50 text-red-600",
    badge: "bg-red-50 text-red-700 ring-1 ring-red-600/15",
  },
  sky: {
    icon: "bg-[#DCE8FF] text-[#1246C8]",
    badge: "bg-[#DCE8FF] text-[#1246C8] ring-1 ring-[#1246C8]/15",
  },
  slate: {
    icon: "bg-[#F5F7FB] text-[#53647C]",
    badge: "bg-[#F5F7FB] text-[#53647C] ring-1 ring-[#DCE2EB]",
  },
};

interface AdminPageShellProps {
  children: ReactNode;
}

export function AdminPageShell({ children }: AdminPageShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8 pb-12"
    >
      {children}
    </motion.div>
  );
}

interface AdminPageHeaderProps {
  title: string;
  description: string;
  meta?: string;
  action?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function AdminPageHeader({
  title,
  description,
  meta,
  action,
  onRefresh,
  refreshing,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <span className="eyebrow text-[#1246C8]">Administration</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tightest text-[#10264B] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[#53647C]">
          {description}
        </p>
        {meta && (
          <p className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-[#8C9AB0]">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {meta}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {action}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="bg-white shadow-subtle"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
}

interface AdminMetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: LucideIcon;
  accent?: Accent;
  badge?: string;
}

export function AdminMetricCard({
  label,
  value,
  helper,
  icon: Icon,
  accent = "indigo",
  badge,
}: AdminMetricCardProps) {
  return (
    <div className="relative flex flex-col bg-white p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${accentClasses[accent].icon}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
        {badge && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${accentClasses[accent].badge}`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="mt-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">
          {label}
        </p>
        <h3 className="mt-2 text-3xl font-bold tracking-tightest text-[#10264B] tabular-nums">{value}</h3>
        {helper && <p className="mt-2 text-sm text-[#53647C]">{helper}</p>}
      </div>
    </div>
  );
}

interface AdminPanelProps {
  children: ReactNode;
  className?: string;
}

export function AdminPanel({ children, className = "" }: AdminPanelProps) {
  return (
    <div
      className={`overflow-hidden rounded-panel border border-[#DCE2EB] bg-white shadow-subtle ${className}`}
    >
      {children}
    </div>
  );
}
