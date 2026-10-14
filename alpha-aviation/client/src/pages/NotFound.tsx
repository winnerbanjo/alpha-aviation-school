import { Link } from "react-router-dom";
import { Home, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-2 text-[#1239B8] mb-4">
          <Search className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-widest">404</span>
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          The page you are looking for doesn&apos;t exist or has moved. You can
          return to the homepage.
        </p>
        <Link to="/">
          <button className="inline-flex items-center justify-center gap-2 bg-[#1239B8] hover:bg-[#071A4A] text-white px-6 py-3 rounded-full font-medium transition-all">
            <Home className="w-4 h-4" />
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
