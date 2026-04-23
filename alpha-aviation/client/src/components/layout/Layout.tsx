import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import { Navbar } from "./Navbar";

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
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
