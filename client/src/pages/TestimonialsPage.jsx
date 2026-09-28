import "../styles/testimonials.css"; // must stay last
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  EyeOff,
  Mail,
  MapPin,
  MessageCircle,
  Quote,
} from "lucide-react";
import PageFrame from "../components/layout/PageFrame";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";

/* ------------------------------------------------------------------
   STATIC CONTENT
   Everything below is placeholder text in [brackets]. Replace it with
   real, permission-approved student stories. Do not publish invented
   names, pass rates, or results.
   Set SHOW_PLACEHOLDER_NOTE to false before going live.
------------------------------------------------------------------- */

const SHOW_PLACEHOLDER_NOTE = true;

const SEO = {
  title: "Student Results & Testimonials | APEX RN Prep",
  description:
    "Read NCLEX-RN success stories from international and repeat test-takers who prepared with APEX RN Prep's live 11-week program.",
};

const HERO = {
  eyebrow: "Testimonials & results",
  title: "Real nurses. Real stories. Real progress.",
  intro:
    "Every story here follows the same path: the struggle, what changed, and the result. Read how nurses like you prepared for the NCLEX-RN with APEX RN Prep.",
};

const STORIES = [
  {
    id: "story-1",
    initials: "[Initials]",
    label: "International RN from [Country], passed in [US State]",
    attempt: "[Attempt number]",
    problem:
      "[What was hard before joining: for example, unsure how to approach NCLEX-style questions, studying alone, long gap since nursing school.]",
    solution:
      "[What helped in APEX RN Prep: for example, live classes, a structured study plan, WhatsApp study group, NGN practice.]",
    result:
      "[The outcome in the student's own words, with their permission.]",
  },
  {
    id: "story-2",
    initials: "[Initials]",
    label: "Repeat test-taker from [Country], passed in [US State]",
    attempt: "[Attempt number]",
    problem:
      "[What kept going wrong on previous attempts: timing, anxiety, weak content areas, question interpretation.]",
    solution:
      "[What changed in preparation: targeted practice, rationale review, mock exams, accountability.]",
    result:
      "[The outcome in the student's own words, with their permission.]",
  },
  {
    id: "story-3",
    initials: "[Initials]",
    label: "Nurse returning after a long gap, from [Country], passed in [US State]",
    attempt: "[Attempt number]",
    problem:
      "[What made it hard to restart: years away from textbooks, balancing work and family, low confidence.]",
    solution:
      "[What made studying manageable: simplified explanations, morning or evening batch, replays, daily support.]",
    result:
      "[The outcome in the student's own words, with their permission.]",
  },
];

const BEFORE_AFTER = [
  {
    id: "ba-1",
    who: "[Initials], [Country]",
    before: "[Before: for example, failed NCLEX X times]",
    after: "[After: for example, passed with X questions]",
  },
  {
    id: "ba-2",
    who: "[Initials], [Country]",
    before: "[Before: for example, studying alone with no plan]",
    after: "[After: for example, finished the 11-week program and passed]",
  },
  {
    id: "ba-3",
    who: "[Initials], [Country]",
    before: "[Before: for example, X years away from nursing study]",
    after: "[After: for example, passed in [US State]]",
  },
];

/* kind: "whatsapp" | "email"
   image: set to an image path (identifiers already blurred) to replace
   the placeholder mock, for example "/images/testimonials/wa-1.jpg" */
const SCREENSHOTS = [
  {
    id: "shot-1",
    kind: "whatsapp",
    image: "",
    caption: "[Study group message after passing]",
  },
  {
    id: "shot-2",
    kind: "whatsapp",
    image: "",
    caption: "[Message sent to the instructor]",
  },
  {
    id: "shot-3",
    kind: "email",
    image: "",
    caption: "[Email from a student]",
  },
];

const FINAL_CTA = {
  eyebrow: "Your turn",
  title: "Ready to write your own success story?",
  copy: "Join the next APEX RN Prep cohort, or book a free consultation to talk through your plan.",
  primary: "Book a Free Consultation",
  secondary: "Join the Next Cohort",
};

/* ------------------------------------------------------------------ */

function ScreenshotCard({ shot }) {
  const isEmail = shot.kind === "email";
  const Icon = isEmail ? Mail : MessageCircle;
  const kindLabel = isEmail ? "Email" : "WhatsApp";

  return (
    <figure className="tm-shot">
      <div className={`tm-shot-frame tm-shot-frame-${shot.kind}`}>
        <div className="tm-shot-bar">
          <span className="tm-shot-avatar tm-blur" aria-hidden="true" />
          <span className="tm-shot-name tm-blur">Student name</span>
          <Icon size={15} aria-hidden="true" />
        </div>

        {shot.image ? (
          <img
            className="tm-shot-image"
            src={shot.image}
            alt={`${kindLabel} message from a student, identifying details blurred`}
            loading="lazy"
          />
        ) : (
          <div className="tm-shot-body" aria-hidden="true">
            {isEmail ? (
              <>
                <span className="tm-line tm-line-w60" />
                <span className="tm-line tm-line-w90" />
                <span className="tm-line tm-line-w80" />
                <span className="tm-line tm-line-w40" />
              </>
            ) : (
              <>
                <span className="tm-bubble tm-bubble-in">
                  <span className="tm-line tm-line-w80" />
                  <span className="tm-line tm-line-w50" />
                </span>
                <span className="tm-bubble tm-bubble-out">
                  <span className="tm-line tm-line-w70" />
                </span>
                <span className="tm-bubble tm-bubble-in">
                  <span className="tm-line tm-line-w60" />
                </span>
              </>
            )}
            <span className="tm-shot-slot">Add screenshot</span>
          </div>
        )}
      </div>
      <figcaption>
        <span className="tm-shot-kind">
          <Icon size={13} aria-hidden="true" /> {kindLabel}
        </span>
        {shot.caption}
      </figcaption>
    </figure>
  );
}

export default function TestimonialsPage() {
  return (
    <PageFrame
      eyebrow={HERO.eyebrow}
      title={HERO.title}
      intro={HERO.intro}
    >
      <Helmet>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
      </Helmet>

      <div className="tm">
        {SHOW_PLACEHOLDER_NOTE && (
          <p className="tm-note">
            Placeholder content. Replace every [bracketed] item with real,
            permission-approved student stories before publishing.
          </p>
        )}

        {/* ---------- Written stories ---------- */}
        <section className="tm-block" aria-labelledby="tm-stories">
          <SectionTitle
            eyebrow="Success stories"
            copy="Short stories in three parts: the problem, the solution, and the result."
          >
            <span id="tm-stories">From struggle to result</span>
          </SectionTitle>

          <div className="tm-story-grid">
            {STORIES.map((story) => (
              <article className="tm-story" key={story.id}>
                <Quote className="tm-story-quote" size={26} aria-hidden="true" />

                <header className="tm-story-head">
                  <span className="tm-story-initials">{story.initials}</span>
                  <div>
                    <span className="tm-story-label">
                      <MapPin size={13} aria-hidden="true" />
                      {story.label}
                    </span>
                    <span className="tm-story-attempt">{story.attempt}</span>
                  </div>
                </header>

                <dl className="tm-steps">
                  <div className="tm-step tm-step-problem">
                    <dt>Problem</dt>
                    <dd>{story.problem}</dd>
                  </div>
                  <div className="tm-step tm-step-solution">
                    <dt>Solution</dt>
                    <dd>{story.solution}</dd>
                  </div>
                  <div className="tm-step tm-step-result">
                    <dt>Result</dt>
                    <dd>{story.result}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Before / after ---------- */}
        <section className="tm-block" aria-labelledby="tm-before-after">
          <SectionTitle
            eyebrow="Before and after"
            copy="A quick look at where students started and where they ended up."
          >
            <span id="tm-before-after">The change in one line</span>
          </SectionTitle>

          <div className="tm-ba-list">
            {BEFORE_AFTER.map((item) => (
              <article className="tm-ba" key={item.id}>
                <span className="tm-ba-who">{item.who}</span>
                <div className="tm-ba-row">
                  <div className="tm-ba-side tm-ba-before">
                    <span>Before</span>
                    <p>{item.before}</p>
                  </div>
                  <span className="tm-ba-arrow" aria-hidden="true">
                    <ArrowRight size={20} />
                  </span>
                  <div className="tm-ba-side tm-ba-after">
                    <span>After</span>
                    <p>{item.after}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Screenshots ---------- */}
        <section className="tm-block" aria-labelledby="tm-messages">
          <SectionTitle
            eyebrow="In their own words"
            copy="Messages shared by students, with names and contact details blurred."
          >
            <span id="tm-messages">Messages from students</span>
          </SectionTitle>

          <div className="tm-shot-grid">
            {SCREENSHOTS.map((shot) => (
              <ScreenshotCard shot={shot} key={shot.id} />
            ))}
          </div>

          <p className="tm-privacy">
            <EyeOff size={15} aria-hidden="true" />
            Names, phone numbers, and email addresses are blurred to protect
            student privacy.
          </p>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="final-cta">
          <p className="eyebrow">{FINAL_CTA.eyebrow}</p>
          <h2>{FINAL_CTA.title}</h2>
          <p>{FINAL_CTA.copy}</p>
          <div className="button-row">
            <Button href="/contact">{FINAL_CTA.primary}</Button>
            <Button secondary href="/contact#cohort">
              {FINAL_CTA.secondary}
            </Button>
          </div>
        </section>
      </div>
    </PageFrame>
  );
}
