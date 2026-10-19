import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { ArrowLink } from "@/components/ui/Buttons";

const statement =
  "We prepare the people who keep the world moving — reservation agents, passenger service teams, travel managers and hospitality professionals — with practical, IATA-aligned skills taught in Lagos and live online.";

const highlights = new Set(["moving", "practical,", "IATA-aligned", "Lagos", "online."]);

const figures = [
  { value: 7, suffix: "", label: "Verified career tracks" },
  { value: 4, suffix: " wks", label: "Intensive course format" },
  { value: 2, suffix: "", label: "Hubs · Ruislip & Lagos" },
  { value: 150, suffix: "k", prefix: "₦", label: "Tuition per course" },
];

export function StatementSection() {
  const textRef = useRef<HTMLParagraphElement>(null);
  const figuresRef = useRef<HTMLDListElement>(null);

  // Words brighten one by one as the paragraph travels through the viewport.
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-word]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      words.forEach((w) => (w.style.opacity = "1"));
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / (rect.height + vh * 0.35)));
      const lit = progress * words.length;
      words.forEach((w, i) => {
        w.style.opacity = String(Math.min(1, Math.max(0.16, lit - i + 0.16)));
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Count the figures up once they come into view.
  useEffect(() => {
    const el = figuresRef.current;
    if (!el) return;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-count]"));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        nodes.forEach((node) => {
          const target = Number(node.dataset.count);
          if (reduced) {
            node.textContent = String(target);
            return;
          }
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / 1400);
            const eased = 1 - Math.pow(1 - t, 3);
            node.textContent = String(Math.round(target * eased));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="statement" className="relative overflow-hidden bg-white py-24 sm:py-36">
      <div aria-hidden="true" className="absolute inset-0 bg-chart-grid-light mask-fade-b opacity-70" />
      <Container className="relative">
        <span data-reveal className="eyebrow text-[#1246C8]">Who we are</span>
        <p
          ref={textRef}
          className="mt-8 max-w-5xl text-[28px] font-semibold leading-[1.22] tracking-tighter text-[#10264B] sm:text-[44px] lg:text-[56px]"
        >
          {statement.split(" ").map((word, i) => (
            <span
              key={i}
              data-word
              className={highlights.has(word) ? "text-[#1246C8]" : undefined}
              style={{ opacity: 0.16, transition: "opacity 0.25s linear" }}
            >
              {word}{" "}
            </span>
          ))}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <ArrowLink href="/about">Our story and standards</ArrowLink>
          <span className="hidden h-4 w-px bg-[#DCE2EB] sm:block" />
          <span className="text-sm text-[#53647C]">Part of the Alpha Step Links group</span>
        </div>

        <dl ref={figuresRef} className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-panel border border-[#DCE2EB] bg-[#DCE2EB] lg:grid-cols-4">
          {figures.map((f, i) => (
            <div key={f.label} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="flex flex-col-reverse bg-white p-6 sm:p-8">
              <dt className="mt-3 text-sm text-[#53647C]">{f.label}</dt>
              <dd className="text-4xl font-bold tracking-tightest text-[#10264B] sm:text-6xl">
                {f.prefix}
                <span data-count={f.value}>{f.value}</span>
                <span className="text-[#1246C8]">{f.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
