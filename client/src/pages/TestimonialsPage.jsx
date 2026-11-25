import "../styles/testimonials.css"; // must stay last
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  EyeOff,
  Mail,
  MessageCircle,
  Quote,
} from "lucide-react";
import PageFrame from "../components/layout/PageFrame";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";
import pageSettings from "../data/testimonials-page-settings.json";
import testimonials from "../data/testimonials.json";

function ScrollableRow({ className, label, children }) {
  const rowRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    canScroll: false,
    canScrollBack: false,
    canScrollForward: false,
  });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;

    const updateScrollState = () => {
      const maxScroll = row.scrollWidth - row.clientWidth;
      setScrollState({
        canScroll: maxScroll > 1,
        canScrollBack: row.scrollLeft > 1,
        canScrollForward: row.scrollLeft < maxScroll - 1,
      });
    };

    updateScrollState();
    row.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(row);

    return () => {
      row.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, []);

  const scroll = (direction) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({
      left: direction * row.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <div className="tm-scroll-row">
      <div
        className={`tm-scroll-controls${scrollState.canScroll ? " is-scrollable" : ""}`}
        role="group"
        aria-label={`${label} controls`}
      >
        <button
          type="button"
          className="tm-scroll-button"
          aria-label={`Scroll ${label} left`}
          disabled={!scrollState.canScrollBack}
          onClick={() => scroll(-1)}
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="tm-scroll-button"
          aria-label={`Scroll ${label} right`}
          disabled={!scrollState.canScrollForward}
          onClick={() => scroll(1)}
        >
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div className={`tm-scroll-row-track ${className}`} ref={rowRef}>
        {children}
      </div>
    </div>
  );
}

function isEmbeddableVideoUrl(url = "") {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}

function toEmbedUrl(url = "") {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtube.com/embed/")) return url;
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split(/[?&]/)[0];
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return url;
  }
  return url;
}

function ScreenshotCard({ shot }) {
  const kind = shot.kind || "message";
  const isEmail = kind.toLowerCase() === "email";
  const Icon = isEmail ? Mail : MessageCircle;

  if (!shot.image && !shot.caption && !shot.kindLabel) return null;

  return (
    <figure className="tm-shot">
      {shot.image && (
        <div className={`tm-shot-frame tm-shot-frame-${kind}`}>
          <img
            className="tm-shot-image"
            src={shot.image}
            alt={shot.alt || shot.kindLabel || kind}
            loading="lazy"
          />
        </div>
      )}
      <figcaption>
        {(shot.kindLabel || kind) && (
          <span className="tm-shot-kind">
            <Icon size={13} aria-hidden="true" />
            {shot.kindLabel || kind}
          </span>
        )}
        {shot.caption}
      </figcaption>
    </figure>
  );
}

export default function TestimonialsPage() {
  const content = pageSettings;
  const isVisible = (key) => content.sectionVisibility?.[key] !== false;
  const beforeAfter = Array.isArray(content.beforeAfter)
    ? content.beforeAfter
    : [];
  const screenshots = Array.isArray(content.screenshots)
    ? content.screenshots
    : [];
  const stories = testimonials.filter(
    (item) => item.status === "published" && (item.story || item.result),
  );

  return (
    <PageFrame showHero={false}>
      <div className="tm">
        {isVisible("stories") && stories.length > 0 && (
          <section
            className="tm-block section-tone-blush"
            aria-label={content.storiesSection?.title || "Student stories"}
          >
            <SectionTitle
              eyebrow={content.storiesSection?.eyebrow || "Student stories"}
              copy={
                content.storiesSection?.copy ||
                "Hear how students built confidence and prepared for the NCLEX-RN with APEX RN Prep."
              }
            >
              {content.storiesSection?.title || "Stories of progress and success"}
            </SectionTitle>

            <ScrollableRow className="tm-story-grid" label="student stories">
              {stories.map((item) => {
                const initials = item.display_name
                  .split(/\s+/)
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("");

                return (
                  <article className="tm-story" key={item.id}>
                    <Quote
                      className="tm-story-quote"
                      size={28}
                      aria-hidden="true"
                    />
                    <header className="tm-story-head">
                      <span className="tm-story-initials" aria-hidden="true">
                        {initials}
                      </span>
                      <div>
                        <div className="tm-story-label">
                          <BadgeCheck size={15} aria-hidden="true" />
                          {item.display_name}
                        </div>
                        {item.country && (
                          <span className="tm-story-attempt">{item.country}</span>
                        )}
                      </div>
                    </header>
                    <dl className="tm-steps">
                      {item.story && (
                        <div className="tm-step">
                          <dt>Student experience</dt>
                          <dd>{item.story}</dd>
                        </div>
                      )}
                      {item.result && (
                        <div className="tm-step tm-step-result">
                          <dt>Result</dt>
                          <dd>{item.result}</dd>
                        </div>
                      )}
                    </dl>
                  </article>
                );
              })}
            </ScrollableRow>
          </section>
        )}

        {isVisible("beforeAfter") && (
          <section
            className="tm-block section-tone-sage"
            aria-label={content.beforeAfterSection?.title || "Before and after"}
          >
            <SectionTitle
              eyebrow={content.beforeAfterSection?.eyebrow}
              copy={content.beforeAfterSection?.copy}
            >
              {content.beforeAfterSection?.title}
            </SectionTitle>

            <ScrollableRow className="tm-ba-list" label="before and after stories">
              {beforeAfter.map((item, index) => {
                if (!item.who && !item.before && !item.after && !item.video)
                  return null;
                return (
                  <article
                    className="tm-ba"
                    key={item.id || `before-after-${index}`}
                  >
                    {item.who && (
                      <span className="tm-ba-who">{item.who}</span>
                    )}
                    <div className="tm-ba-row">
                      <div className="tm-ba-side tm-ba-before">
                        {content.beforeAfterSection?.beforeLabel && (
                          <span>
                            {content.beforeAfterSection.beforeLabel}
                          </span>
                        )}
                        {item.before && <p>{item.before}</p>}
                      </div>
                      <span className="tm-ba-arrow" aria-hidden="true">
                        <ArrowRight size={20} />
                      </span>
                      <div className="tm-ba-side tm-ba-after">
                        {content.beforeAfterSection?.afterLabel && (
                          <span>
                            {content.beforeAfterSection.afterLabel}
                          </span>
                        )}
                        {item.video ? (
                          <div className="tm-ba-video-wrap">
                            <div className="tm-ba-video">
                              {isEmbeddableVideoUrl(item.video) ? (
                                <iframe
                                  src={toEmbedUrl(item.video)}
                                  title={`${item.who || "Student"} video testimonial`}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  loading="lazy"
                                />
                              ) : (
                                <video
                                  src={item.video}
                                  poster={
                                    item.videoPoster
                                      ? item.videoPoster
                                      : undefined
                                  }
                                  controls
                                  preload="metadata"
                                />
                              )}
                            </div>
                            {item.after && (
                              <p className="tm-ba-video-caption">
                                {item.after}
                              </p>
                            )}
                          </div>
                        ) : (
                          item.after && <p>{item.after}</p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </ScrollableRow>
          </section>
        )}

        {isVisible("messages") && (
          <section
            className="tm-block tm-student-messages blue-page-shell"
            aria-label={content.messagesSection?.title || "Student messages"}
          >
            <SectionTitle
              eyebrow={content.messagesSection?.eyebrow}
              copy={content.messagesSection?.copy}
            >
              {content.messagesSection?.title}
            </SectionTitle>

            <ScrollableRow className="tm-shot-grid" label="student messages">
              {screenshots.map((shot, index) => (
                <ScreenshotCard
                  shot={shot}
                  key={shot.id || `screenshot-${index}`}
                />
              ))}
            </ScrollableRow>

            {content.messagesSection?.privacyNote && (
              <p className="tm-privacy">
                <EyeOff size={15} aria-hidden="true" />
                {content.messagesSection.privacyNote}
              </p>
            )}
          </section>
        )}

        {isVisible("finalCta") && (
          <section className="final-cta">
            {content.finalCta?.eyebrow && (
              <p className="eyebrow">{content.finalCta.eyebrow}</p>
            )}
            {content.finalCta?.title && <h2>{content.finalCta.title}</h2>}
            {content.finalCta?.copy && <p>{content.finalCta.copy}</p>}
            <div className="button-row">
              {content.finalCta?.primary && (
                <Button href={content.finalCta.primaryHref || "#"}>
                  {content.finalCta.primary}
                </Button>
              )}
              {content.finalCta?.secondary && (
                <Button
                  secondary
                  href={content.finalCta.secondaryHref || "#"}
                >
                  {content.finalCta.secondary}
                </Button>
              )}
            </div>
          </section>
        )}
      </div>
    </PageFrame>
  );
}
