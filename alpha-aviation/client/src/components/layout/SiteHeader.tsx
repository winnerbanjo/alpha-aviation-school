import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { siteConfig } from "@/lib/site-config";
import { PrimaryButton } from "@/components/ui/Buttons";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export function SiteHeader() {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastY = useRef(0);
  const { isAuthenticated, logout, user } = useAuthStore();
  const dashboardPath = user?.role === "admin" ? "/admin/dashboard/overview" : "/dashboard";

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 24);
      // Tuck the header away while reading down the page; bring it back on any upward scroll.
      setIsHidden(y > 480 && y > lastY.current + 4);
      if (y < lastY.current - 4 || y <= 480) setIsHidden(false);
      lastY.current = y;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);
  const solid = isScrolled && !mobileMenuOpen;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out-expo",
          isHidden && !mobileMenuOpen ? "-translate-y-full" : "translate-y-0"
        )}
      >
        {announcementOpen && (
          <AnnouncementBar collapsed={isScrolled} onDismiss={() => setAnnouncementOpen(false)} />
        )}

        <div
          className={cn(
            "transition-all duration-500 ease-out-expo",
            solid
              ? "border-b border-[#DCE2EB]/80 bg-white/85 shadow-[0_8px_30px_-12px_rgba(16,38,75,0.18)] backdrop-blur-xl"
              : "border-b border-white/10 bg-gradient-to-b from-[#07152E]/60 to-transparent"
          )}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={cn("flex items-center justify-between gap-6 transition-all duration-500", solid ? "h-[68px]" : "h-20")}>
              <Link
                to="/"
                className="relative flex shrink-0 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1246C8]"
                aria-label="Alpha Step Links Aviation School home"
              >
                <span className="relative block w-[212px] sm:w-[248px]">
                  <BrandLogo tone="white" className={cn("transition-opacity duration-300", solid ? "opacity-0" : "opacity-100")} decorative />
                  <BrandLogo tone="blue" className={cn("absolute inset-0 transition-opacity duration-300", solid ? "opacity-100" : "opacity-0")} />
                </span>
              </Link>

              <nav aria-label="Primary navigation" className="hidden xl:block">
                <ul
                  className={cn(
                    "flex items-center gap-0.5 rounded-full p-1 transition-colors duration-500",
                    solid ? "bg-[#F5F7FB]" : "border border-white/15 bg-white/[0.06] backdrop-blur-md"
                  )}
                >
                  {siteConfig.navigation.map((item) => {
                    const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                    return (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          aria-current={isActive ? "page" : undefined}
                          className={cn(
                            "relative block whitespace-nowrap rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 xl:px-4",
                            solid
                              ? isActive
                                ? "bg-white text-[#1246C8] shadow-subtle"
                                : "text-[#172B49] hover:text-[#1246C8]"
                              : isActive
                                ? "bg-white text-[#10264B]"
                                : "text-white/85 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={logout}
                    className={cn(
                      "hidden rounded-full px-4 py-2 text-[13px] font-medium transition-colors md:inline-flex",
                      solid ? "text-[#172B49] hover:text-[#1246C8]" : "text-white/85 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    Log out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className={cn(
                      "hidden rounded-full px-4 py-2 text-[13px] font-medium transition-colors md:inline-flex",
                      solid ? "text-[#172B49] hover:text-[#1246C8]" : "text-white/85 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    Log in
                  </Link>
                )}
                <PrimaryButton
                  href={isAuthenticated ? dashboardPath : "/enroll"}
                  size="sm"
                  arrow
                  className="hidden pr-3 sm:inline-flex"
                >
                  {isAuthenticated ? "Dashboard" : "Enroll now"}
                </PrimaryButton>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((o) => !o)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-navigation"
                  aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full transition-colors xl:hidden",
                    solid ? "bg-[#10264B] text-white" : "border border-white/25 bg-white/10 text-white backdrop-blur-md"
                  )}
                >
                  <span aria-hidden="true" className="relative block h-3 w-5">
                    <span
                      className={cn(
                        "absolute left-0 h-[2px] w-5 rounded-full bg-current transition-all duration-300",
                        mobileMenuOpen ? "top-[5px] rotate-45" : "top-0"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute left-0 h-[2px] rounded-full bg-current transition-all duration-300",
                        mobileMenuOpen ? "top-[5px] w-5 -rotate-45" : "top-[10px] w-3.5"
                      )}
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <MobileNavigation isOpen={mobileMenuOpen} onClose={closeMenu} />
    </>
  );
}
