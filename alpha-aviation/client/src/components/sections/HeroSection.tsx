import { PrimaryButton } from "@/components/ui/Buttons";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { programsData } from "@/lib/programs";
import { revealDelay } from "@/lib/utils";

const facts = [
  { label: "Career tracks", value: "7" },
  { label: "Weeks per course", value: "4" },
  { label: "Learning modes", value: "Lagos & live online" },
];

function FlightPlanCard() {
  return (
    <div className="glass relative w-full max-w-sm overflow-hidden rounded-panel p-6 text-white shadow-float">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
        <span>Flight plan</span>
        <span className="flex items-center gap-1.5 text-[#8EAEFF]">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-[#8EAEFF]" />
          Boarding
        </span>
      </div>

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold tracking-tightest">LOS</p>
          <p className="mt-1 text-xs text-white/60">Lagos · In-person</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold tracking-tightest">LHR</p>
          <p className="mt-1 text-xs text-white/60">Ruislip · UK HQ</p>
        </div>
      </div>

      {/* Animated great-circle arc */}
      <svg viewBox="0 0 300 70" className="mt-2 h-16 w-full" aria-hidden="true">
        <path id="hero-arc" d="M8 62 Q150 -18 292 62" fill="none" stroke="rgba(220,232,255,0.25)" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M8 62 Q150 -18 292 62" fill="none" stroke="url(#arcGrad)" strokeWidth="2" strokeDasharray="420" strokeDashoffset="420" className="motion-safe:animate-[dash_3s_ease-out_0.8s_forwards]" />
        <defs>
          <linearGradient id="arcGrad" x1="0" x2="1">
            <stop offset="0" stopColor="#5B86FF" />
            <stop offset="1" stopColor="#DCE8FF" />
          </linearGradient>
        </defs>
        <circle cx="8" cy="62" r="4" fill="#5B86FF" />
        <circle cx="292" cy="62" r="4" fill="#DCE8FF" />
        <g>
          <path d="M-7 -1.5 L5 -1.5 L9 0 L5 1.5 L-7 1.5 Z M-1 -1.5 L-4 -8 L-1 -8 L4 -1.5 Z M-1 1.5 L-4 8 L-1 8 L4 1.5 Z M-7 -1 L-9 -4 L-7.5 -4 L-5 -1 Z M-7 1 L-9 4 L-7.5 4 L-5 1 Z" fill="#FFFFFF" />
          <animateMotion dur="7s" repeatCount="indefinite" rotate="auto" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
            <mpath href="#hero-arc" />
          </animateMotion>
        </g>
      </svg>

      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-white/15 pt-4 text-xs">
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-white/50">Duration</dt>
          <dd className="mt-1 font-semibold">4 weeks</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-white/50">Tracks</dt>
          <dd className="mt-1 font-semibold">7 courses</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-[0.16em] text-white/50">Tuition</dt>
          <dd className="mt-1 font-semibold">₦150,000</dd>
        </div>
      </dl>
    </div>
  );
}

function DeparturesTicker() {
  const items = [...programsData, ...programsData];
  return (
    <div className="relative z-10 border-y border-white/10 bg-[#07152E]/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] items-center">
        <div className="z-10 hidden shrink-0 items-center gap-2 border-r border-white/10 bg-[#1246C8] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white sm:flex">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M2.5 19h19v2h-19v-2Zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 1.82 3.16.77 1.33 1.6-.43 5.31-1.42 4.35-1.16L21 11.49c.81-.23 1.28-1.05 1.07-1.85Z" />
          </svg>
          Departures
        </div>
        <div className="mask-fade-x relative flex-1 overflow-hidden py-3.5">
          <ul className="flex w-max animate-marquee gap-10 pr-10 motion-reduce:animate-none" aria-label="Programs offered">
            {items.map((p, i) => (
              <li key={`${p.id}-${i}`} aria-hidden={i >= programsData.length} className="flex items-center gap-3 whitespace-nowrap text-sm text-white/80">
                <span className="font-semibold tabular-nums text-[#8EAEFF]">ASL {String((i % programsData.length) + 101)}</span>
                <span className="font-medium text-white">{p.title}</span>
                <span className="text-white/40">·</span>
                <span className="text-white/60">{p.duration}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#07152E] text-white">
      <BackgroundVideo name="aviation-campus" controlClassName="bottom-20 sm:bottom-24" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 pb-16 pt-36 sm:px-6 sm:pt-40 lg:px-8">
        <div className="grid items-end gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div data-reveal="fade" className="glass inline-flex items-center gap-3 rounded-full px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5B86FF]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-[11px]">Aviation · Travel · Hospitality</span>
            </div>

            <h1 id="hero-title" className="mt-7 text-[46px] font-bold leading-[0.98] tracking-tightest sm:text-7xl lg:text-[96px]">
              <span className="line-mask">
                <span style={revealDelay(120)}>Your ambition.</span>
              </span>
              <span className="line-mask">
                <span className="text-gradient-sky" style={revealDelay(240)}>
                  A clear direction.
                </span>
              </span>
            </h1>

            <p data-reveal style={revealDelay(380)} className="mt-7 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Build practical skills for a world of opportunity. Intensive, IATA-aligned training in airline ticketing, passenger services and travel operations — in-person in Lagos and in live virtual classes.
            </p>

            <div data-reveal style={revealDelay(480)} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <PrimaryButton href="/courses" size="lg" arrow>
                Explore our programs
              </PrimaryButton>
              <PrimaryButton href="/enroll" size="lg" variant="glass">
                Speak with admissions
              </PrimaryButton>
            </div>

            <dl data-reveal style={revealDelay(600)} className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
              {facts.map((fact) => (
                <div key={fact.label} className="border-l border-white/20 pl-4">
                  <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">{fact.label}</dt>
                  <dd className="mt-1 text-lg font-semibold">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div data-reveal="right" style={revealDelay(500)} className="hidden justify-end lg:col-span-4 lg:flex">
            <div className="animate-float motion-reduce:animate-none">
              <FlightPlanCard />
            </div>
          </div>
        </div>
      </div>

      <a
        href="#statement"
        aria-label="Scroll to learn more"
        className="absolute bottom-24 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60 hover:text-white md:flex"
      >
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-white/20">
          <span className="absolute inset-x-0 top-0 h-1/2 animate-scroll-cue bg-white" />
        </span>
      </a>

      <DeparturesTicker />
    </section>
  );
}
