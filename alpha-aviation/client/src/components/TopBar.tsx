import { MapPin, Phone, Mail } from 'lucide-react'

export function TopBar() {
  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#0061FF] flex-shrink-0" />
            <span>📍 7 Chief Tajudeen Odubiyi St, Ilasamaja, Lagos 102214, Lagos</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#0061FF] flex-shrink-0" />
              <span>📞 02013306373</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#0061FF] flex-shrink-0" />
              <span>📧 info@alphasteplinksaviationschool.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
