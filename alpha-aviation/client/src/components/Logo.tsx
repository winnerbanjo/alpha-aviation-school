interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({
  className = "",
  showText = true,
  size = "md",
}: LogoProps) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Stylized Aircraft Wing Icon */}
      <div className="relative bg-transparent">
        <div
          className={`w-16 h-16 relative bg-transparent flex items-center justify-center`}
        >
          <img
            src="/asl-logo.png"
            alt="Alpha Aviation School Logo"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
      {showText && (
        <span
          className={`font-semibold tracking-tight text-slate-900 ${textSizes[size]}`}
        >
          Alpha Step Links Aviation School
        </span>
      )}
    </div>
  );
}
