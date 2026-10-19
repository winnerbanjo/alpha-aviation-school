import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: "primary" | "secondary" | "outline" | "white" | "glass";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
  /** Adds the animated arrow chip used on primary calls to action */
  arrow?: boolean;
}

function ArrowChip({ variant }: { variant: NonNullable<ButtonProps["variant"]> }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative ml-3 -mr-2 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-300",
        variant === "primary" && "bg-white/15 group-hover/btn:bg-white group-hover/btn:text-[#1246C8]",
        variant === "secondary" && "bg-white/10 group-hover/btn:bg-white group-hover/btn:text-[#10264B]",
        variant === "white" && "bg-[#1246C8] text-white",
        variant === "glass" && "bg-white text-[#10264B]",
        variant === "outline" && "bg-[#1246C8] text-white"
      )}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-[150%]">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="absolute -translate-x-[150%] transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-0">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  );
}

export function PrimaryButton({
  href,
  variant = "primary",
  size = "default",
  className,
  children,
  icon,
  arrow = false,
  ...props
}: ButtonProps) {
  const baseClasses =
    "group/btn relative inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-tight transition-all duration-300 ease-out-expo select-none focus-visible:outline focus-visible:outline-3 focus-visible:outline-[#1246C8] focus-visible:outline-offset-4 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const sizeClasses = {
    sm: "min-h-[40px] px-4 py-2 text-[13px]",
    default: "min-h-[48px] px-6 py-3 text-sm",
    lg: "min-h-[56px] px-7 py-3.5 text-[15px]",
  };

  const variantClasses = {
    primary: "bg-[#1246C8] text-white shadow-glow hover:bg-[#0F3BAA] hover:shadow-glow-lg",
    secondary: "bg-[#10264B] text-white hover:bg-[#07152E] shadow-subtle",
    outline: "border border-[#10264B]/15 text-[#10264B] bg-white hover:border-[#1246C8] hover:text-[#1246C8]",
    white: "bg-white text-[#10264B] hover:bg-[#DCE8FF] shadow-subtle",
    glass: "border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
  };

  const combinedClasses = cn(baseClasses, sizeClasses[size], variantClasses[variant], className);

  const content = (
    <>
      <span>{children}</span>
      {icon && <span className="ml-2.5">{icon}</span>}
      {arrow && <ArrowChip variant={variant} />}
    </>
  );

  if (href) {
    const linkProps = {
      className: combinedClasses,
      tabIndex: props.tabIndex,
      onClick: props.onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>,
      "aria-label": props["aria-label"],
    };
    if (isExternalHref(href)) {
      return (
        <a href={href} {...linkProps}>
          {content}
        </a>
      );
    }
    return (
      <Link to={href} {...linkProps}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {content}
    </button>
  );
}

export function SecondaryButton({
  href,
  size = "default",
  className,
  children,
  icon,
  variant = "outline",
  ...props
}: ButtonProps) {
  return (
    <PrimaryButton href={href} variant={variant} size={size} className={className} icon={icon} {...props}>
      {children}
    </PrimaryButton>
  );
}

/** Understated text link with a sliding underline and arrow. */
export function ArrowLink({
  href,
  children,
  className,
  tone = "dark",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  const classes = cn(
    "group/link inline-flex items-center gap-2 text-sm font-semibold transition-colors",
    tone === "dark" ? "text-[#1246C8] hover:text-[#10264B]" : "text-[#DCE8FF] hover:text-white",
    className
  );
  const content = (
    <>
      <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover/link:bg-[length:100%_1px]">
        {children}
      </span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="transition-transform duration-300 group-hover/link:translate-x-1">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </>
  );

  if (isExternalHref(href)) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <Link to={href} className={classes}>
      {content}
    </Link>
  );
}

/** mailto:, tel:, in-page anchors and absolute URLs are plain anchors rather than router links. */
function isExternalHref(href: string) {
  return /^(https?:|mailto:|tel:|#)/.test(href);
}
