import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Play } from "lucide-react";
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

export default function About() {
  const [content, setContent] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  useEffect(() => {
    Promise.all([getAbout(), getTestimonials()])
      .then(([aboutResponse, testimonialResponse]) => {
        setContent(aboutResponse.data);
        setTestimonials(testimonialResponse.data);
      })
      .catch(() => setContent(false));
  }, []);
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
  return (
    <>
      <Helmet>
        <title>{content.title} | APEX RN Prep</title>
        <meta name="description" content={content.intro} />
      </Helmet>
      <Header />
      <main className="about-page">
        <section className="about-benefits">
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
        <section className="about-story section-tone-sage">
          <div className="about-story-copy">
            <span className="about-section-number">01</span>
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
          <section className="about-philosophy section-tone-blush">
            <div className="about-section-heading">
              <span className="about-section-number">02</span>
              <Eyebrow>{content.philosophy.eyebrow}</Eyebrow>
              <h2>{content.philosophy.title}</h2>
              <p>{content.philosophy.copy}</p>
            </div>
            <div className="about-philosophy-grid">
              {content.philosophy.items.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.credentials && (
          <section className="about-credentials section-tone-sage">
            <div className="about-section-heading">
              <span className="about-section-number">03</span>
              <Eyebrow>{content.credentials.eyebrow}</Eyebrow>
              <h2>{content.credentials.title}</h2>
              <p>{content.credentials.copy}</p>
            </div>
            <div className="about-credentials-grid">
              {content.credentials.items.map((item) => (
                <div key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.principles && (
          <section className="about-principles section-tone-blush-2">
            <div className="about-section-heading">
              <span className="about-section-number">04</span>
              <Eyebrow>{content.principles.eyebrow}</Eyebrow>
              <h2>{content.principles.title}</h2>
            </div>
            <div className="about-principles-list">
              {content.principles.items.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="about-video">
          <img src={imageUrl(content.video.image)} alt={content.video.alt} />
          <button type="button" aria-label={content.video.buttonLabel}>
            <span>PLAY</span>
          </button>
        </section>
        <section className="about-testimonials">
          <div className="about-testimonials-heading">
            <Eyebrow>{content.testimonials.eyebrow}</Eyebrow>
            <h2>{content.testimonials.title}</h2>
          </div>
          <div className="about-testimonial-grid">
            {testimonials.slice(0, 2).map((item, index) => (
              <article
                className={
                  index === 0
                    ? "about-testimonial featured"
                    : "about-testimonial"
                }
                key={item.id || item.display_name}
                role="button"
                tabIndex={0}
                onClick={() => setActiveVideo(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveVideo(item);
                  }
                }}
                aria-label={`View ${
                  item.display_name || "student"
                }'s story video`}
              >
                <span className="quote-mark">“</span>
                <p>{item.story}</p>
                <div>
                  <strong>{item.display_name}</strong>
                  <span>
                    {item.country || content.testimonials.defaultRole}
                  </span>
                </div>
                {item.video_url && (
                  <span className="testimonial-play" aria-hidden="true">
                    <span className="testimonial-play-icon">
                      <Play size={14} fill="currentColor" />
                    </span>
                    <span className="testimonial-play-label">Watch story</span>
                  </span>
                )}
              </article>
            ))}
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