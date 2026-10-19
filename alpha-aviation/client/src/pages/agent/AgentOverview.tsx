import { useState, useEffect } from "react";
import { Users, CreditCard, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { getAgentStats } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { formatNaira } from "@/data/courseCatalog";

interface AgentStats {
  totalStudents: number;
  paidStudents: number;
  pendingStudents: number;
  totalPaid: number;
  totalPending: number;
}

export function AgentOverview() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgentStats()
      .then((res) => { if (res?.success) setStats(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const statCards = [
    {
      label: "Total Students",
      value: stats?.totalStudents ?? 0,
      icon: Users,
    },
    {
      label: "Payment Confirmed",
      value: stats?.paidStudents ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Pending Payment",
      value: stats?.pendingStudents ?? 0,
      icon: Clock,
    },
    {
      label: "Total Paid",
      value: stats?.totalPaid ?? 0,
      icon: CreditCard,
      isCurrency: true,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <section className="relative overflow-hidden rounded-stage bg-[#07152E] p-6 text-white shadow-float sm:p-8 lg:p-10">
        <div aria-hidden="true" className="absolute inset-0 bg-chart-grid mask-fade-b opacity-70" />
        <div aria-hidden="true" className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow text-[#8EAEFF]">Agent portal</span>
            <h1 className="mt-4 text-3xl font-bold leading-[1.08] tracking-tightest sm:text-4xl lg:text-[44px]">
              {getGreeting()}, <span className="text-gradient-sky">{user?.firstName || "Agent"}</span>
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-2.5 text-sm text-white/65">
              {user?.agencyName ? (
                <>{user.agencyName} &middot; <span className="flap px-2 py-1 text-xs tracking-[0.14em] empty:hidden">{user.agentCode}</span></>
              ) : (
                <><span className="flap px-2 py-1 text-xs tracking-[0.14em] empty:hidden">{user?.agentCode}</span></>
              )}
            </p>
          </div>
          <button
            onClick={() => navigate("/agent/dashboard/students")}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#1246C8] px-5 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-[#0F3BAA] hover:shadow-glow-lg md:self-auto"
          >
            Register Student
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-panel border border-[#DCE2EB] bg-white p-5 shadow-subtle sm:p-6">
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">{card.label}</p>
              <p className="mt-2 break-words text-2xl font-bold tracking-tightest text-[#10264B] tabular-nums sm:text-3xl">
                {loading ? (
                  <span className="inline-block h-8 w-16 animate-pulse rounded-lg bg-[#EEF2F8]" />
                ) : card.isCurrency ? formatNaira(card.value as number) : card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div
          onClick={() => navigate("/agent/dashboard/students")}
          className="group cursor-pointer rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1246C8]/30 hover:shadow-elevated"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <Users className="h-5 w-5" />
            </div>
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#10264B]/10 text-[#10264B] transition-all duration-300 group-hover:border-[#1246C8] group-hover:bg-[#1246C8] group-hover:text-white">
              <ArrowRight className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0" />
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tighter text-[#10264B]">Manage students</h3>
          <p className="mt-1.5 text-sm text-[#53647C]">View, manage and pay for your enrolled students</p>
        </div>

        <div
          onClick={() => navigate("/agent/dashboard/payments")}
          className="group cursor-pointer rounded-panel border border-[#DCE2EB] bg-white p-6 shadow-subtle transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1246C8]/30 hover:shadow-elevated"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#DCE8FF] text-[#1246C8]">
              <CreditCard className="h-5 w-5" />
            </div>
            <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#10264B]/10 text-[#10264B] transition-all duration-300 group-hover:border-[#1246C8] group-hover:bg-[#1246C8] group-hover:text-white">
              <ArrowRight className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0" />
            </span>
          </div>
          <h3 className="text-lg font-bold tracking-tighter text-[#10264B]">Payment history</h3>
          <p className="mt-1.5 text-sm text-[#53647C]">Track all payments made on behalf of your students</p>
        </div>
      </div>

      {stats && stats.totalPending > 0 && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-panel border border-amber-200 bg-amber-50/70 p-5 sm:p-6 md:flex-row md:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-1 ring-amber-600/15">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Outstanding Balance</p>
              <p className="mt-0.5 text-xs text-amber-700">{stats.pendingStudents} student(s) awaiting payment</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-2xl font-bold tracking-tighter text-amber-900 tabular-nums">{formatNaira(stats.totalPending)}</p>
            <button
              onClick={() => navigate("/agent/dashboard/students")}
              className="rounded-full bg-[#1246C8] px-4 py-2 text-xs font-semibold text-white shadow-glow transition-all hover:bg-[#0F3BAA] hover:shadow-glow-lg"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
