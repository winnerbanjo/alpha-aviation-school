import React from "react";
import { Link } from "react-router-dom";
import { programImagery } from "@/lib/program-imagery";
import { type Program, programsData } from "@/lib/programs";
import { formatNGN } from "@/lib/utils";

interface ProgramCardProps {
  program: Program;
}

export function ProgramCard({ program }: ProgramCardProps) {
  const flightNo = 101 + programsData.findIndex((p) => p.id === program.id);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-panel border border-[#DCE2EB] bg-white transition-all duration-500 ease-out-expo hover:-translate-y-1.5 hover:border-[#1246C8]/30 hover:shadow-float">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#10264B]">
        <img
          src={programImagery[program.id].src}
          alt={programImagery[program.id].alt}
         
         
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.06]" loading="lazy" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#07152E]/70 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-[#10264B] backdrop-blur">
          {program.category}
        </span>
        <span className="flap absolute bottom-4 left-4 px-2 py-1 text-xs tracking-[0.12em]">ASL{flightNo}</span>
        <span className="absolute bottom-4 right-4 text-xs font-semibold text-white/90">{program.duration}</span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-bold leading-snug tracking-tight text-[#10264B] transition-colors group-hover:text-[#1246C8]">
          <Link to={`/courses/${program.slug}`} className="after:absolute after:inset-0 after:content-['']">
            {program.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[#53647C]">{program.shortDescription}</p>

        <ul className="mt-5 space-y-2 text-[13px] text-[#172B49]">
          {program.highlights.slice(0, 2).map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1246C8" strokeWidth="2.6" className="mt-0.5 shrink-0" aria-hidden="true">
                <path d="M5 12l5 5L20 7" />
              </svg>
              <span className="leading-snug">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
        <div className="flex items-center justify-between border-t border-[#DCE2EB] pt-5">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#53647C]">Tuition</span>
            <span className="text-lg font-bold tabular-nums text-[#10264B]">{formatNGN(program.priceNGN)}</span>
          </div>
          <Link
            to={`/enroll?program=${program.slug}`}
            className="relative z-10 inline-flex items-center gap-2 rounded-full bg-[#F5F7FB] px-4 py-2.5 text-xs font-semibold text-[#10264B] transition-colors hover:bg-[#1246C8] hover:text-white"
          >
            Enroll
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
        </div>
      </div>
    </article>
  );
}
