interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "color" | "white";
}

export function Logo({
  className = "",
  showText = true,
  size = "md",
  variant = "color",
}: LogoProps) {
  const imageSizes = {
    sm: "w-16 h-10",
    md: "w-20 h-12",
    lg: "w-24 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative bg-transparent">
        <div
          className={`${imageSizes[size]} relative overflow-hidden bg-transparent`}
        >
          <img
            src={variant === "white" ? "/logo-white.svg" : "/logo.svg"}
            alt="Alpha Aviation School Logo"
            className="absolute left-0 top-0 h-auto w-full"
          />
        </div>
      </div>
      {showText && (
        <span
          className={`font-semibold hidden lg:flex tracking-tight text-brand-navy ${textSizes[size]}`}
        >
          Alpha Step Links Aviation School
        </span>
      )}
    </div>
  );
}
