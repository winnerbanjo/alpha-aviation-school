import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface AircraftSystemsGraphicProps {
  className?: string;
  variant?: "dark" | "light";
}

export function AircraftSystemsGraphic({
  className,
  variant = "dark",
}: AircraftSystemsGraphicProps) {
  const [activeZone, setActiveZone] = useState<number>(0);
  const isDark = variant === "dark";

  const zones = [
    {
      title: "Zone A: Flight Deck & Avionics Bay",
      scope: "Air Ticketing & Navigation Logistics",
      desc: "Electronic flight bags, flight plans, computerized GDS dispatch coordination, and ATC radio protocols.",
      highlight: "Trained in Air Ticketing & Reservation Management",
    },
    {
      title: "Zone B: Forward Entry & Galley Hospitality",
      scope: "Passenger Greeting & In-Flight Service",
      desc: "Door operation mechanics, welcome etiquette, business class galley prep, and VIP passenger reception.",
      highlight: "Trained in Customer Service & Aviation Hospitality",
    },
    {
      title: "Zone C: Passenger Cabin & Safety Systems",
      scope: "In-Flight Hospitality & De-escalation",
      desc: "Seating zoning, cross-cultural passenger care, medical emergency kits, oxygen systems, and calm conflict resolution.",
      highlight: "Trained in Customer Service in Aviation",
    },
    {
      title: "Zone D: Lower Deck Cargo & Baggage Hold",
      scope: "Ground Handling & Baggage Logistics",
      desc: "Unit Load Devices (ULD), passenger baggage reconciliation (BRS), customs manifest compliance, and hazardous cargo rules.",
      highlight: "Trained in Travel Agency & Aviation Operations",
    },
  ];

  return (
    <div
      className={cn(
        "rounded-card border p-6 select-none font-mono transition-all duration-300",
        isDark
          ? "bg-[#10264B] border-[#172B49] text-white shadow-elevated"
          : "bg-[#F5F7FB] border-[#DCE2EB] text-[#172B49] shadow-card",
        className
      )}
      role="region"
      aria-label="Interactive Commercial Aircraft Operational Zones and Systems Diagram"
    >
      <div className="flex items-center justify-between text-[11px] tracking-wider uppercase mb-4 border-b pb-3 border-current/15">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#1246C8] animate-pulse" />
          <span className="font-semibold tracking-tight">COMMERCIAL AIRFRAME OPERATIONAL ZONES</span>
        </div>
        <span className="text-[10px] opacity-70">PASSENGER AIRCRAFT · CUTAWAY</span>
      </div>

      <div className="relative aspect-[2/1] overflow-hidden rounded-lg"><img src="/images/generated/aircraft-systems.webp" alt="Illustrated cutaway of a passenger aircraft showing the flight deck, cabin and cargo compartments" className="absolute inset-0 h-full w-full object-contain bg-[#efeeeb]" loading="lazy" /></div>
      <div className="flex flex-wrap gap-2 mt-4">{zones.map((zone, index) => <button key={zone.title} type="button" aria-pressed={activeZone === index} onClick={() => setActiveZone(index)} className={cn("rounded border px-3 py-2 text-xs transition-colors", activeZone === index ? "bg-[#1246C8] text-white border-[#1246C8]" : "border-current/20 hover:border-[#1246C8]")}>{zone.title.split(":")[0]}</button>)}</div>

      {/* Selected Zone Telemetry Box */}
      <div
        className={cn(
          "mt-3 p-4 rounded border text-xs",
          isDark ? "bg-[#0b1a33] border-[#172B49]" : "bg-white border-[#DCE2EB]"
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 mb-2 border-current/15">
          <span className="font-bold text-[#1246C8] uppercase tracking-wider">
            {zones[activeZone].title}
          </span>
          <span className="text-[10px] text-emerald-500 font-bold">
            {zones[activeZone].scope}
          </span>
        </div>
        <p className="text-sm opacity-90 mb-2 leading-relaxed">
          {zones[activeZone].desc}
        </p>
        <p className="text-[11px] text-[#1246C8] font-bold">
          Curriculum Alignment: {zones[activeZone].highlight}
        </p>
      </div>
    </div>
  );
}
