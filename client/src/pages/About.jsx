import { useEffect, useRef, useState } from "react";
import "../styles/about.css";
import "../styles/testimonials.css";
import "../styles/content-pages.css"; // must stay last
import { Helmet } from "react-helmet-async";
import { Play, Quote } from "lucide-react";
import { getAbout } from "../api/about";
import { getTestimonials } from "../api/testimonials";
import { imageUrl } from "../services/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import Eyebrow from "../components/ui/Eyebrow";
import Loading from "../components/ui/Loading";
import TestimonialVideoModal from "../components/home/TestimonialVideoModal";

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function About() {
  const [content, setContent] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const mainRef = useRef(null);

  useEffect(() => {
    Promise.all([getAbout(), getTestimonials()])
      .then(([aboutResponse, testimonialResponse]) => {
        setContent(aboutResponse.data);
        setTestimonials(testimonialResponse.data);
      })
      .catch(() => setContent(false));
  }, []);

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

  if (content === null)
    return (
      <>
        <Header />
        <Loading />
        <Footer />
      </>
    );
  if (content === false)
    return (
      <>
        <Header />
        <ErrorState />
        <Footer />
      </>
    );

  const openIntroVideo = () => {
    if (!content.video?.url) return;
    setActiveVideo({
      video_url: content.video.url,
      display_name: content.title,
      country: "",
      story: content.video.caption || "",
    });
  };

  return (
    <>
      <Helmet>
        <title>{content.title} | APEX RN Prep</title>
        <meta name="description" content={content.intro} />
      </Helmet>
      <Header />
      <main className="about-page" ref={mainRef}>
        <section className="about-benefits scroll-reveal">
          <div className="about-benefit-images">
            <img src={imageUrl(content.images[0].url)} alt={content.images[0].alt} />
            <img src={imageUrl(content.images[1].url)} alt={content.images[1].alt} />
          </div>
          <div className="about-benefit-copy">
            <Eyebrow>{content.benefits.eyebrow}</Eyebrow>
            <h1>{content.benefits.title}</h1>
            <p>{content.benefits.copy}</p>
            <ul>
              {content.benefits.items.map((item) => (
                <li key={item}>
                  <span>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Button>{content.benefits.button}</Button>
          </div>
        </section>

        <section className="about-story section-tone-sage scroll-reveal">
          <div className="about-story-copy">
            <Eyebrow>{content.sectionEyebrow}</Eyebrow>
            <h2>{content.sectionTitle}</h2>
            <p>{content.copy}</p>
            {content.copySecondary && <p>{content.copySecondary}</p>}
          </div>
          <div className="about-story-image">
            <img
              src={imageUrl(content.image)}
              alt={content.imageAlt || content.sectionTitle}
            />
          </div>
        </section>

        {content.philosophy && (
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

        {content.credentials && (
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

        {content.principles && (
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

        <section className="about-video scroll-reveal">
          <img src={imageUrl(content.video.image)} alt={content.video.alt} />
          <div className="about-video-scrim" aria-hidden="true" />
          {content.video.caption && (
            <p className="about-video-caption">{content.video.caption}</p>
          )}
          <button
            type="button"
            className="about-video-play"
            onClick={openIntroVideo}
            aria-label={content.video.buttonLabel || "Play video"}
          >
            <span className="about-video-ring" aria-hidden="true" />
            <span className="about-video-ring about-video-ring-delay" aria-hidden="true" />
            <Play size={22} fill="currentColor" />
          </button>
        </section>

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
                      <span>{item.country || content.testimonials.defaultRole}</span>
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
