import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

interface NavbarProps {
  scrolled?: boolean;
}

export function Navbar({ scrolled = false }: NavbarProps) {
  const { isAuthenticated, logout, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dashboardPath =
    user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <>
      {/* Desktop Floating Pill Navbar */}
      <div className="fixed top-6 left-0 right-0 z-50 hidden lg:flex justify-center px-4 w-full pointer-events-none transition-all duration-300">
        <nav className="pointer-events-auto bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 rounded-full px-2 py-2 flex items-center justify-between w-full max-w-5xl">
          <Link to="/" className="flex items-center pl-4">
            <Logo size="sm" showText={true} />
          </Link>

          <div className="hidden lg:flex items-center gap-8 px-8">
            <Link
              to="/about"
              className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/courses"
              className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Programs
            </Link>
            <Link
              to="/contact"
              className="text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-2 pr-2">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath}>
                  <Button
                    variant="ghost"
                    className="rounded-full text-[13px] font-medium hover:bg-slate-100 h-9 px-5"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={logout}
                  className="rounded-full text-[13px] font-medium bg-slate-900 hover:bg-black text-white h-9 px-6 transition-all"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button
                    variant="ghost"
                    className="rounded-full text-[13px] font-medium hover:bg-slate-100 h-9 px-5"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/enroll">
                  <Button className="rounded-full bg-slate-900 hover:bg-black text-white text-[13px] font-medium h-9 px-6 shadow-sm transition-all">
                    Enroll Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-900 p-2 mr-2 hover:bg-slate-100 rounded-full lg:hidden transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Fixed Top Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden bg-white border-b border-slate-100">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/" className="flex items-center">
            <Logo size="sm" showText={true} />
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-900 p-2 lg:hidden hover:bg-slate-100 rounded-full transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar - Slide in from right, fixed, covering outlet */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full pt-20 pb-8 px-6">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-800 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-800 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              About Us
            </Link>
            <Link
              to="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-800 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Programs
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-800 py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200 py-6 text-base font-medium shadow-none">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full rounded-full bg-slate-900 text-white hover:bg-black py-6 text-base font-medium shadow-none"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-full bg-slate-100 text-slate-900 hover:bg-slate-200 py-6 text-base font-medium shadow-none">
                    Login
                  </Button>
                </Link>
                <Link to="/enroll" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-full bg-slate-900 hover:bg-black text-white py-6 text-base font-medium">
                    Enroll Now
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Backdrop overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
