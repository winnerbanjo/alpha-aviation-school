import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const pillars = [
  {
    tag: "Terminal labs",
    title: "Hands-on GDS command training",
    body: "Rather than memorising abstract charts, students work inside simulated Global Distribution System environments — building passenger name records, decoding fare ladders and processing electronic ticket reissues directly.",
    chips: ["Sabre · Amadeus · Galileo logic", "Practical drills"],
    image: "/images/generated/simulation-lab.webp",
    alt: "Students practising airline reservations at classroom workstations",
  },
  {
    tag: "Cabin & ground",
    title: "Passenger care, poise and communication",
    body: "Customer service and hospitality trainees practise grooming, public-address voice work, cross-cultural awareness and calm de-escalation for delayed or irregular operations.",
    chips: ["Cabin safety awareness", "Service recovery"],
    image: "/images/generated/hospitality.webp",
    alt: "Cabin service trainee preparing a passenger tray",
  },
  {
    tag: "Dual hubs",
    title: "UK governance, Lagos training floor",
    body: "Corporate governance in Ruislip, Greater London, connects with our training facility in Ilasamaja, Lagos — giving students an international perspective that bridges West Africa and Europe.",
    chips: ["Ruislip HA4", "Lagos 102214"],
    image: "/images/generated/global-network.webp",
    alt: "Illustrated global flight network connecting continents",
  },
  {
    tag: "Transparency",
    title: "Honest admissions, clear tuition",
    body: "Each core four-week course is ₦150,000, with a ₦538,000 package for any four courses. No hidden exam fees, no unverified placement guarantees and no pressure tactics.",
    chips: ["₦150,000 per course", "No hidden surcharges"],
    image: "/images/generated/academy-story.webp",
    alt: "Aviation school building and training aircraft",
  },
];

export function WhyASLSection() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="why-title" className="relative bg-white py-24 sm:py-32">
      <Container>
        <div className="mb-14 max-w-3xl sm:mb-20">
          <span data-reveal className="eyebrow text-[#1246C8]">Distinctive pedagogy</span>
          <h2 id="why-title" data-reveal style={{ ["--d" as string]: "80ms" }} className="mt-5 text-[34px] font-bold leading-[1.05] tracking-tightest text-[#10264B] sm:text-5xl lg:text-[56px]">
            Built for practical competence, <span className="text-gradient-blue">not passive lectures.</span>
          </h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Sticky media column */}
          <div className="hidden lg:col-span-6 lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] max-h-[calc(100vh-9rem)] w-full overflow-hidden rounded-stage bg-[#10264B] shadow-float">
                {pillars.map((p, i) => (
                  <img
                    key={p.image}
                    src={p.image}
                    alt={p.alt}
                   
                   
                    className={cn("absolute inset-0 h-full w-full", 
                      "object-cover transition-all duration-[1.2s] ease-out-expo",
                      active === i ? "scale-100 opacity-100" : "scale-110 opacity-0"
                    )} loading="lazy" />
                ))}
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#07152E]/80 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-7 text-white">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF]">Pillar {String(active + 1).padStart(2, "0")}</p>
                    <p key={active} className="mt-1 text-2xl font-bold tracking-tighter motion-safe:animate-[riseIn_0.7s_cubic-bezier(.16,1,.3,1)_both]">
                      {pillars[active].tag}
                    </p>
                  </div>
                  <div className="flex gap-1.5" aria-hidden="true">
                    {pillars.map((_, i) => (
                      <span key={i} className={cn("h-1.5 rounded-full transition-all duration-500", active === i ? "w-8 bg-white" : "w-1.5 bg-white/40")} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrolling narrative column */}
          <div className="lg:col-span-6">
            {pillars.map((p, i) => (
              <div
                key={p.title}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-index={i}
                className="flex flex-col justify-center border-t border-[#DCE2EB] py-10 first:border-t-0 first:pt-0 lg:min-h-[64vh] lg:py-16"
              >
                <div className="relative mb-8 aspect-[16/10] overflow-hidden rounded-panel lg:hidden">
                  <img src={p.image} alt={p.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                </div>
                <div className={cn("transition-opacity duration-700 lg:opacity-30", active === i && "lg:opacity-100")}>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl font-bold tracking-tightest text-[#DCE8FF] sm:text-7xl">0{i + 1}</span>
                    <span className="eyebrow text-[#1246C8]">{p.tag}</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-bold tracking-tighter text-[#10264B] sm:text-[34px] sm:leading-tight">{p.title}</h3>
                  <p className="mt-4 max-w-lg text-base leading-[1.75] text-[#53647C]">{p.body}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {p.chips.map((chip) => (
                      <li key={chip} className="rounded-full border border-[#DCE2EB] bg-[#F5F7FB] px-3.5 py-1.5 text-xs font-medium text-[#172B49]">
                        {chip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
