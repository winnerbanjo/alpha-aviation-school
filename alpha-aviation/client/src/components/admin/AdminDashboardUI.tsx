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
    icon: "from-indigo-50 to-indigo-100/60 text-indigo-600 border-indigo-100/80",
    badge: "bg-indigo-50 text-indigo-600 border-indigo-100",
  },
  emerald: {
    icon: "from-emerald-50 to-emerald-100/60 text-emerald-600 border-emerald-100/80",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-100",
  },
  amber: {
    icon: "from-amber-50 to-amber-100/60 text-amber-600 border-amber-100/80",
    badge: "bg-amber-50 text-amber-700 border-amber-100",
  },
  rose: {
    icon: "from-rose-50 to-rose-100/60 text-rose-600 border-rose-100/80",
    badge: "bg-rose-50 text-rose-600 border-rose-100",
  },
  sky: {
    icon: "from-sky-50 to-sky-100/60 text-sky-600 border-sky-100/80",
    badge: "bg-sky-50 text-sky-600 border-sky-100",
  },
  slate: {
    icon: "from-slate-50 to-slate-100/60 text-slate-600 border-slate-100/80",
    badge: "bg-slate-50 text-slate-600 border-slate-100",
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="text-sm font-normal text-slate-500 mt-1">
          {description}
        </p>
        {meta && <p className="text-xs text-slate-400 mt-1.5">{meta}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {action}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-2xl border-slate-200 bg-white/90 hover:bg-slate-50 font-bold text-xs shadow-sm"
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
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`relative w-12 h-12 rounded-2xl border bg-gradient-to-br shadow-sm flex items-center justify-center ${accentClasses[accent].icon}`}
        >
          <Icon className="w-6 h-6 relative z-10" />
        </div>
        {badge && (
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${accentClasses[accent].badge}`}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <h3 className="text-2xl font-black text-slate-900 mt-1">{value}</h3>
        {helper && <p className="text-xs text-slate-500 mt-2">{helper}</p>}
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
      className={`bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
