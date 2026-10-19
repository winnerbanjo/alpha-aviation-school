import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { type Program, internationalBundleConfig } from "@/lib/programs";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { cn } from "@/lib/utils";

interface ProgramFilterProps {
  programs: Program[];
}

export function ProgramFilter({ programs }: ProgramFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = useMemo(() => ["All", ...new Set(programs.map((p) => p.category))], [programs]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: programs.length };
    programs.forEach((p) => (map[p.category] = (map[p.category] ?? 0) + 1));
    return map;
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return programs.filter((p) => {
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.outline.some((mod) => mod.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [programs, selectedCategory, searchQuery]);

  const reset = () => {
    setSearchQuery("");
    setSelectedCategory("All");
  };

  return (
    <div className="space-y-10">
      {/* Search & filter bar */}
      <div className="sticky top-24 z-30 rounded-[26px] border border-[#DCE2EB] bg-white/85 p-2.5 shadow-elevated backdrop-blur-xl">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start">
          <label className="relative block shrink-0 lg:w-72">
            <span className="sr-only">Search programs</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#53647C]" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search GDS, ticketing, cabin crew…"
              className="w-full rounded-full border border-transparent bg-[#F5F7FB] py-3 pl-11 pr-4 text-sm text-[#10264B] placeholder-[#53647C] transition-colors focus:border-[#1246C8] focus:bg-white focus:outline-none"
            />
          </label>

          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] lg:flex-wrap lg:overflow-visible" role="group" aria-label="Filter by category">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all duration-300",
                    active ? "bg-[#10264B] text-white shadow-subtle" : "text-[#172B49] hover:bg-[#F5F7FB]"
                  )}
                >
                  {cat === "All" ? "All programs" : cat}
                  <span className={cn("rounded-full px-1.5 text-[10px] tabular-nums", active ? "bg-white/15" : "bg-[#DCE8FF] text-[#1246C8]")}>
                    {counts[cat]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-sm text-[#53647C]" aria-live="polite">
        <span>
          Showing <strong className="text-[#10264B]">{filteredPrograms.length}</strong> of {programs.length} programs
        </span>
        {(searchQuery || selectedCategory !== "All") && (
          <button type="button" onClick={reset} className="font-semibold text-[#1246C8] hover:underline">
            Reset filters
          </button>
        )}
      </div>

      {filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {filteredPrograms.map((program, i) => (
            <div key={program.id} className="motion-safe:animate-[riseIn_0.6s_cubic-bezier(.16,1,.3,1)_both]" style={{ animationDelay: `${i * 60}ms` }}>
              <ProgramCard program={program} />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-stage border border-dashed border-[#DCE2EB] bg-white p-12 text-center">
          <p className="text-lg font-bold text-[#10264B]">No programs match “{searchQuery}”</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-[#53647C]">Try another keyword or reset the filters to see all seven programs.</p>
          <button type="button" onClick={reset} className="mt-6 rounded-full bg-[#1246C8] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#10264B]">
            Reset all filters
          </button>
        </div>
      )}

      {/* Bundle offer */}
      <div className="relative overflow-hidden rounded-stage bg-[#10264B] p-8 text-white sm:p-10">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#1246C8]/60 blur-[90px]" />
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
              {internationalBundleConfig.badge}
            </span>
            <p className="mt-4 text-2xl font-bold tracking-tight">{internationalBundleConfig.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {internationalBundleConfig.description} Tuition is consolidated to ₦538,000 for any four tracks.
            </p>
          </div>
          <Link
            to="/enroll"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#10264B] transition-colors hover:bg-[#DCE8FF] md:self-auto"
          >
            Calculate bundle savings
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
