import { Bell, Search } from 'lucide-react'

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tighter text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
