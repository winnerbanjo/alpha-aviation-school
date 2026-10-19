import React from "react";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/Breadcrumbs";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import type { VideoName } from "@/lib/videos";

interface PageHeroProps {
  breadcrumbs: BreadcrumbItem[];
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  video?: VideoName;
  image?: { src: string; alt?: string };
  facts?: { label: string; value: string }[];
  children?: React.ReactNode;
  aside?: React.ReactNode;
  size?: "default" | "compact";
}

/** Shared cinematic hero for inner pages: film or photograph, breadcrumb, headline and a facts rail. */
export function PageHero({
  breadcrumbs,
  eyebrow,
  title,
  accent,
  description,
  video,
  image,
  facts,
  children,
  aside,
  size = "default",
}: PageHeroProps) {
  const hasMedia = Boolean(video || image);

  return (
    <section className="relative isolate overflow-hidden bg-[#07152E] text-white">
      {video && <BackgroundVideo name={video} tone="medium" controlClassName="bottom-5" />}
      {image && (
        <div aria-hidden="true" className="absolute inset-0">
          <img src={image.src} alt="" className="absolute inset-0 h-full w-full object-cover object-[70%_center]" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07152E] via-[#07152E]/75 to-[#10264B]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07152E] via-transparent to-[#07152E]/55" />
        </div>
      )}
      {!hasMedia && (
        <div aria-hidden="true" className="absolute inset-0">
          <div className="absolute inset-0 bg-chart-grid mask-fade-b" />
          <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#1246C8]/40 blur-[120px]" />
          <div className="absolute -bottom-40 left-1/4 h-[380px] w-[380px] rounded-full bg-[#5B86FF]/15 blur-[100px]" />
        </div>
      )}

      <Container
        className={cn(
          "relative z-10 pt-36 sm:pt-40",
          size === "compact" ? "pb-16 sm:pb-20" : hasMedia ? "pb-24 sm:pb-32 lg:min-h-[640px]" : "pb-20 sm:pb-24"
        )}
      >
        <div className={cn("grid items-end gap-10", aside && "lg:grid-cols-12")}>
          <div className={cn(aside ? "lg:col-span-7" : "max-w-4xl")}>
            <div data-reveal="fade">
              <Breadcrumbs items={breadcrumbs} isDark />
            </div>
            <span data-reveal className="eyebrow mt-6 text-[#8EAEFF]" style={{ ["--d" as string]: "60ms" }}>
              {eyebrow}
            </span>
            <h1 className="mt-5 text-[40px] font-bold leading-[1.02] tracking-tightest sm:text-6xl lg:text-[76px]">
              <span className="line-mask">
                <span style={{ ["--d" as string]: "120ms" }}>{title}</span>
              </span>
              {accent && (
                <span className="line-mask">
                  <span className="text-gradient-sky" style={{ ["--d" as string]: "220ms" }}>
                    {accent}
                  </span>
                </span>
              )}
            </h1>
            {description && (
              <p
                data-reveal
                style={{ ["--d" as string]: "320ms" }}
                className="mt-6 max-w-2xl text-base leading-relaxed text-[#DCE8FF]/80 sm:text-lg"
              >
                {description}
              </p>
            )}
            {children && (
              <div data-reveal style={{ ["--d" as string]: "420ms" }} className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {children}
              </div>
            )}
          </div>
          {aside && (
            <div data-reveal="right" style={{ ["--d" as string]: "300ms" }} className="lg:col-span-5">
              {aside}
            </div>
          )}
        </div>

        {facts && facts.length > 0 && (
          <dl
            data-reveal
            style={{ ["--d" as string]: "500ms" }}
            className="mt-14 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-6 border-t border-white/15 pt-6 sm:grid-cols-4"
          >
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">{fact.label}</dt>
                <dd className="mt-1.5 text-sm font-semibold text-white sm:text-base">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Container>
    </section>
  );
}
