import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import Footer from "./Footer";

export function Layout() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar scrolled={scrolled} />
      <main className="flex-1 pt-16 lg:pt-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
