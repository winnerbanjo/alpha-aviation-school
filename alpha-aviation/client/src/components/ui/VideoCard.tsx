import { useEffect, useState } from "react";
import { AutoVideo } from "@/components/ui/AutoVideo";
import { cn } from "@/lib/utils";
import { videoLibrary, type VideoName } from "@/lib/videos";

interface VideoCardProps {
  name: VideoName;
  className?: string;
  /** "hover" plays while pointed at on desktop (always in-view on touch screens) */
  playMode?: "hover" | "view";
  title?: string;
  caption?: string;
  eyebrow?: string;
  showText?: boolean;
  children?: React.ReactNode;
}

/** A film tile with an editorial caption, used in bento grids and galleries. */
export function VideoCard({
  name,
  className,
  playMode = "hover",
  title,
  caption,
  eyebrow,
  showText = true,
  children,
}: VideoCardProps) {
  const clip = videoLibrary[name];
  const [hovered, setHovered] = useState(false);
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  const active = playMode === "view" || !canHover ? undefined : hovered;

  return (
    <figure
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "group relative isolate overflow-hidden rounded-stage bg-[#07152E] text-white shadow-float",
        className
      )}
    >
      <div className="absolute inset-0 transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.04]">
        <AutoVideo name={name} active={active} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#07152E]/90 via-[#07152E]/10 to-transparent" />

      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-[#07152E]/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            active === false ? "bg-white/50" : "bg-[#5B86FF] animate-blink"
          )}
        />
        {eyebrow ?? clip.chapter}
      </div>

      {showText && (
        <figcaption className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
          <span className="block text-lg font-semibold leading-snug tracking-tight sm:text-xl">{title ?? clip.title}</span>
          <span className="mt-2 block max-w-md text-sm leading-relaxed text-white/70 transition-all duration-500 [@media(hover:hover)]:max-h-0 [@media(hover:hover)]:overflow-hidden [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:max-h-24 [@media(hover:hover)]:group-hover:opacity-100">
            {caption ?? clip.caption}
          </span>
        </figcaption>
      )}
      {children}
    </figure>
  );
}
