import { useEffect, useRef, useState } from "react";
import "../styles/home.css";
import "../styles/testimonials.css";
import { Helmet } from "react-helmet-async";
import {
  ShieldCheck,
  Stethoscope,
  Pill,
  Baby,
  Brain,
  Check,
  BookOpen,
  Clock3,
  Play,
  MessageCircle,
} from "lucide-react";
import { getHome } from "../api/home";
import { getFaqs } from "../api/faqs";
import { getProgram } from "../api/program";
import { getTestimonials } from "../api/testimonials";
import { imageUrl } from "../services/api";
import homeLogo from "../assets/nclex-logo.png";
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
import { Target, FileSignature, Briefcase, LineChart, ArrowRight } from "lucide-react";

export default function Home() {
  const [content, setContent] = useState(null);
  const [program, setProgram] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTopic, setActiveTopic] = useState(0);
  const [qaOpen, setQaOpen] = useState(false);
  const [qaStatus, setQaStatus] = useState("idle");
  const [error, setError] = useState(false);
  const mainRef = useRef(null);
  const TOPIC_ICONS = {
    "Fundamentals & safety": ShieldCheck,
    "Medical-surgical nursing": Stethoscope,
    "Pharmacology": Pill,
    "Maternity & pediatrics": Baby,
    "Mental health": Brain,
    "NGN & clinical judgment": BookOpen,
  };

  useEffect(() => {
    Promise.all([getHome(), getProgram(), getTestimonials(), getFaqs()])
      .then(([homeResponse, programResponse, testimonialResponse, faqResponse]) => {
        setContent(homeResponse.data);
        setProgram(programResponse.data);
        setTestimonials(testimonialResponse.data);
        setFaqs(faqResponse.data);
      })
      .catch(() => setError(true));
  }, []);

  // Scroll-reveal: watches every ".scroll-reveal" section and adds
  // "is-visible" once it enters the viewport. Runs after content (and
  // therefore all conditional sections) has rendered.
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

  if (error)
    return (
      <>
        <Header logo={homeLogo} />
        <ErrorState />
        <Footer />
      </>
    );
  if (!content)
    return (
      <>
        <Header logo={homeLogo} />
        <Loading />
        <Footer />
      </>
    );
  const c = content;
  const ICONS = [Target, FileSignature, Briefcase, LineChart];
  const show = (key) => c.sectionVisibility?.[key] !== false;

  return (
    <>
      <Helmet>
        <title>{c.seo.title}</title>
        <meta name="description" content={c.seo.description} />
      </Helmet>
      <Header transparent={show("hero")} logo={homeLogo} />
      <main ref={mainRef}>
        {show("hero") && (
          <section className="hero scroll-reveal">
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
                <Button>{"Contact us on Whatsapp"}</Button>
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
        )}

        {show("snapshot") && (
          <section className="snapshot scroll-reveal" aria-label="Program snapshot">
            {c.snapshot.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </section>
        )}

        {show("audience") && (
          <section className="reference-section reference-audience section-tone-blush scroll-reveal">
            <div className="audience-header">
              <div className="audience-header-left">
                <Eyebrow>{c.audience.eyebrow}</Eyebrow>
                <h2>{c.audience.title}</h2>
              </div>
              <div className="audience-header-right">
                Adipiscing elit, sed do euismod tempor incidunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco.
                <br />
                <br />
                Adipiscing elit, sed do euismod tempor incidunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam.
              </div>
            </div>

            <div className="svc-grid">
              {c.audience.items.map((item, index) => {
                const Icon = ICONS[index % ICONS.length];
                return (
                  <article className="svc-item" key={item.title}>
                    <Icon size={50} strokeWidth={1.25} className="svc-icon" />
                    <h4>{item.title}</h4>
                    <a
                      href={item.href || "#"}
                      className="svc-arrow"
                      aria-label={item.title}
                    >
                      <span>Read More</span>
                      <ArrowRight size={16} />
                    </a>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {show("curriculum") && (
          <section
            className="section curriculum section-tone-sage scroll-reveal"
            id="curriculum"
          >
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
                    <ArrowRight size={17} className="tab-arrow" />
                  </button>
                ))}
              </div>
              <div className="topic-detail" key={activeTopic}>
                <span className="topic-mark">
                  {(() => {
                    const Icon =
                      TOPIC_ICONS[c.curriculum.topics[activeTopic].title] ||
                      BookOpen;
                    return <Icon size={16} strokeWidth={1.5} />;
                  })()}
                </span>
                <h3>{c.curriculum.topics[activeTopic].title}</h3>
                <p>{c.curriculum.topics[activeTopic].description}</p>
                <div className="detail-line">
                  <BookOpen size={17} /> Guided teaching + focused practice
                </div>
              </div>
            </div>
            <div className="button-row curriculum-link-row">
              <Button secondary href="/curriculum">
                See the full curriculum
              </Button>
            </div>
          </section>
        )}

        {show("instructor") && (
          <section className="reference-section reference-instructor section-tone-blush-2 scroll-reveal">
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
        )}

        {show("process") && (
          <div className="scroll-reveal">
            <ProcessFeature content={c} />
          </div>
        )}

        {show("gallery") && (
          <section className="program-gallery section-tone-sage scroll-reveal">
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
        )}

        {show("testimonials") && (
          <div className="section-tone-blush scroll-reveal">
            <TestimonialSection testimonials={testimonials} />
          </div>
        )}

        {show("community") && (
          <section className="reference-section reference-community section-tone-sage scroll-reveal">
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
        )}

        {show("qa") && (
          <section className="reference-section reference-qa section-tone-blush-2 scroll-reveal">
            <div className="reference-qa-copy">
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
              <img
                src={imageUrl(c.qa.image)}
                alt={c.qa.imageAlt || c.qa.title}
              />
            </div>
          </section>
        )}

        {show("faqs") && faqs.length > 0 && (
          <section className="reference-section reference-faq section-tone-sage scroll-reveal">
            <div className="reference-faq-copy">
              <Eyebrow>{c.faq?.eyebrow}</Eyebrow>
              <h2>{c.faq?.title}</h2>
              <p>{c.faq?.copy}</p>
              <a className="button" href="/faqs">
                {c.faq?.button} <ArrowRight size={17} />
              </a>
            </div>
            <div className="reference-faq-list">
              {faqs.slice(0, 5).map((item) => {
                const isOpen = openFaq === item.id;
                const panelId = `faq-panel-${item.id}`;
                return (
                  <div
                    className={`faq-item${isOpen ? " is-open" : ""}`}
                    key={item.id}
                  >
                    <button
                      type="button"
                      className="faq-question"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() =>
                        setOpenFaq((current) =>
                          current === item.id ? null : item.id,
                        )
                      }
                    >
                      {item.question}
                      <ArrowRight size={17} />
                    </button>
                    <div className="faq-answer" id={panelId}>
                      <p>{item.answer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
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
