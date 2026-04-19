import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isDashboardRoute = location?.pathname?.includes("/dashboard") || false;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Single Clean Top Bar */}
      <div className="bg-slate-900 border-b hidden border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4 text-xs text-slate-300">
            <span>📍 7 Chief Tajudeen Odubiyi St, Ilasamaja, Lagos 102214</span>
            <span className="hidden sm:inline">|</span>
            <span>📞 0814 025 7174</span>
            <span className="hidden sm:inline">|</span>
            <span>📧 info@alphasteplinksaviationschool.com</span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <Navbar scrolled={scrolled} />

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer - Only on non-dashboard routes */}
      {!isDashboardRoute && <Footer />}
    </div>
  );
}
