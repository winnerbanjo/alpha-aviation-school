import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

const OutletLoader = () => (
  <div className="flex h-full min-h-[60vh] w-full items-center justify-center bg-[#07152E]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5B86FF] border-t-transparent" />
  </div>
);

export default function GeneralLayout() {
  return (
    <div className="flex min-h-screen flex-col font-sans">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <ScrollProgress />
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col focus:outline-none">
        <Suspense fallback={<OutletLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
