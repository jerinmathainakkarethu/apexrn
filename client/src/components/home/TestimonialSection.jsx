import { useCallback, useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import Eyebrow from "../ui/Eyebrow";
import TestimonialVideoModal from "./TestimonialVideoModal";

const AUTO_SCROLL_GAP = 2000;

export default function TestimonialSection({
  testimonials = [],
  eyebrow = "Student stories",
  title = "What our students say",
  showHeading = true,
}) {
  const trackRef = useRef(null);
  const pageRef = useRef(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const total = testimonials.length;
  const visiblePages = Math.max(1, total - 2);

  const nearestPage = useCallback((track) => {
    const first = track?.children[0];
    if (!track || !first) return 0;
    let page = 0;
    let closest = Infinity;
    for (let index = 0; index < visiblePages; index += 1) {
      const card = track.children[index];
      if (!card) break;
      const distance = Math.abs(
        card.offsetLeft - first.offsetLeft - track.scrollLeft,
      );
      if (distance < closest) {
        closest = distance;
        page = index;
      }
    }
    return page;
  }, [visiblePages]);

  const goTo = useCallback(
    (target) => {
      const track = trackRef.current;
      if (!track) return;
      const next = ((target % visiblePages) + visiblePages) % visiblePages;
      const first = track.children[0];
      const card = track.children[next];
      pageRef.current = next;
      setActive(next);
      if (first && card) {
        track.scrollTo({
          left: card.offsetLeft - first.offsetLeft,
          behavior: "smooth",
        });
      }
    },
    [visiblePages],
  );

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const page = nearestPage(track);
    if (page === pageRef.current) return;
    pageRef.current = page;
    setActive(page);
  }, [nearestPage]);

  useEffect(() => {
    const onVisibilityChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (active > visiblePages - 1) goTo(0);
  }, [active, visiblePages, goTo]);

  useEffect(() => {
    if (visiblePages < 2 || paused || activeVideo || !visible) return undefined;
    const timer = window.setTimeout(
      () => goTo(pageRef.current + 1),
      AUTO_SCROLL_GAP,
    );
    return () => window.clearTimeout(timer);
  }, [active, paused, activeVideo, visible, visiblePages, goTo]);

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
        ref={trackRef}
        onScroll={handleScroll}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="testimonial-track">
          {testimonials.map((item, index) => {
            const name = item.display_name || "APEX RN Prep student";
            return (
              <article
                className="testimonial-card"
                key={item.id || `${name}-${index}`}
              >
                <div className="stars" aria-label="Five stars">
                  ★★★★★
                </div>
                <p>{item.story}</p>
                <div className="testimonial-person">
                  <strong>{name}</strong>
                  <span>{item.country || "APEX RN Prep student story"}</span>
                </div>
                <button
                  type="button"
                  className="testimonial-play"
                  onClick={() => setActiveVideo(item)}
                  aria-label={`Play ${name}'s video testimonial`}
                >
                  <span className="testimonial-play-label">
                    <Play size={12} fill="currentColor" />
                    Watch video
                  </span>
                </button>
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
