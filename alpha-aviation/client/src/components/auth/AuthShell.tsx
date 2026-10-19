import React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { VideoName } from "@/lib/videos";

export interface AuthFact {
  label: string;
  value: string;
}

interface AuthShellProps {
  /** Small label above the film-panel headline */
  eyebrow: string;
  /** First line of the film-panel headline */
  title: React.ReactNode;
  /** Optional second line, set in the sky gradient */
  accent?: React.ReactNode;
  description?: React.ReactNode;
  video?: VideoName;
  facts?: AuthFact[];
  /** Widens the form column for longer, multi-column forms */
  wide?: boolean;
  /** Changing this re-runs the headline transition (e.g. the current step of a multi-step form) */
  heroKey?: React.Key;
  /** Extra content pinned to the foot of the film panel, above the contacts (desktop only) */
  panelFooter?: React.ReactNode;
  /** Replaces the default "Back to website" link above the form */
  back?: React.ReactNode;
  children: React.ReactNode;
}

const homeLabel = "Alpha Step Links Aviation School home";

/** Text link with a sliding underline and a leading arrow, used to leave the auth flow. */
export function AuthBackLink({
  to,
  onClick,
  children,
  className,
}: {
  to?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const classes = cn(
    "group/back inline-flex shrink-0 items-center gap-2 rounded text-[13px] font-semibold text-[#1246C8] transition-colors hover:text-[#10264B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1246C8] focus-visible:ring-offset-4 sm:text-sm",
    className
  );
  const content = (
    <>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="transition-transform duration-300 group-hover/back:-translate-x-1"
      >
        <path d="M19 12H5M11 18l-6-6 6-6" />
      </svg>
      <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover/back:bg-[length:100%_1px]">
        {children}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

/**
 * Split-screen frame for sign-in, enrollment and verification screens:
 * a cinematic film panel on the left (desktop) and a calm white form column.
 */
export function AuthShell({
  eyebrow,
  title,
  accent,
  description,
  video = "aviation-campus",
  facts,
  wide = false,
  heroKey,
  panelFooter,
  back,
  children,
}: AuthShellProps) {
  const { uk, nigeria } = siteConfig.offices;

  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      {/* Film panel (desktop) */}
      <aside className="relative isolate hidden overflow-hidden bg-[#07152E] text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[46%] lg:shrink-0 lg:self-start xl:w-1/2">
        <BackgroundVideo name={video} tone="deep" showControl={false} />
        <div aria-hidden="true" className="absolute inset-0 bg-chart-grid mask-fade-b opacity-60" />
        <div aria-hidden="true" className="absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full bg-[#1246C8]/40 blur-[110px]" />

        <div className="relative z-10 flex h-full w-full flex-col px-10 py-10 xl:px-14 xl:py-12">
          <Link
            to="/"
            aria-label={homeLabel}
            className="w-fit rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-[#07152E]"
          >
            <BrandLogo tone="white" className="w-[232px]" decorative />
          </Link>

          <div className="flex min-h-0 flex-1 flex-col justify-center py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroKey ?? "auth-hero"}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="eyebrow text-[#8EAEFF]">{eyebrow}</span>
                <p className="mt-5 max-w-xl text-5xl font-bold leading-[1.02] tracking-tightest">
                  <span className="block">{title}</span>
                  {accent && <span className="block text-gradient-sky">{accent}</span>}
                </p>
                {description && (
                  <p className="mt-6 max-w-md text-base leading-relaxed text-[#DCE8FF]/80 xl:text-lg">{description}</p>
                )}
              </motion.div>
            </AnimatePresence>

            {facts && facts.length > 0 && (
              <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 [@media(max-height:720px)]:hidden">
                {facts.map((fact) => (
                  <div key={fact.label} className="border-l border-white/20 pl-4">
                    <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/55">{fact.label}</dt>
                    <dd className="mt-1 text-lg font-semibold">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {panelFooter && <div className="mb-8 [@media(max-height:760px)]:hidden">{panelFooter}</div>}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/15 pt-6 text-[13px] text-white/60">
            <a href={`tel:${uk.phoneRaw}`} className="transition-colors hover:text-white">
              UK {uk.phone}
            </a>
            <a href={`tel:${nigeria.phoneRaw}`} className="transition-colors hover:text-white">
              Nigeria {nigeria.phone}
            </a>
            <a href={`mailto:${siteConfig.primaryEmail}`} className="transition-colors hover:text-white">
              {siteConfig.primaryEmail}
            </a>
          </div>
        </div>
      </aside>

      {/* Form column */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-clip bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-[#DCE2EB]/80 px-4 py-3 sm:px-6 lg:justify-start lg:border-b-0 lg:px-12 lg:pt-10 xl:px-16">
          <Link
            to="/"
            aria-label={homeLabel}
            className="shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1246C8] lg:hidden"
          >
            <BrandLogo tone="blue" className="w-[156px] sm:w-[184px]" decorative />
          </Link>
          {back ?? <AuthBackLink to="/">Back to website</AuthBackLink>}
        </div>

        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-12 lg:py-16 xl:px-16">
          <div className={cn("w-full", wide ? "max-w-2xl" : "max-w-md")}>{children}</div>
        </main>
      </div>
    </div>
  );
}
