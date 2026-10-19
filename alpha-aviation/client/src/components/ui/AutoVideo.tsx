import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { posterSrc, videoSrc, type VideoName } from "@/lib/videos";

interface AutoVideoProps {
  name: VideoName;
  className?: string;
  /** When provided, the clip only plays while `active` is true (e.g. on hover). */
  active?: boolean;
  loop?: boolean;
  /** Begin loading as soon as the clip nears the viewport, rather than only when playback starts. */
  eager?: boolean;
  /** Restart from the first frame whenever the clip becomes active. */
  restartOnActive?: boolean;
  onEnded?: () => void;
  onPlayingChange?: (playing: boolean) => void;
  onProgress?: (fraction: number) => void;
}

/**
 * Silent, decorative film clip. The source is attached lazily, playback pauses
 * whenever the clip is off-screen or the tab is hidden, and visitors who
 * prefer reduced motion only ever see the poster frame.
 */
export function AutoVideo({
  name,
  className,
  active,
  loop = true,
  eager = false,
  restartOnActive = false,
  onEnded,
  onPlayingChange,
  onProgress,
}: AutoVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const wasActive = useRef(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(motion.matches);
    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const shouldPlay = !reducedMotion && inView && (active ?? true);

    const attach = () => {
      if (!video.getAttribute("src")) video.src = videoSrc(name);
    };

    if (eager && inView && !reducedMotion) attach();

    const play = () => {
      if (document.hidden) return;
      attach();
      if (restartOnActive && !wasActive.current) {
        try {
          video.currentTime = 0;
        } catch {
          /* metadata not loaded yet */
        }
      }
      void video.play().catch(() => onPlayingChange?.(false));
    };

    if (shouldPlay) play();
    else video.pause();
    wasActive.current = shouldPlay;

    const onVisibility = () => (document.hidden ? video.pause() : shouldPlay && play());
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, inView, reducedMotion, name, eager]);

  // Swapping clips on the same element (showreel) needs a fresh source.
  useEffect(() => {
    const video = ref.current;
    if (!video || !video.getAttribute("src")) return;
    if (video.getAttribute("src") !== videoSrc(name)) {
      video.src = videoSrc(name);
      if (!reducedMotion && inView && (active ?? true)) void video.play().catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return (
    <video
      ref={ref}
      poster={posterSrc(name)}
      muted
      playsInline
      loop={loop}
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
      onPlay={() => onPlayingChange?.(true)}
      onPause={() => onPlayingChange?.(false)}
      onEnded={onEnded}
      onTimeUpdate={
        onProgress
          ? (e) => {
              const v = e.currentTarget;
              if (v.duration) onProgress(v.currentTime / v.duration);
            }
          : undefined
      }
      className={cn("h-full w-full object-cover", className)}
    />
  );
}
