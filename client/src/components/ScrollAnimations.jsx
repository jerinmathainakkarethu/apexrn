import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollAnimations() {
  const location = useLocation();
  useEffect(() => {
    const revealTargets =
      "main > section:not(.page-hero), main > .content-page-grid, main > .faq-page-list, main > .contact-page-form, main article";
    const observed = new WeakSet();
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const observer =
      "IntersectionObserver" in window && !reduceMotion
        ? new IntersectionObserver(
            (entries) =>
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }),
            { threshold: 0, rootMargin: "0px 0px -45px 0px" },
          )
        : null;
    const reveal = () => {
      const targets = document.querySelectorAll(revealTargets);
      targets.forEach((element, index) => {
        element.classList.add("scroll-reveal");
        element.style.setProperty(
          "--reveal-delay",
          `${Math.min(index % 6, 5) * 70}ms`,
        );
        if (!observer) {
          element.classList.add("is-visible");
          return;
        }
        if (observed.has(element)) return;
        observed.add(element);
        observer.observe(element);
      });
    };
    const mutationObserver = new MutationObserver(reveal);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    reveal();
    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [location.pathname]);
  return null;
}