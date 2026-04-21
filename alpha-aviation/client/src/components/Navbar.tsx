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

  // Determine dashboard path based on user role
  const dashboardPath =
    user?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <>
      {/* Desktop Floating Pill Navbar */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 w-full pointer-events-none transition-all duration-300">
        <nav className="pointer-events-auto bg-white/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 rounded-full px-2 py-2 flex items-center justify-between w-full max-w-5xl">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center pl-4">
            <Logo size="sm" showText={true} />
          </Link>

          {/* Center: Navigation Links */}
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

          {/* Right: Auth / CTA Buttons */}
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

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-slate-900 p-2 mr-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu Dropdown (Solid Base) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 top-0 pt-24 px-4 bg-slate-50/95 backdrop-blur-xl">
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 flex flex-col space-y-4">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-800 py-2"
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-800 py-2"
            >
              About Us
            </Link>
            <Link
              to="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-800 py-2"
            >
              Programs
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-800 py-2"
            >
              Contact
            </Link>

            <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
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
      )}
    </>
  );
}
