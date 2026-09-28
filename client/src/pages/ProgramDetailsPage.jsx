import { getProgramDetails } from "../api/programDetails";
import "../styles/program-details.css"; // must stay last
import { Helmet } from "react-helmet-async";
import {
  Baby,
  BookOpen,
  Brain,
  Check,
  Clock3,
  ListChecks,
  MessageCircle,
  Pill,
  Play,
  ShieldCheck,
  Stethoscope,
  Target,
  Users2,
} from "lucide-react";
import useRemote from "../hooks/useRemote";
import { imageUrl } from "../services/api";
import PageFrame from "../components/layout/PageFrame";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import Loading from "../components/ui/Loading";
import SectionTitle from "../components/ui/SectionTitle";

const SYSTEM_ICONS = {
  "Fundamentals & safety": ShieldCheck,
  "MedSurg core systems": Stethoscope,
  Pharmacology: Pill,
  "Maternity & OB": Baby,
  Pediatrics: Users2,
  "Mental health & psych": Brain,
  "NGN practice sessions": BookOpen,
};

const RESOURCE_ICONS = {
  slide: ListChecks,
  video: Play,
  cheatsheet: BookOpen,
};

export default function ProgramDetailsPage() {
  const data = useRemote(getProgramDetails);
  if (data === null)
    return (
      <>
        <Header />
        <Loading />
        <Footer />
      </>
    );
  if (data === false)
    return (
      <>
        <Header />
        <ErrorState />
        <Footer />
      </>
    );
  const {
    seo,
    hero,
    snapshot,
    structure,
    weeksIntro,
    weeks,
    systems,
    resourcesIntro,
    resources,
    practice,
    finalCta,
  } = data;
  return (
    <PageFrame
      eyebrow={hero.eyebrow}
      title={hero.title}
      intro={hero.intro}
    >
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <div className="pd">
        {hero.note && <p className="curriculum-note">{hero.note}</p>}

        <section
          className="curriculum-snapshot"
          aria-label="Program summary"
        >
          {snapshot.map((item) => (
            <span key={item}>
              <Check size={16} strokeWidth={2.2} aria-hidden="true" />
              {item}
            </span>
          ))}
        </section>

        <section className="curriculum-block section-tone-sage">
          <SectionTitle
            eyebrow={structure.eyebrow}
            copy={structure.copy}
          >
            {structure.title}
          </SectionTitle>
          <div className="curriculum-structure">
            {structure.items.map((item) => (
              <article className="curriculum-structure-item" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>
                      <Check size={15} />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="curriculum-block curriculum-weeks">
          <SectionTitle eyebrow={weeksIntro.eyebrow} copy={weeksIntro.copy}>
            {weeksIntro.title}
          </SectionTitle>
          <div className="curriculum-week-list">
            {weeks.map((week, index) => (
              <details
                className="curriculum-week"
                key={week.number}
                open={index === 0}
              >
                <summary>
                  <span className="curriculum-week-number">{week.number}</span>
                  <span className="curriculum-week-title">{week.title}</span>
                  <span className="curriculum-week-toggle" aria-hidden="true" />
                </summary>
                <div className="curriculum-week-body">
                  <p className="curriculum-week-summary">{week.summary}</p>
                  <div className="curriculum-week-meta">
                    <div>
                      <span>
                        <Play size={15} /> Live
                      </span>
                      <p>{week.live}</p>
                    </div>
                    <div>
                      <span>
                        <Clock3 size={15} /> Self-study
                      </span>
                      <p>{week.selfStudy}</p>
                    </div>
                    <div>
                      <span>
                        <Target size={15} /> Homework
                      </span>
                      <p>{week.homework}</p>
                    </div>
                  </div>
                  <h4>Topics covered</h4>
                  <ul className="curriculum-topic-list">
                    {week.topics.map((topic) => (
                      <li key={topic}>{topic}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="curriculum-block curriculum-systems section-tone-blush">
          <SectionTitle eyebrow={systems.eyebrow} copy={systems.copy}>
            {systems.title}
          </SectionTitle>
          <div className="curriculum-system-list">
            {systems.items.map((system) => {
              const Icon = SYSTEM_ICONS[system.title] || BookOpen;
              return (
                <article className="curriculum-system" key={system.title}>
                  <span className="curriculum-system-mark">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <div className="curriculum-system-main">
                    <h3>{system.title}</h3>
                    <p>{system.description}</p>
                    <ul>
                      {system.points.map((point) => (
                        <li key={point}>
                          <Check size={15} />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="curriculum-system-meta">
                    <span>{system.weeks}</span>
                    <span>{system.hours}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="curriculum-block curriculum-resources section-tone-sage">
          <SectionTitle
            eyebrow={resourcesIntro.eyebrow}
            copy={resourcesIntro.copy}
          >
            {resourcesIntro.title}
          </SectionTitle>
          <div className="curriculum-resource-grid">
            {resources.map((resource) => {
              const Icon = RESOURCE_ICONS[resource.kind] || BookOpen;
              return (
                <article
                  className={`curriculum-resource curriculum-resource-${resource.kind}`}
                  key={resource.title}
                >
                  {resource.image ? (
                    <div className="curriculum-resource-frame">
                      <img
                        className="curriculum-resource-image"
                        src={imageUrl(resource.image)}
                        alt={resource.title}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <span className="curriculum-resource-mark">
                      <Icon size={20} strokeWidth={1.6} />
                    </span>
                  )}
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <small>{resource.meta}</small>
                  {resource.url ? (
                    <a
                      className="curriculum-resource-link"
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open sample
                    </a>
                  ) : (
                    <span className="curriculum-resource-note">
                      Add the file URL in the admin editor to show this sample
                      here.
                    </span>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="curriculum-block curriculum-practice section-tone-blush-2">
          <SectionTitle eyebrow={practice.eyebrow} copy={practice.copy}>
            {practice.title}
          </SectionTitle>
          <div className="curriculum-practice-stats">
            {practice.stats.map((stat) => (
              <div key={stat.label}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="curriculum-practice-steps">
            {practice.steps.map((step, index) => (
              <div className="curriculum-practice-step" key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <p className="eyebrow">{finalCta.eyebrow}</p>
          <h2>{finalCta.title}</h2>
          <p>
            {finalCta.copy} <MessageCircle size={17} />
          </p>
          <div className="button-row">
            <Button secondary href="/contact">
              {finalCta.primary}
            </Button>
            <Button href="#contact">{finalCta.secondary}</Button>
          </div>
        </section>
      </div>
    </PageFrame>
  );
}
