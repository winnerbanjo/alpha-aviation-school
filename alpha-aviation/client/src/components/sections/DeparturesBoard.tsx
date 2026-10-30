import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { FlapText } from "@/components/motion/FlapText";
import { Container } from "@/components/ui/Container";
import { ArrowLink } from "@/components/ui/Buttons";
import { programImagery } from "@/lib/program-imagery";
import { programsData } from "@/lib/programs";
import { cn, formatNGN } from "@/lib/utils";

const shortCategory: Record<string, string> = {
  "Ticketing & Operations": "Ticketing",
  "Hospitality & Passenger Services": "Hospitality",
  "Travel & Agency Management": "Travel",
  "Visa & Documentation": "Documentation",
};

export function DeparturesBoard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const board = boardRef.current;
    const preview = previewRef.current;
    if (!board || !preview) return;
    const rect = board.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    preview.style.transform = `translate3d(${x + 24}px, ${y - 90}px, 0)`;
  };

  return (
    <section aria-labelledby="departures-title" className="relative overflow-hidden bg-[#F5F7FB] py-24 sm:py-32">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-6 sm:mb-16 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <span data-reveal className="eyebrow text-[#1246C8]">Academic portfolio</span>
            <h2 id="departures-title" data-reveal style={{ ["--d" as string]: "80ms" }} className="mt-5 text-[34px] font-bold leading-[1.05] tracking-tightest text-[#10264B] sm:text-5xl lg:text-[56px]">
              Seven programs. <span className="text-gradient-blue">Choose your departure.</span>
            </h2>
            <p data-reveal style={{ ["--d" as string]: "160ms" }} className="mt-5 max-w-2xl text-base leading-[1.7] text-[#53647C] sm:text-lg">
              Each intensive four-week course combines hands-on simulation, international airline procedures and industry case studies. Select a flight to see the full syllabus.
            </p>
          </div>
          <div data-reveal style={{ ["--d" as string]: "200ms" }}>
            <ArrowLink href="/courses">Browse the full catalogue</ArrowLink>
          </div>
        </div>

        <div
          ref={boardRef}
          data-reveal="scale"
          onMouseMove={onMove}
          onMouseLeave={() => setHovered(null)}
          className="relative rounded-stage bg-[#07152E] p-3 shadow-float sm:p-5"
        >
          {/* Board header */}
          <div className="flex items-center justify-between px-3 pb-4 pt-2 sm:px-4">
            <div className="flex items-center gap-3 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1246C8]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M2.5 19h19v2h-19v-2Zm19.57-9.36c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 1.82 3.16.77 1.33 1.6-.43 5.31-1.42 4.35-1.16L21 11.49c.81-.23 1.28-1.05 1.07-1.85Z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em]">Departures</p>
                <p className="text-[11px] text-white/50">Lagos · Live virtual · 4-week courses</p>
              </div>
            </div>
            <span className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 sm:flex">
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-emerald-400" />
              Live board
            </span>
          </div>

          <div className="hidden grid-cols-[110px_1fr_150px_110px_130px_44px] gap-4 border-y border-white/10 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40 md:grid">
            <span>Flight</span>
            <span>Program</span>
            <span>Category</span>
            <span>Duration</span>
            <span>Tuition</span>
            <span className="sr-only">Open</span>
          </div>

          <ul>
            {programsData.map((program, i) => (
              <li key={program.id} className="border-b border-white/[0.06] last:border-0">
                <Link
                  to={`/courses/${program.slug}`}
                  onMouseEnter={() => setHovered(i)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    "group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-4 text-white transition-colors duration-300 md:grid-cols-[110px_1fr_150px_110px_130px_44px] md:py-5",
                    hovered === i ? "bg-[#1246C8]" : "hover:bg-white/5"
                  )}
                >
                  <span className="flex gap-[3px] md:order-none">
                    <FlapText
                      text={`ASL${101 + i}`}
                      delay={i * 90}
                      className="flap px-2 py-1 text-xs tracking-[0.12em] sm:text-sm"
                    />
                  </span>
                  <span className="col-span-2 row-start-2 text-base font-semibold leading-snug tracking-tight sm:text-lg md:col-span-1 md:row-start-auto">
                    {program.title}
                  </span>
                  <span className="hidden text-sm text-white/60 group-hover:text-white/85 md:block">{shortCategory[program.category]}</span>
                  <span className="col-start-2 row-start-1 justify-self-end text-xs font-semibold uppercase tracking-[0.14em] text-[#8EAEFF] group-hover:text-white md:col-start-auto md:row-start-auto md:justify-self-start md:text-sm md:normal-case md:tracking-normal">
                    {program.duration}
                  </span>
                  <span className="hidden text-sm font-semibold tabular-nums md:block">{formatNGN(program.priceNGN)}</span>
                  <span
                    aria-hidden="true"
                    className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-[#1246C8] md:flex"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="-rotate-45 transition-transform duration-300 group-hover:rotate-0">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Cursor-following preview (pointer devices only) */}
          <div ref={previewRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-20 hidden w-[280px] lg:block">
            <div
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#10264B] shadow-float transition-all duration-300 ease-out-expo",
                hovered === null ? "rotate-[-4deg] scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
              )}
            >
              {programsData.map((program, i) => (
                <img
                  key={program.id}
                  src={programImagery[program.id].src}
                  alt=""
                 
                 
                  className={cn("absolute inset-0 h-full w-full", "object-cover transition-opacity duration-300", hovered === i ? "opacity-100" : "opacity-0")} loading="lazy" />
              ))}
            </div>
          </div>
        </div>

        <div data-reveal className="mt-8 flex flex-col items-start justify-between gap-4 rounded-panel border border-[#1246C8]/15 bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#10264B]">International 4-course career track</p>
            <p className="mt-1 text-sm text-[#53647C]">Choose any four programs for ₦538,000 — a saving of ₦62,000 on standard tuition.</p>
          </div>
          <ArrowLink href="/enroll">Calculate bundle savings</ArrowLink>
        </div>
      </Container>
    </section>
  );
}
