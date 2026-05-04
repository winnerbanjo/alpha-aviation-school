import { Outlet } from "react-router-dom";
import { Navbar } from "./navbar";
import Footer from "./footer";

export default function GeneralLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
