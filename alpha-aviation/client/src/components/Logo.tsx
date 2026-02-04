
interface LogoProps {
  className?: string
  showText?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stylized Aircraft Wing Icon */}
      <div className="relative bg-transparent">
        <div className={`${sizeClasses[size]} relative bg-transparent`}>
          {/* Flight Path SVG */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`${sizeClasses[size]} text-[#0061FF] bg-transparent`}
            style={{ background: 'transparent' }}
          >
            {/* Aircraft Wing Shape */}
            <path
              d="M12 2L2 8L12 14L22 8L12 2Z"
              fill="currentColor"
              className="opacity-90"
            />
            {/* Flight Path Curve */}
            <path
              d="M2 8Q12 4 22 8"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              className="opacity-60"
            />
          </svg>
        </div>
      </div>
      {showText && (
        <span className={`font-semibold tracking-tight text-slate-900 ${textSizes[size]}`}>
          Alpha Step Links Aviation School
        </span>
      )}
    </div>
  )
}
