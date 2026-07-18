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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {getGreeting()}, {user?.firstName || "Agent"}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.agencyName ? (
              <>{user.agencyName} &middot; {user.agentCode}</>
            ) : (
              <>{user?.agentCode}</>
            )}
          </p>
        </div>
        <button
          onClick={() => navigate("/agent/dashboard/students")}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          Register Student
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white border border-slate-200 rounded-lg p-5">
              <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-slate-600" />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">
                {loading ? (
                  <span className="inline-block w-12 h-6 bg-slate-100 animate-pulse rounded" />
                ) : card.isCurrency ? formatNaira(card.value as number) : card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => navigate("/agent/dashboard/students")}
          className="bg-white border border-slate-200 rounded-lg p-5 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Manage Students</h3>
          <p className="text-sm text-slate-500 mt-1">View, manage and pay for your enrolled students</p>
        </div>

        <div
          onClick={() => navigate("/agent/dashboard/payments")}
          className="bg-white border border-slate-200 rounded-lg p-5 cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-slate-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Payment History</h3>
          <p className="text-sm text-slate-500 mt-1">Track all payments made on behalf of your students</p>
        </div>
      </div>

      {stats && stats.totalPending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className="font-medium text-amber-900 text-sm">Outstanding Balance</p>
              <p className="text-xs text-amber-700 mt-0.5">{stats.pendingStudents} student(s) awaiting payment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xl font-semibold text-amber-900">{formatNaira(stats.totalPending)}</p>
            <button
              onClick={() => navigate("/agent/dashboard/students")}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
