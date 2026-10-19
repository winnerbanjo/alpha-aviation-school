import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { cn } from "@/lib/utils";
import type { VideoName } from "@/lib/videos";

interface BackgroundVideoProps {
  name?: VideoName;
  /** Strength of the navy overlay that keeps headline text readable */
  tone?: "deep" | "medium" | "soft";
  className?: string;
  controlClassName?: string;
  showControl?: boolean;
}

/** Full-bleed film backdrop for heroes, with a visible pause control (WCAG 2.2.2). */
export function BackgroundVideo({
  name = "aviation-campus",
  tone = "deep",
  className,
  controlClassName,
  showControl = true,
}: BackgroundVideoProps) {
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <div aria-hidden="true" className={cn("absolute inset-0 overflow-hidden grain", className)}>
        <AutoVideo
          name={name}
          eager
          active={!userPaused}
          onPlayingChange={setPlaying}
          className="scale-[1.04] object-[60%_center] sm:object-center"
        />
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 bg-gradient-to-r",
          tone === "deep" && "from-[#07152E]/95 via-[#10264B]/70 to-[#10264B]/20",
          tone === "medium" && "from-[#07152E]/90 via-[#10264B]/60 to-[#10264B]/25",
          tone === "soft" && "from-[#07152E]/80 via-[#10264B]/40 to-transparent"
        )}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#07152E] via-transparent to-[#07152E]/50" />
      {showControl && (
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-label={playing ? "Pause background film" : "Play background film"}
          className={cn(
            "group absolute bottom-6 right-4 z-20 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 p-1.5 text-[11px] sm:py-2 sm:pl-2 sm:pr-4 font-medium uppercase tracking-[0.16em] text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#10264B] sm:right-8",
            controlClassName
          )}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 group-hover:bg-[#1246C8] group-hover:text-white">
            {playing ? <Pause size={12} aria-hidden="true" /> : <Play size={12} aria-hidden="true" />}
          </span>
          <span className="hidden sm:inline">{playing ? "Pause film" : "Play film"}</span>
        </button>
      )}
    </>
  );
}
