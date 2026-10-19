import React from "react";
import { Link } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/Buttons";
import { BackgroundVideo } from "@/components/ui/BackgroundVideo";
import { NoIndexSEO } from "@/components/seo/NoIndexSEO";

const destinations = [
  { code: "HOM", label: "Homepage", href: "/" },
  { code: "PRG", label: "Programs", href: "/courses" },
  { code: "ADM", label: "Contact admissions", href: "/contact" },
];

export function NotFound() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#07152E] px-4 pb-20 pt-36 text-white">
      <NoIndexSEO title="Page not found" description="The page you were looking for has moved or no longer exists." url="/" />
      <BackgroundVideo name="airport-operations-model" tone="deep" showControl={false} className="opacity-60" />

      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#DCE8FF] backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-blink rounded-full bg-amber-400" />
          Flight diverted · 404
        </span>

        <h1 className="mt-8 text-[44px] font-bold leading-[1.02] tracking-tightest sm:text-7xl">
          This gate <span className="text-gradient-sky">doesn&apos;t exist.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
          The page you were looking for has moved or is no longer available. Choose a new destination below.
        </p>

        <ul className="mx-auto mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
          {destinations.map((d) => (
            <li key={d.href}>
              <Link
                to={d.href}
                className="group block rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left backdrop-blur-md transition-colors hover:border-[#5B86FF] hover:bg-[#1246C8]"
              >
                <span className="flap px-2 py-1 text-xs tracking-[0.14em]">{d.code}</span>
                <span className="mt-3 block text-sm font-semibold">{d.label} →</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <PrimaryButton href="/" size="lg" arrow>
            Return to the homepage
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
