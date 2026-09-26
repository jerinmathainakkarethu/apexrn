import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollAnimations() {
  const location = useLocation();
  useEffect(() => {
    const revealTargets =
      "main > section, main > .content-page-grid, main > .faq-page-list, main > .contact-page-form, main article";
    const reveal = () => {
      const targets = document.querySelectorAll(revealTargets);
      targets.forEach((element, index) => {
        if (element.dataset.revealReady) return;
        element.dataset.revealReady = "true";
        element.classList.add("scroll-reveal");
        element.style.setProperty(
          "--reveal-delay",
          `${Math.min(index % 6, 5) * 70}ms`,
        );
        observer.observe(element);
      });
    };
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -45px" },
    );
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