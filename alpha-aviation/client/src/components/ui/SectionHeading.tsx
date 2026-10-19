import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  /** Optional trailing phrase rendered with the brand gradient */
  accent?: string;
  description?: string;
  align?: "left" | "center" | "right";
  isDark?: boolean;
  className?: string;
  as?: "h1" | "h2";
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  isDark = false,
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  const alignClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  return (
    <div className={cn("mb-12 flex max-w-3xl flex-col sm:mb-16", alignClasses[align], className)}>
      {eyebrow && (
        <span data-reveal className={cn("eyebrow mb-5", isDark ? "text-[#8EAEFF]" : "text-[#1246C8]")}>
          {eyebrow}
        </span>
      )}
      <Tag
        data-reveal
        style={{ ["--d" as string]: "80ms" }}
        className={cn(
          "text-[34px] font-bold leading-[1.06] tracking-tightest sm:text-5xl lg:text-[56px]",
          isDark ? "text-white" : "text-[#10264B]"
        )}
      >
        {title}
        {accent && (
          <>
            {" "}
            <span className={isDark ? "text-gradient-sky" : "text-gradient-blue"}>{accent}</span>
          </>
        )}
      </Tag>
      {description && (
        <p
          data-reveal
          style={{ ["--d" as string]: "160ms" }}
          className={cn(
            "mt-5 max-w-2xl text-base leading-[1.7] sm:text-lg",
            isDark ? "text-[#DCE8FF]/75" : "text-[#53647C]"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
