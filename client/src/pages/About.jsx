import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { getAbout } from "../api/about";
import { getTestimonials } from "../api/testimonials";
import { imageUrl } from "../services/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import Eyebrow from "../components/ui/Eyebrow";
import Loading from "../components/ui/Loading";

export default function About() {
  const [content, setContent] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
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
              >
                <span className="quote-mark">“</span>
                <p>{item.story}</p>
                <div>
                  <strong>{item.display_name}</strong>
                  <span>
                    {item.country || content.testimonials.defaultRole}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}