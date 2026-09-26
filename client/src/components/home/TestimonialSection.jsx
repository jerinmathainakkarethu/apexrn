import { useEffect, useRef, useState } from "react";
import Eyebrow from "../ui/Eyebrow";

export default function TestimonialSection({ testimonials }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const visiblePages = Math.max(1, testimonials.length - 2);
  useEffect(() => {
    if (testimonials.length < 2) return undefined;
    const timer = window.setInterval(() => {
      const next = (active + 1) % visiblePages;
      setActive(next);
      trackRef.current?.scrollTo({
        left: next * (trackRef.current.clientWidth / 3),
        behavior: "smooth",
      });
    }, 4200);
    return () => window.clearInterval(timer);
  }, [active, testimonials.length, visiblePages]);
  if (!testimonials.length) return null;
  const move = (direction) => {
    const next = (active + direction + visiblePages) % visiblePages;
    setActive(next);
    trackRef.current?.scrollTo({
      left: next * (trackRef.current.clientWidth / 3),
      behavior: "smooth",
    });
  };
  return (
    <section className="testimonials" id="testimonials">
      <div className="testimonials-heading">
        <Eyebrow>Student stories</Eyebrow>
        <h2>What our students say</h2>
      </div>
      <div className="testimonial-viewport" ref={trackRef}>
        <div className="testimonial-track">
          {testimonials.map((item, index) => (
            <article
              className="testimonial-card"
              key={item.id || `${item.display_name}-${index}`}
            >
              <div className="stars" aria-label="Five stars">
                ★★★★★
              </div>
              <p>{item.story}</p>
              <div className="testimonial-person">
                <strong>{item.display_name}</strong>
                <span>{item.country || "APEX RN Prep student story"}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="testimonial-dots" aria-label="Testimonial pages">
        {Array.from({ length: visiblePages }, (_, index) => (
          <button
            className={active === index ? "active" : ""}
            key={index}
            onClick={() => {
              setActive(index);
              trackRef.current?.scrollTo({
                left: index * (trackRef.current.clientWidth / 3),
                behavior: "smooth",
              });
            }}
            aria-label={`Go to testimonial page ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}