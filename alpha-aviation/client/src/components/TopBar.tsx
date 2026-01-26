export function TopBar() {
  try {
    return (
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4 text-xs text-slate-300">
            <span>📍 7 Chief Tajudeen Odubiyi St, Ilasamaja, Lagos</span>
            <span className="hidden sm:inline">|</span>
            <span>📞 02013306373</span>
            <span className="hidden sm:inline">|</span>
            <span>📧 info@alphasteplinksaviationschool.com</span>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('TopBar error:', error)
    return (
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span>📍 7 Chief Tajudeen Odubiyi St, Ilasamaja, Lagos</span>
            <span>|</span>
            <span>📞 02013306373</span>
            <span>|</span>
            <span>📧 info@alphasteplinksaviationschool.com</span>
          </div>
        </div>
      </div>
    )
  }
}
