import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  isDark?: boolean;
}

export function Breadcrumbs({ items, className, isDark = false }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-[11px] font-medium tracking-[0.14em] select-none", className)}
    >
      <ol className="flex items-center flex-wrap gap-2">
        <li>
          <Link
            to="/"
            className={cn(
              "hover:text-[#5B86FF] transition-colors",
              isDark ? "text-[#DCE8FF]/70" : "text-[#53647C]"
            )}
          >
            HOME
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <li
                aria-hidden="true"
                className={cn("opacity-40", isDark ? "text-[#DCE8FF]" : "text-[#53647C]")}
              >
                /
              </li>
              <li>
                {isLast || !item.href ? (
                  <span
                    aria-current="page"
                    className={cn(
                      "font-semibold",
                      isDark ? "text-white" : "text-[#10264B]"
                    )}
                  >
                    {item.label.toUpperCase()}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className={cn(
                      "hover:text-[#5B86FF] transition-colors",
                      isDark ? "text-[#DCE8FF]/80" : "text-[#53647C]"
                    )}
                  >
                    {item.label.toUpperCase()}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
