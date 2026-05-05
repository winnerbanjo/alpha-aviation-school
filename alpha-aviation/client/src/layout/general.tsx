import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import Footer from "./footer";

const OutletLoader = () => (
  <div className="flex items-center justify-center h-full w-full min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0061FF] border-t-transparent" />
  </div>
);

export default function GeneralLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Suspense fallback={<OutletLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
