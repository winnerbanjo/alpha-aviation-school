import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../sidebar";
import { TopNav } from "../topnav";

const OutletLoader = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#0061FF] border-t-transparent" />
  </div>
);

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <Sidebar role="admin" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <TopNav role="admin" />
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<OutletLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
