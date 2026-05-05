import { Outlet } from "react-router-dom";
import { Sidebar } from "../sidebar";
import { TopNav } from "../topnav";

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <Sidebar role="student" />
      <div className="flex-1 lg:ml-64 flex flex-col">
        <TopNav role="student" />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
