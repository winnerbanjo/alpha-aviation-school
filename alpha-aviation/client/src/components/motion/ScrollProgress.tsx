import { useEffect, useRef } from "react";

/** A thin flight-path progress line with a small aircraft that travels as you read. */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (planeRef.current) {
        planeRef.current.style.left = `${p * 100}%`;
        planeRef.current.style.opacity = p > 0.01 && p < 0.995 ? "1" : "0";
      }
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

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-[#1246C8] via-[#5B86FF] to-[#DCE8FF]"
        style={{ transform: "scaleX(0)" }}
      />
      <div ref={planeRef} className="absolute top-[-6px] -translate-x-1/2 text-[#5B86FF] opacity-0 transition-opacity">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="rotate-90">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5Z" />
        </svg>
      </div>
    </div>
  );
}
