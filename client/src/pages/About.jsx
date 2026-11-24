import { useEffect, useRef, useState } from "react";
import "../styles/about.css";
import "../styles/testimonials.css";
import "../styles/content-pages.css"; // must stay last
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight, Play, Quote, X } from "lucide-react";
import aboutContent from "../data/about.json";
import testimonials from "../data/testimonials.json";
import aboutInstructorImage from "../assets/about-instructor.png";
import finalApexVideo from "../assets/final_apex.mp4";
import finalApexPoster from "../assets/final_apex-poster.jpg";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Eyebrow from "../components/ui/Eyebrow";
import TestimonialVideoModal from "../components/home/TestimonialVideoModal";

// How many gallery images are shown at first, and added per "View more".
const GALLERY_PAGE_SIZE = 12;

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Decides how to play the intro video inline: YouTube / Vimeo get an
// iframe embed, anything else is played with a native <video> tag.
function getVideoSource(url = "") {
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) {
    return {
      type: "iframe",
      src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`,
    };
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    return {
      type: "iframe",
      src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1`,
    };
  }
  return {
    type: "file",
    src: url,
  };
}

export default function About() {
  const content = aboutContent;
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [galleryLimit, setGalleryLimit] = useState(GALLERY_PAGE_SIZE);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const mainRef = useRef(null);
  const lightboxTouchStart = useRef(null);

  // Computed before the early returns so the lightbox effect below can use it.
  const galleryItems = (content?.gallery?.items ?? content?.images ?? []).filter(
    (item) => item?.url,
  );

  // Scroll-reveal: same pattern as the home page — watches every
  // ".scroll-reveal" section and adds "is-visible" once it enters view.
  useEffect(() => {
    if (!content || !mainRef.current) return undefined;
    const targets = mainRef.current.querySelectorAll(".scroll-reveal");
    if (!targets.length) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [content]);

  // Lightbox: keyboard navigation + lock page scroll while it is open.
  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const total = galleryItems.length;
    const onKey = (event) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowRight")
        setLightboxIndex((i) => (i === null ? i : (i + 1) % total));
      if (event.key === "ArrowLeft")
        setLightboxIndex((i) => (i === null ? i : (i - 1 + total) % total));
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxIndex, galleryItems.length]);

  const isVisible = (key) => content.sectionVisibility?.[key] !== false;
  const benefitImages = Array.isArray(content.images)
    ? content.images.slice(0, 2).filter((image) => image?.url)
    : [];
  const usesDefaultVideo = !content.video?.url;
  const videoSource = content.video?.url
    ? getVideoSource(content.video.url)
    : { type: "file", src: finalApexVideo };

  const visibleGallery = galleryItems.slice(0, galleryLimit);
  const hiddenCount = galleryItems.length - visibleGallery.length;
  const canCollapse =
    hiddenCount === 0 && galleryItems.length > GALLERY_PAGE_SIZE;
  const lightboxItem =
    lightboxIndex !== null ? galleryItems[lightboxIndex] : null;

  const stepLightbox = (direction) =>
    setLightboxIndex(
      (i) => (i + direction + galleryItems.length) % galleryItems.length,
    );

  const handleLightboxTouchStart = (event) => {
    if (event.touches.length !== 1) {
      lightboxTouchStart.current = null;
      return;
    }

    const { clientX, clientY } = event.touches[0];
    lightboxTouchStart.current = { clientX, clientY };
  };

  const handleLightboxTouchEnd = (event) => {
    const start = lightboxTouchStart.current;
    const touch = event.changedTouches[0];
    lightboxTouchStart.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.clientX;
    const deltaY = touch.clientY - start.clientY;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
      return;
    }

    stepLightbox(deltaX < 0 ? 1 : -1);
  };

  return (
    <>
      <Helmet>
        <title>{content.title} | APEX RN Prep</title>
        <meta name="description" content={content.intro} />
      </Helmet>
      <Header />
      <main className="about-page" ref={mainRef}>
        {isVisible("benefits") && (
          <section className="about-benefits scroll-reveal">
            <div className="about-benefit-heading">
              <Eyebrow>{content.benefits.eyebrow}</Eyebrow>
              <h1>{content.benefits.title}</h1>
            </div>
            {benefitImages.length > 0 && (
              <div className="about-benefit-images">
                {benefitImages.map((image, index) => (
                  <img
                    key={`${image.url}-${index}`}
                    src={image.url}
                    alt={image.alt || ""}
                  />
                ))}
              </div>
            )}
            <div className="about-benefit-copy">
              <p>{content.benefits.copy}</p>
              <ul>
                {content.benefits.items.map((item) => (
                  <li key={item}>
                    <span>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {isVisible("story") && (
          <section className="about-story section-tone-sage scroll-reveal">
            <div className="about-story-heading">
              <Eyebrow>{content.sectionEyebrow}</Eyebrow>
              <h2>{content.sectionTitle}</h2>
            </div>
            <div className="about-story-image">
              <img
                src={aboutInstructorImage}
                alt="Smiling healthcare professional in a white coat outdoors"
              />
            </div>
            <div className="about-story-copy">
              <p>{content.copy}</p>
              {content.copySecondary && <p>{content.copySecondary}</p>}
            </div>
          </section>
        )}

        {isVisible("philosophy") && content.philosophy && (
          <section className="about-philosophy scroll-reveal">
            <div className="about-section-heading">
              <Eyebrow>{content.philosophy.eyebrow}</Eyebrow>
              <h2>{content.philosophy.title}</h2>
              <p>{content.philosophy.copy}</p>
            </div>
            <div className="about-philosophy-grid">
              {content.philosophy.items.map((item, index) => (
                <div className="content-page-item" key={item.title}>
                  <span className="about-item-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {isVisible("credentials") && content.credentials && (
          <section className="about-credentials section-tone-sage scroll-reveal">
            <div className="about-section-heading">
              <Eyebrow>{content.credentials.eyebrow}</Eyebrow>
              <h2>{content.credentials.title}</h2>
              <p>{content.credentials.copy}</p>
            </div>
            <div className="about-credentials-grid">
              {content.credentials.items.map((item) => (
                <div className="content-page-item" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {isVisible("principles") && content.principles && (
          <section className="about-principles scroll-reveal">
            <div className="about-section-heading">
              <Eyebrow>{content.principles.eyebrow}</Eyebrow>
              <h2>{content.principles.title}</h2>
            </div>
            <div className="about-principles-list">
              {content.principles.items.map((item, index) => (
                <div className="content-page-item" key={item.title}>
                  <span className="about-item-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {isVisible("video") && content.video && (
          <section
            className={`about-video scroll-reveal is-visible${
              videoPlaying ? " is-playing" : ""
            }`}
          >
            {videoPlaying && videoSource ? (
              <>
                {videoSource.type === "iframe" ? (
                  <iframe
                    className="about-video-player"
                    src={videoSource.src}
                    title={
                      content.video.alt ||
                      content.title ||
                      "APEX RN Prep video"
                    }
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    className="about-video-player"
                    src={videoSource.src}
                    poster={
                      usesDefaultVideo
                        ? finalApexPoster
                        : content.video.image
                    }
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    onEnded={() => setVideoPlaying(false)}
                  />
                )}
                <button
                  type="button"
                  className="about-video-close"
                  onClick={() => setVideoPlaying(false)}
                  aria-label="Close video"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <img
                  src={
                    usesDefaultVideo
                      ? finalApexPoster
                      : content.video.image
                  }
                  alt={
                    usesDefaultVideo
                      ? "Nurse caring for a patient"
                      : content.video.alt || ""
                  }
                />
                <div className="about-video-scrim" aria-hidden="true" />
                {content.video.caption && (
                  <p className="about-video-caption">{content.video.caption}</p>
                )}
                <button
                  type="button"
                  className="about-video-play"
                  onClick={() => videoSource && setVideoPlaying(true)}
                  aria-label={content.video.buttonLabel || "Play video"}
                >
                  <span className="about-video-ring" aria-hidden="true" />
                  <span
                    className="about-video-ring about-video-ring-delay"
                    aria-hidden="true"
                  />
                  <Play size={22} fill="currentColor" />
                </button>
              </>
            )}
          </section>
        )}

        {isVisible("gallery") && galleryItems.length > 0 && (
          <section className="about-gallery scroll-reveal">
            <div className="about-section-heading">
              <Eyebrow>
                {content.gallery?.eyebrow || "Inside APEX RN Prep"}
              </Eyebrow>
              <h2>
                {content.gallery?.title ||
                  "Learning, growing, and moving forward together."}
              </h2>
            </div>

            <div className="about-gallery-grid">
              {visibleGallery.map((item, index) => (
                <figure
                  className="about-gallery-item"
                  key={`${item.url}-${index}`}
                >
                  <button
                    type="button"
                    className="about-gallery-open"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`View image ${index + 1}${
                      item.alt ? `: ${item.alt}` : ""
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.alt || ""}
                      loading="lazy"
                    />
                    {item.alt && (
                      <span className="about-gallery-caption">{item.alt}</span>
                    )}
                  </button>
                </figure>
              ))}
            </div>

            {(hiddenCount > 0 || canCollapse) && (
              <div className="about-gallery-more">
                {hiddenCount > 0 ? (
                  <button
                    type="button"
                    className="about-gallery-more-btn"
                    onClick={() =>
                      setGalleryLimit((limit) => limit + GALLERY_PAGE_SIZE)
                    }
                  >
                    View more
                    <span>{hiddenCount} more</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="about-gallery-more-btn"
                    onClick={() => setGalleryLimit(GALLERY_PAGE_SIZE)}
                  >
                    Show less
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {isVisible("testimonials") && (
          <section className="about-testimonials scroll-reveal">
            <div className="about-testimonials-heading">
              <Eyebrow>{content.testimonials.eyebrow}</Eyebrow>
              <h2>{content.testimonials.title}</h2>
            </div>
            <div className="about-testimonial-grid">
              {testimonials.slice(0, 2).map((item, index) => {
                const name = item.display_name || "APEX RN Prep student";
                return (
                  <article
                    className={
                      index === 0
                        ? "about-testimonial content-page-item featured"
                        : "about-testimonial content-page-item"
                    }
                    key={item.id || name}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveVideo(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setActiveVideo(item);
                      }
                    }}
                    aria-label={`View ${name}'s story`}
                  >
                    <Quote className="quote-mark" size={30} />
                    <p>{item.story}</p>
                    <div className="about-testimonial-person">
                      <span className="testimonial-avatar" aria-hidden="true">
                        {initials(name) || "AR"}
                      </span>
                      <div>
                        <strong>{name}</strong>
                        <span>
                          {item.country || content.testimonials.defaultRole}
                        </span>
                      </div>
                    </div>
                    {/* {item.video_url && (
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
          </section>
        )}

        {/* Gallery lightbox (kept inside .about-page so it gets the --fx-* palette) */}
        {lightboxItem && (
          <div
            className="about-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              type="button"
              className="about-lightbox-btn about-lightbox-close"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close image viewer"
            >
              <X size={20} />
            </button>

            {galleryItems.length > 1 && (
              <button
                type="button"
                className="about-lightbox-btn about-lightbox-prev"
                onClick={(event) => {
                  event.stopPropagation();
                  stepLightbox(-1);
                }}
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <figure
              className="about-lightbox-figure"
              onClick={(event) => event.stopPropagation()}
              onTouchStart={handleLightboxTouchStart}
              onTouchEnd={handleLightboxTouchEnd}
              onTouchCancel={() => {
                lightboxTouchStart.current = null;
              }}
            >
              <img src={lightboxItem.url} alt={lightboxItem.alt || ""} />
              <figcaption>
                <span className="about-lightbox-count">
                  {String(lightboxIndex + 1).padStart(2, "0")} /{" "}
                  {String(galleryItems.length).padStart(2, "0")}
                </span>
                {lightboxItem.alt && <span>{lightboxItem.alt}</span>}
              </figcaption>
            </figure>

            {galleryItems.length > 1 && (
              <button
                type="button"
                className="about-lightbox-btn about-lightbox-next"
                onClick={(event) => {
                  event.stopPropagation();
                  stepLightbox(1);
                }}
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        )}
      </main>
      {activeVideo && (
        <TestimonialVideoModal
          testimonial={activeVideo}
          close={() => setActiveVideo(null)}
        />
      )}
      <Footer />
    </>
  );
}