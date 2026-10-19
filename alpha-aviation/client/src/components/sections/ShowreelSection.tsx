import { useCallback, useState } from "react";
import { Pause, Play } from "lucide-react";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { posterSrc, showreelOrder, videoLibrary } from "@/lib/videos";

export function ShowreelSection() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);

  const clip = videoLibrary[showreelOrder[index]];
  const total = showreelOrder.length;

  const goTo = useCallback((i: number) => {
    setIndex((i + total) % total);
    setProgress(0);
  }, [total]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  return (
    <section aria-labelledby="showreel-title" className="relative overflow-hidden bg-[#07152E] py-24 text-white sm:py-32">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-chart-grid opacity-60" />
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#1246C8]/25 blur-[140px]" />
      </div>

      <Container className="relative">
        <div className="mb-10 flex flex-col justify-between gap-8 sm:mb-14 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <span data-reveal className="eyebrow text-[#8EAEFF]">Inside aviation, in motion</span>
            <h2 id="showreel-title" data-reveal style={{ ["--d" as string]: "80ms" }} className="mt-5 text-[34px] font-bold leading-[1.05] tracking-tightest sm:text-5xl lg:text-[56px]">
              Six scenes from the world <span className="text-gradient-sky">you&apos;re training for.</span>
            </h2>
          </div>
          <div data-reveal style={{ ["--d" as string]: "160ms" }} className="flex items-center gap-4">
            <p className="text-sm tabular-nums text-white/60">
              <span className="text-3xl font-bold text-white">{String(index + 1).padStart(2, "0")}</span>
              <span className="mx-1.5">/</span>
              {String(total).padStart(2, "0")}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Previous scene"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white hover:text-[#07152E]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
              </button>
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={playing ? "Pause showreel" : "Play showreel"}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#07152E] transition-colors hover:bg-[#DCE8FF]"
              >
                {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next scene"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white hover:text-[#07152E]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Stage */}
        <div data-reveal="mask" className="relative aspect-[4/5] overflow-hidden rounded-stage bg-[#0B1C3A] shadow-float sm:aspect-[16/9]">
          {clip.orientation === "portrait" && (
            <div aria-hidden="true" className="absolute inset-0 hidden sm:block">
                            <img src={posterSrc(clip.name)} alt="" className="h-full w-full scale-110 object-cover opacity-50 blur-2xl" />
            </div>
          )}
          <div
            className={cn(
              "absolute inset-0",
              clip.orientation === "portrait" && "sm:left-1/2 sm:right-auto sm:h-full sm:w-auto sm:-translate-x-1/2 sm:aspect-[9/16]"
            )}
          >
            <AutoVideo
              key={clip.name}
              name={clip.name}
              eager
              loop={false}
              active={!paused}
              onEnded={next}
              onProgress={setProgress}
              onPlayingChange={setPlaying}
            />
          </div>

          {/* Crossfade from the incoming clip's poster */}
                    <img
            key={`fade-${clip.name}`}
            src={posterSrc(clip.name)}
            alt=""
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 h-full w-full object-cover motion-safe:animate-[fadeOut_0.9s_ease-out_forwards]",
              clip.orientation === "portrait" && "sm:hidden"
            )}
          />

          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#07152E]/90 via-transparent to-transparent" />

          <div key={`cap-${clip.name}`} className="absolute inset-x-0 bottom-0 p-6 sm:p-10" aria-live="polite">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8EAEFF] motion-safe:animate-[riseIn_0.8s_cubic-bezier(.16,1,.3,1)_both]">
              Scene {String(index + 1).padStart(2, "0")} · {clip.chapter}
            </p>
            <p className="mt-2 max-w-2xl text-2xl font-bold leading-tight tracking-tighter motion-safe:animate-[riseIn_0.8s_cubic-bezier(.16,1,.3,1)_0.08s_both] sm:text-4xl">
              {clip.title}
            </p>
            <p className="mt-3 hidden max-w-xl text-sm leading-relaxed text-white/70 motion-safe:animate-[riseIn_0.8s_cubic-bezier(.16,1,.3,1)_0.16s_both] sm:block sm:text-base">
              {clip.caption}
            </p>
          </div>
        </div>

        {/* Chapter rail */}
        <ol className="mt-6 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-6 lg:overflow-visible">
          {showreelOrder.map((name, i) => {
            const chapter = videoLibrary[name];
            const isActive = i === index;
            return (
              <li key={name} className="min-w-[150px] snap-start lg:min-w-0">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={isActive ? "true" : undefined}
                  aria-label={`Scene ${i + 1}: ${chapter.title}`}
                  className={cn(
                    "group w-full rounded-2xl border p-3 text-left transition-all duration-300",
                    isActive ? "border-white/30 bg-white/10" : "border-white/10 hover:border-white/25 hover:bg-white/5"
                  )}
                >
                  <span className="relative block aspect-video overflow-hidden rounded-xl bg-[#0B1C3A]">
                                        <img
                      src={posterSrc(name)}
                      alt=""
                      loading="lazy"
                      className={cn(
                        "h-full w-full object-cover transition-all duration-500",
                        isActive ? "opacity-100" : "opacity-50 grayscale group-hover:opacity-80 group-hover:grayscale-0"
                      )}
                    />
                  </span>
                  <span className="mt-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em]">
                    <span className={isActive ? "text-white" : "text-white/55"}>{chapter.chapter}</span>
                    <span className="tabular-nums text-white/40">0{i + 1}</span>
                  </span>
                  <span className="mt-2.5 block h-[3px] overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full origin-left rounded-full bg-gradient-to-r from-[#5B86FF] to-[#DCE8FF] transition-transform duration-300 ease-linear"
                      style={{ transform: `scaleX(${isActive ? progress : i < index ? 1 : 0})` }}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
