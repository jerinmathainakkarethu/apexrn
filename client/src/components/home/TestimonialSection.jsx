import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Quote } from "lucide-react";
import Eyebrow from "../ui/Eyebrow";
import TestimonialVideoModal from "./TestimonialVideoModal";

const AUTO_SCROLL_GAP = 2000;

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function TestimonialSection({
  testimonials = [],
  eyebrow = "Student stories",
  title = "What our students say",
  showHeading = true,
}) {
  // viewportRef = the scrollable outer element (has onScroll / scrollTo).
  // trackRef = the inner flex row that actually holds the card elements.
  // These used to be the same ref, which meant track.children[n] was
  // reading children of the *viewport* (which only has one child: the
  // track wrapper itself) instead of the individual testimonial cards —
  // so scrollTo silently no-op'd for every page past 0 while the active
  // page state kept advancing, moving the dots without moving the cards.
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const pageRef = useRef(0);
  const touchStartX = useRef(null);
  const suppressClick = useRef(false);
  const resumeTimer = useRef(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [touchLayout, setTouchLayout] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1024px)").matches,
  );
  const [activeVideo, setActiveVideo] = useState(null);
  const total = testimonials.length;
  const visiblePages = touchLayout ? Math.max(1, total) : Math.max(1, total - 2);

  const nearestPage = useCallback(
    (viewport, track) => {
      const first = track?.children[0];
      if (!viewport || !track || !first) return 0;
      let page = 0;
      let closest = Infinity;
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      for (let index = 0; index < visiblePages; index += 1) {
        const card = track.children[index];
        if (!card) break;
        const cardRect = card.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        const targetScroll = Math.min(
          maxScroll,
          Math.max(
            0,
            touchLayout
              ? viewport.scrollLeft +
                (cardRect.left + cardRect.width / 2) -
                (viewportRect.left + viewportRect.width / 2)
              : card.offsetLeft - first.offsetLeft,
          ),
        );
        const distance = Math.abs(
          targetScroll - viewport.scrollLeft,
        );
        if (distance <= closest) {
          closest = distance;
          page = index;
        }
      }
      return page;
    },
    [touchLayout, visiblePages],
  );

  const goTo = useCallback(
    (target) => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;
      const next = ((target % visiblePages) + visiblePages) % visiblePages;
      const first = track.children[0];
      const card = track.children[next];
      if (!first || !card) return;
      pageRef.current = next;
      setActive(next);
      const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
      const cardRect = card.getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      viewport.scrollTo({
        left: Math.min(
          maxScroll,
          Math.max(
            0,
            touchLayout
              ? viewport.scrollLeft +
                (cardRect.left + cardRect.width / 2) -
                (viewportRect.left + viewportRect.width / 2)
              : card.offsetLeft - first.offsetLeft,
          ),
        ),
        behavior: touchLayout ? "auto" : "smooth",
      });
    },
    [touchLayout, visiblePages],
  );

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const page = nearestPage(viewport, track);
    if (page === pageRef.current) return;
    pageRef.current = page;
    setActive(page);
  }, [nearestPage]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    setPaused(true);
    window.clearTimeout(resumeTimer.current);
  };

  const handleTouchEnd = (event) => {
    const endX = event.changedTouches[0]?.clientX;
    if (
      touchStartX.current !== null &&
      endX !== undefined &&
      Math.abs(endX - touchStartX.current) > 10
    ) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 500);
    }

    touchStartX.current = null;
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 1800);
  };

  useEffect(() => {
    const onVisibilityChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const onChange = (event) => setTouchLayout(event.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(resumeTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (active > visiblePages - 1) goTo(0);
  }, [active, visiblePages, goTo]);

  // Single interval that just checks conditions each tick, rather than a
  // recursive setTimeout chain — simpler and doesn't silently stall.
  useEffect(() => {
    if (visiblePages < 2) return undefined;
    const interval = window.setInterval(() => {
      if (paused || activeVideo || !visible) return;
      goTo(pageRef.current + 1);
    }, AUTO_SCROLL_GAP);
    return () => window.clearInterval(interval);
  }, [visiblePages, paused, activeVideo, visible, goTo]);

  if (!total) return null;

  return (
    <section className="testimonials" id="testimonials">
      {showHeading && (
        <div className="testimonials-heading">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2>{title}</h2>
        </div>
      )}
      <div
        className="testimonial-viewport"
        ref={viewportRef}
        onScroll={handleScroll}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div className="testimonial-track" ref={trackRef}>
          {testimonials.map((item, index) => {
            const name = item.display_name || "APEX RN Prep student";
            const hasVideo = Boolean(item.video_url);
            const open = () => setActiveVideo(item);
            return (
              <article
                className="testimonial-card"
                key={item.id || `${name}-${index}`}
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  if (suppressClick.current) {
                    event.preventDefault();
                    event.stopPropagation();
                    suppressClick.current = false;
                    return;
                  }
                  open();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    open();
                  }
                }}
                aria-label={`View ${name}'s story`}
              >
                <Quote className="testimonial-quote-mark" size={30} />
                <div className="stars" aria-label="Five stars">
                  ★★★★★
                </div>
                <p>{item.story}</p>
                <div className="testimonial-person">
                  <span className="testimonial-avatar" aria-hidden="true">
                    {initials(name) || "AR"}
                  </span>
                  <div>
                    <strong>{name}</strong>
                    <span>{item.country || "APEX RN Prep student story"}</span>
                  </div>
                </div>
                {/* {hasVideo && (
                  <span className="testimonial-play" aria-hidden="true">
                    <span className="testimonial-play-icon">
                      <Play size={14} fill="currentColor" />
                    </span>
                    <span className="testimonial-play-label">Watch story</span>
                  </span>
                )} */}
              </article>
            );
          })}
        </div>
      </div>

      <div className="testimonial-dots" aria-label="Testimonial pages">
        {Array.from({ length: visiblePages }, (_, index) => (
          <button
            className={active === index ? "active" : ""}
            key={index}
            onClick={() => goTo(index)}
            aria-label={`Go to testimonial page ${index + 1}`}
          />
        ))}
      </div>

      {activeVideo && (
        <TestimonialVideoModal
          testimonial={activeVideo}
          close={() => setActiveVideo(null)}
        />
      )}
    </section>
  );
}
