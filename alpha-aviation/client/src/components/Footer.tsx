import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react'

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

          {/* Contact Info Grid */}
          <div>
            <h4 className="text-sm font-semibold tracking-tighter text-white mb-6">
              Contact Information
            </h4>
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#0061FF] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Address</p>
                    <p className="text-sm text-white">
                      7 Chief Tajudeen Odubiyi St, Ilasamaja, Lagos 102214, Lagos
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#0061FF] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Phone No</p>
                    <p className="text-sm text-white">02013306373</p>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#0061FF] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Email</p>
                    <p className="text-sm text-white break-all">info@alphasteplinksaviationschool.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-tighter text-white mb-4">
                Follow Us
              </h4>
              <div className="flex flex-wrap gap-3 mb-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 rounded-lg transition-colors group"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5 text-[#1877F2] group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-gradient-to-br from-[#E4405F]/20 to-[#F77737]/20 hover:from-[#E4405F]/30 hover:to-[#F77737]/30 rounded-lg transition-colors group"
                  title="Instagram"
                >
                  <Instagram className="w-5 h-5 text-[#E4405F] group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 rounded-lg transition-colors group"
                  title="Twitter"
                >
                  <Twitter className="w-5 h-5 text-[#1DA1F2] group-hover:scale-110 transition-transform" />
                </a>
                <a 
                  href="https://tiktok.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2.5 bg-black/30 hover:bg-black/40 rounded-lg transition-colors group"
                  title="TikTok"
                >
                  <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
              <div>
                <a 
                  href="https://wa.me" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 rounded-lg border border-[#25D366]/30 transition-colors group"
                >
                  <svg className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.98 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .96 4.534.96 10.082c0 1.744.413 3.391 1.15 4.835L.08 24l9.305-2.388a11.88 11.88 0 005.385 1.288h.005c5.554 0 10.089-4.534 10.089-10.082 0-2.724-1.062-5.283-2.987-7.207z"/>
                  </svg>
                  <span className="text-sm text-[#25D366] font-medium">Chat us Via WhatsApp</span>
                </a>
              </div>
            </div>
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

// Default export for compatibility
export default Footer
