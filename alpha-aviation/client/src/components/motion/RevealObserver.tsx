import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SELECTOR = "[data-reveal]:not(.is-in), .line-mask:not(.is-in)";

/**
 * One observer for the whole site. Server components opt in to scroll reveals
 * with a `data-reveal` attribute (or the `.line-mask` headline wrapper), so no
 * section needs to become a client component just to animate on scroll.
 */
export function RevealObserver() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reveal = (el: Element) => el.classList.add("is-in");

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(SELECTOR).forEach(reveal);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    const scan = () => document.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    scan();

    // Client-rendered content (filters, accordions) can add new reveal targets later.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
