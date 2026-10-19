import { useState } from "react";
import { cn } from "@/lib/utils";

// Equirectangular crop: longitude -100°→30°, latitude 72°→-2° mapped onto 1000×560.
const project = (lat: number, lon: number) => ({ x: (lon + 100) * (1000 / 130), y: (72 - lat) * (560 / 74) });

const hubs = [
  {
    id: "uk",
    code: "LHR",
    city: "Ruislip, Greater London",
    country: "United Kingdom",
    role: "Headquarters · governance & curriculum",
    detail: "Our UK headquarters provides institutional oversight, syllabus review and admissions support.",
    ...project(51.57, -0.43),
  },
  {
    id: "ng",
    code: "LOS",
    city: "Ilasamaja, Lagos",
    country: "Nigeria",
    role: "Training centre · in-person learning",
    detail: "Our practical training centre with reservation workstations, passenger handling drills and regular cohort intakes.",
    ...project(6.52, 3.38),
  },
  {
    id: "ca",
    code: "YYZ",
    city: "Toronto pathway",
    country: "Canada",
    role: "Academic advisement",
    detail: "Educational guidance for graduates planning further aviation or travel management study in North America.",
    ...project(43.68, -79.63),
  },
] as const;

type HubId = (typeof hubs)[number]["id"];

const routes: { id: string; from: HubId; to: HubId; d: string }[] = [
  { id: "los-lhr", from: "ng", to: "uk", d: "" },
  { id: "lhr-yyz", from: "uk", to: "ca", d: "" },
];

const hub = (id: HubId) => hubs.find((h) => h.id === id)!;
routes[0].d = `M${hub("ng").x} ${hub("ng").y} Q ${hub("ng").x - 150} ${(hub("ng").y + hub("uk").y) / 2} ${hub("uk").x} ${hub("uk").y}`;
routes[1].d = `M${hub("uk").x} ${hub("uk").y} Q ${(hub("uk").x + hub("ca").x) / 2} 10 ${hub("ca").x} ${hub("ca").y}`;

const PLANE = "M-8 -1.6 L6 -1.6 L10 0 L6 1.6 L-8 1.6 Z M-1 -1.6 L-5 -10 L-1.5 -10 L5 -1.6 Z M-1 1.6 L-5 10 L-1.5 10 L5 1.6 Z M-8 -1 L-10.5 -5 L-8.5 -5 L-5.5 -1 Z M-8 1 L-10.5 5 L-8.5 5 L-5.5 1 Z";

export function RouteMap({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const [selected, setSelected] = useState<HubId>("ng");
  const active = hub(selected);
  const dark = tone === "dark";

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-stage border",
          dark ? "border-white/10 bg-[#07152E]/70 backdrop-blur-md" : "border-[#DCE2EB] bg-white shadow-elevated"
        )}
      >
        <svg viewBox="0 0 1000 560" className="block h-auto w-full" role="img" aria-label="Route map connecting Lagos, the United Kingdom and Canada">
          <defs>
            <linearGradient id="routeGrad" x1="0" x2="1">
              <stop offset="0" stopColor="#5B86FF" />
              <stop offset="1" stopColor={dark ? "#DCE8FF" : "#1246C8"} />
            </linearGradient>
            <radialGradient id="nodeGlow">
              <stop offset="0" stopColor="#5B86FF" stopOpacity="0.55" />
              <stop offset="1" stopColor="#5B86FF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Graticule */}
          <g stroke={dark ? "rgba(220,232,255,0.07)" : "rgba(16,38,75,0.07)"} strokeWidth="1">
            {Array.from({ length: 14 }, (_, i) => (
              <line key={`v${i}`} x1={i * (1000 / 13)} y1="0" x2={i * (1000 / 13)} y2="560" />
            ))}
            {[70, 60, 50, 40, 30, 20, 10].map((lat) => (
              <line key={`h${lat}`} x1="0" y1={project(lat, 0).y} x2="1000" y2={project(lat, 0).y} />
            ))}
          </g>
          {/* Equator & prime meridian */}
          <g stroke={dark ? "rgba(91,134,255,0.35)" : "rgba(18,70,200,0.25)"} strokeDasharray="2 6" strokeWidth="1.2">
            <line x1="0" y1={project(0, 0).y} x2="1000" y2={project(0, 0).y} />
            <line x1={project(0, 0).x} y1="0" x2={project(0, 0).x} y2="560" />
          </g>
          <g fill={dark ? "rgba(220,232,255,0.4)" : "rgba(83,100,124,0.7)"} fontSize="11" letterSpacing="2" fontFamily="inherit">
            <text x="12" y={project(0, 0).y - 8}>EQUATOR</text>
            <text x={project(0, 0).x + 8} y="24">0°</text>
            <text x="12" y={project(60, 0).y - 8}>60°N</text>
            <text x="12" y={project(30, 0).y - 8}>30°N</text>
          </g>

          {/* Routes */}
          {routes.map((r) => {
            const lit = r.from === selected || r.to === selected;
            return (
              <g key={r.id}>
                <path id={`route-${r.id}`} d={r.d} fill="none" stroke={dark ? "rgba(220,232,255,0.18)" : "rgba(16,38,75,0.15)"} strokeWidth="1.5" strokeDasharray="5 7" />
                <path
                  d={r.d}
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth={lit ? 3 : 1.5}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                  opacity={lit ? 1 : 0.35}
                />
                <g fill={dark ? "#FFFFFF" : "#1246C8"} className="motion-reduce:hidden">
                  <path d={PLANE} />
                  <animateMotion dur={r.id === "lhr-yyz" ? "9s" : "7s"} repeatCount="indefinite" rotate="auto">
                    <mpath href={`#route-${r.id}`} />
                  </animateMotion>
                </g>
              </g>
            );
          })}

          {/* Hubs */}
          {hubs.map((h) => {
            const isActive = h.id === selected;
            const labelLeft = false;
            return (
              <g
                key={h.id}
                onClick={() => setSelected(h.id)}
                onMouseEnter={() => setSelected(h.id)}
                className="cursor-pointer"
              >
                <circle cx={h.x} cy={h.y} r={isActive ? 46 : 28} fill="url(#nodeGlow)" className="transition-all duration-500" />
                {isActive && (
                  <circle cx={h.x} cy={h.y} r="10" fill="none" stroke="#5B86FF" strokeWidth="1.5" className="motion-safe:animate-ping" style={{ transformOrigin: `${h.x}px ${h.y}px` }} />
                )}
                <circle cx={h.x} cy={h.y} r={isActive ? 8 : 6} fill={isActive ? "#FFFFFF" : "#5B86FF"} stroke="#1246C8" strokeWidth="3" />
                <text
                  x={labelLeft ? h.x - 18 : h.x + 18}
                  y={h.y + 6}
                  textAnchor={labelLeft ? "end" : "start"}
                  fontSize="22"
                  fontWeight="700"
                  fill={dark ? "#FFFFFF" : "#10264B"}
                  fontFamily="inherit"
                >
                  {h.code}
                </text>
                <text
                  x={labelLeft ? h.x - 18 : h.x + 18}
                  y={h.y + 26}
                  textAnchor={labelLeft ? "end" : "start"}
                  fontSize="12"
                  fill={dark ? "rgba(220,232,255,0.6)" : "#53647C"}
                  fontFamily="inherit"
                >
                  {h.country}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hub selector */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3" role="group" aria-label="Choose a location">
        {hubs.map((h) => {
          const isActive = h.id === selected;
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => setSelected(h.id)}
              aria-pressed={isActive}
              className={cn(
                "rounded-2xl border p-4 text-left transition-all duration-300",
                dark
                  ? isActive
                    ? "border-[#5B86FF] bg-[#1246C8] text-white"
                    : "border-white/10 bg-white/[0.04] text-white hover:border-white/30"
                  : isActive
                    ? "border-[#1246C8] bg-[#1246C8] text-white"
                    : "border-[#DCE2EB] bg-white text-[#10264B] hover:border-[#1246C8]/50"
              )}
            >
              <span className="flex items-center justify-between">
                <span className="text-lg font-bold tracking-tight">{h.code}</span>
                <span className={cn("text-[10px] font-semibold uppercase tracking-[0.18em]", isActive ? "text-white/70" : dark ? "text-white/45" : "text-[#53647C]")}>
                  {h.country}
                </span>
              </span>
              <span className={cn("mt-1 block text-xs", isActive ? "text-white/80" : dark ? "text-white/55" : "text-[#53647C]")}>{h.role}</span>
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className={cn("mt-4 text-sm leading-relaxed", dark ? "text-white/70" : "text-[#53647C]")}>
        <span className={cn("font-semibold", dark ? "text-white" : "text-[#10264B]")}>{active.city}. </span>
        {active.detail}
      </p>
    </div>
  );
}
