import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Split-flap style text: characters shuffle briefly before settling, the way an
 * airport departures board updates. Runs once when scrolled into view.
 */
export function FlapText({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let timeout = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timeout = window.setTimeout(() => {
          const start = performance.now();
          const duration = 700 + text.length * 35;
          const tick = (now: number) => {
            const t = (now - start) / duration;
            const settled = Math.floor(t * text.length * 1.15);
            setDisplay(
              text
                .split("")
                .map((ch, i) =>
                  i < settled || ch === " " || ch === "·" ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
                )
                .join("")
            );
            if (t < 1) raf = requestAnimationFrame(tick);
            else setDisplay(text);
          };
          raf = requestAnimationFrame(tick);
        }, delay);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, [text, delay]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
