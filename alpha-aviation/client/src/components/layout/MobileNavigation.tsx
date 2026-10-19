import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { siteConfig } from "@/lib/site-config";
import { PrimaryButton } from "@/components/ui/Buttons";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  const { pathname } = useLocation();
  const { isAuthenticated, logout, user } = useAuthStore();
  const dashboardPath = user?.role === "admin" ? "/admin/dashboard/overview" : "/dashboard";

  // Close the menu after navigating
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Lock page scroll and support Escape while the menu is open
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <div
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!isOpen}
      className={cn(
        "fixed inset-0 z-40 overflow-y-auto bg-[#07152E] text-white transition-[clip-path,visibility] duration-700 ease-out-expo xl:hidden",
        isOpen ? "visible [clip-path:circle(150%_at_calc(100%-2.5rem)_2.5rem)]" : "invisible [clip-path:circle(0%_at_calc(100%-2.5rem)_2.5rem)]"
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <img
          src="/videos/instructor-briefing-poster.webp"
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full object-cover opacity-20 transition-transform duration-[2.5s] ease-out-expo",
            isOpen ? "scale-100" : "scale-110"
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07152E] via-[#07152E]/85 to-[#07152E]" />
        <div className="absolute inset-0 bg-chart-grid opacity-60" />
      </div>

      <div className="relative flex min-h-full flex-col px-6 pb-10 pt-32 sm:px-10">
        <p className="eyebrow text-[#8EAEFF]">Navigate</p>
        <ul className="mt-6 space-y-1">
          {siteConfig.navigation.map((item, i) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li
                key={item.href}
                className={cn(
                  "transition-all duration-700 ease-out-expo",
                  isOpen ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                )}
                style={{ transitionDelay: isOpen ? `${150 + i * 60}ms` : "0ms" }}
              >
                <Link
                  to={item.href}
                  tabIndex={isOpen ? 0 : -1}
                  aria-current={isActive ? "page" : undefined}
                  className="group flex items-baseline gap-4 border-b border-white/10 py-3.5"
                >
                  <span className="w-6 text-xs font-medium tabular-nums text-[#8EAEFF]">0{i + 1}</span>
                  <span
                    className={cn(
                      "text-[30px] font-bold leading-tight tracking-tightest transition-colors sm:text-4xl",
                      isActive ? "text-white" : "text-white/70 group-hover:text-white"
                    )}
                  >
                    {item.label}
                  </span>
                  {isActive && <span className="ml-auto h-2 w-2 self-center rounded-full bg-[#5B86FF]" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div
          className={cn(
            "mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60 transition-opacity delay-500 duration-700",
            isOpen ? "opacity-100" : "opacity-0"
          )}
        >
          {siteConfig.secondaryNavigation.map((item) => (
            <Link key={item.href} to={item.href} tabIndex={isOpen ? 0 : -1} className="hover:text-white">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-auto space-y-5 pt-10">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <a href={`tel:${siteConfig.offices.uk.phoneRaw}`} tabIndex={isOpen ? 0 : -1} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/50">United Kingdom</span>
              <span className="mt-1 block font-semibold">{siteConfig.offices.uk.phone}</span>
            </a>
            <a href={`tel:${siteConfig.offices.nigeria.phoneRaw}`} tabIndex={isOpen ? 0 : -1} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/50">Nigeria</span>
              <span className="mt-1 block font-semibold">{siteConfig.offices.nigeria.phone}</span>
            </a>
          </div>
          <PrimaryButton
            href={isAuthenticated ? dashboardPath : "/enroll"}
            size="lg"
            arrow
            className="w-full justify-between"
            tabIndex={isOpen ? 0 : -1}
          >
            {isAuthenticated ? "Go to your dashboard" : "Enroll now"}
          </PrimaryButton>
          {isAuthenticated ? (
            <PrimaryButton
              size="lg"
              variant="glass"
              className="w-full"
              tabIndex={isOpen ? 0 : -1}
              onClick={() => {
                logout();
                onClose();
              }}
            >
              Log out
            </PrimaryButton>
          ) : (
            <PrimaryButton href="/login" size="lg" variant="glass" className="w-full" tabIndex={isOpen ? 0 : -1}>
              Student login
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}
