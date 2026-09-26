import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  MessageCircle,
  Play,
} from "lucide-react";
import { getHome } from "../api/home";
import { getProgram } from "../api/program";
import { getTestimonials } from "../api/testimonials";
import { imageUrl } from "../services/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import Eyebrow from "../components/ui/Eyebrow";
import Loading from "../components/ui/Loading";
import SectionTitle from "../components/ui/SectionTitle";
import ProcessFeature from "../components/home/ProcessFeature";
import TestimonialSection from "../components/home/TestimonialSection";
import QAModal from "../components/home/QAModal";

export default function Home() {
  const [content, setContent] = useState(null);
  const [program, setProgram] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeTopic, setActiveTopic] = useState(0);
  const [qaOpen, setQaOpen] = useState(false);
  const [qaStatus, setQaStatus] = useState("idle");
  const [error, setError] = useState(false);
  useEffect(() => {
    Promise.all([getHome(), getProgram(), getTestimonials()])
      .then(([homeResponse, programResponse, testimonialResponse]) => {
        setContent(homeResponse.data);
        setProgram(programResponse.data);
        setTestimonials(testimonialResponse.data);
      })
      .catch(() => setError(true));
  }, []);
  if (error)
    return (
      <>
        <Header />
        <ErrorState />
        <Footer />
      </>
    );
  if (!content)
    return (
      <>
        <Header />
        <Loading />
        <Footer />
      </>
    );
  const c = content;
  return (
    <>
      <Helmet>
        <title>{c.seo.title}</title>
        <meta name="description" content={c.seo.description} />
      </Helmet>
      <Header transparent />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <h1>
              {c.hero.title.split(". ").map((line, index) => (
                <span key={line}>
                  {index > 0 && ". "}
                  <em>{line}</em>
                  {index < c.hero.title.split(". ").length - 1 ? "." : ""}
                  <br />
                </span>
              ))}
            </h1>
            <p className="hero-text">{c.hero.description}</p>
            <div className="button-row">
              <Button secondary>{c.hero.secondaryCta}</Button>
            </div>
          </div>
          <div className="hero-visual">
            <img src={imageUrl(c.hero.image)} alt={c.hero.imageAlt} />
            <div className="hero-note">
              <span>11 weeks</span>
              <span>Live classes</span>
              <span>Daily support</span>
            </div>
            <div className="hero-caption">{c.hero.caption}</div>
          </div>
        </section>
        <section className="snapshot" aria-label="Program snapshot">
          {c.snapshot.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </section>
        <section className="reference-section reference-audience">
          <SectionTitle eyebrow={c.audience.eyebrow} copy={c.audience.copy}>{c.audience.title}</SectionTitle>
          <div className="audience-grid">{c.audience.items.map((item, index) => <article className="audience-item" key={item.title}><span className="item-number">0{index + 1}</span><h3>{item.title}</h3><p>{item.text}</p><ArrowDownRight size={20} /></article>)}</div>
        </section>
        <section className="section curriculum" id="curriculum">
          <SectionTitle eyebrow={c.curriculum.eyebrow} copy={c.curriculum.copy}>
            {c.curriculum.title}
          </SectionTitle>
          <div className="curriculum-layout">
            <div className="topic-tabs">
              {c.curriculum.topics.map((topic, index) => (
                <button
                  className={activeTopic === index ? "active" : ""}
                  key={topic.title}
                  onClick={() => setActiveTopic(index)}
                >
                  <span>0{index + 1}</span>
                  {topic.title}
                  <ArrowRight size={17} />
                </button>
              ))}
            </div>
            <div className="topic-detail">
              <span className="topic-mark">0{activeTopic + 1}</span>
              <h3>{c.curriculum.topics[activeTopic].title}</h3>
              <p>{c.curriculum.topics[activeTopic].description}</p>
              <div className="detail-line">
                <BookOpen size={17} /> Guided teaching + focused practice
              </div>
            </div>
          </div>
        </section>
        <section className="reference-section reference-instructor">
          <div className="reference-instructor-image">
            <img
              src={imageUrl(c.instructor.image)}
              alt={c.instructor.imageAlt}
            />
          </div>
          <div className="reference-instructor-copy">
            <Eyebrow>{c.instructor.eyebrow}</Eyebrow>
            <h2>{c.instructor.title}</h2>
            {c.instructor.copy.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="reference-credential-list">
              {c.instructor.credentials.map((item) => (
                <span key={item}>
                  <Check />
                  {item}
                </span>
              ))}
            </div>
            <Button href="/about">Meet the instructor</Button>
          </div>
        </section>
        <ProcessFeature content={c} />
        <section className="program-gallery">
          <div className="program-gallery-head">
            <div>
              <Eyebrow>{c.editorial.galleryEyebrow}</Eyebrow>
              <h2>{c.editorial.galleryTitle}</h2>
            </div>
            <p>{c.editorial.galleryCopy}</p>
          </div>
          <div className="program-gallery-grid">
            {c.editorial.galleryItems.map((item, index) => (
              <article
                className="program-card"
                key={item.title}
                style={
                  item.image
                    ? {
                        "--program-card-image": `url("${imageUrl(item.image)}")`,
                      }
                    : undefined
                }
              >
                {item.image && (
                  <img
                    className="program-card-image"
                    src={imageUrl(item.image)}
                    alt={item.imageAlt || item.title}
                  />
                )}
                <span className="card-number">0{index + 1}.</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
        <TestimonialSection testimonials={testimonials} />
        <section className="reference-section reference-community">
          <div className="reference-community-copy">
            <Eyebrow>{c.community.eyebrow}</Eyebrow>
            <h2>{c.community.title}</h2>
            <p>{c.community.copy}</p>
            <div className="reference-community-items">
              {c.community.items.slice(0, 3).map((item, index) => (
                <div key={item}>
                  <span className="reference-icon">
                    <MessageCircle />
                  </span>
                  <div>
                    <h3>{item}</h3>
                    <p>{c.experience.items[index] || c.community.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="reference-community-image">
            <img
              src={imageUrl(c.community.image)}
              alt={c.community.imageAlt || c.community.title}
            />
          </div>
        </section>
        <section className="reference-section reference-qa">
          <div className="reference-qa-copy">
            <span className="reference-number">06</span>
            <Eyebrow>{c.qa.eyebrow}</Eyebrow>
            <h2>{c.qa.title}</h2>
            <p>{c.qa.copy}</p>
            <div className="qa-meta">
              <span>
                <Clock3 />
                Every Wednesday
              </span>
              <span>
                <Play />
                Live session
              </span>
              <span>
                <MessageCircle />
                Open to NCLEX-RN students
              </span>
            </div>
            <button className="button" onClick={() => setQaOpen(true)}>
              {c.qa.button} <ArrowRight size={17} />
            </button>
          </div>
          <div className="reference-qa-image">
            <img src={imageUrl(c.qa.image)} alt={c.qa.imageAlt || c.qa.title} />
          </div>
        </section>
      </main>
      <Footer />
      {qaOpen && (
        <QAModal
          status={qaStatus}
          setStatus={setQaStatus}
          close={() => setQaOpen(false)}
        />
      )}
    </>
  );
}