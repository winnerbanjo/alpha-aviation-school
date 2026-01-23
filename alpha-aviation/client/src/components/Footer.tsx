import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-xl font-semibold tracking-tighter text-white mb-4">
              Alpha Step Links Aviation School
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              World-class aviation training designed to launch your career in the skies. 
              Excellence, precision, and global standards.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-tighter text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-slate-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Training Courses
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-slate-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold tracking-tighter text-white mb-4">
              Contact Information
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-400">
                  7 Chief Tajudeen Odubiyi St<br />
                  Lagos, Nigeria
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">+234 XXX XXX XXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-sm text-slate-400">info@alphasteplinks.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Alpha Step Links Aviation School. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">
              Designed with excellence for the next generation of aviation professionals.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
