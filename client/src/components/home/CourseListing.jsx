import { ArrowRight, Clock3, Users } from "lucide-react";
import Eyebrow from "../ui/Eyebrow";

export const DEFAULT_COURSE_LISTING = {
  eyebrow: "Enrollment",
  title: "Course registrations and payments.",
  copy:
    "Both options cover the same 11-week live NCLEX-RN prep program, taught week by week from fundamentals through to clinical judgment.",
  curriculumLinkText: "See the full curriculum",
  curriculumHref: "/curriculum",
  courses: [
    {
      id: "prep-full",
      code: "01",
      title: "11 Week Prep",
      subtitle: "Full payment",
      description: "Full payment for the 11 Week Prep Course.",
      priceNote: "One-time payment",
      meta: ["11 weeks", "Live online"],
      price: 1200,
      currency: "USD",
      tone: "clay",
      href: "/contact",
      buttonText: "Enroll",
    },
    {
      id: "prep-installment",
      code: "02",
      title: "11 Week Prep",
      subtitle: "Installment plan",
      description: "Installment payment for the 11 week prep course.",
      priceNote: "Per installment",
      meta: ["11 weeks", "Live online"],
      price: 400,
      currency: "USD",
      tone: "sage",
      href: "/contact",
      buttonText: "Enroll",
    },
  ],
};

const formatters = new Map();

function formatPrice(value, currency) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return String(value ?? "");
  if (!formatters.has(currency)) {
    try {
      formatters.set(
        currency,
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: 2,
        }),
      );
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      return `${currency} ${amount.toFixed(2)}`;
    }
  }
  return formatters.get(currency).format(amount);
}

export default function CourseListing({ content }) {
  const listing = {
    ...DEFAULT_COURSE_LISTING,
    ...content,
    courses: Array.isArray(content?.courses)
      ? content.courses
      : DEFAULT_COURSE_LISTING.courses,
  };

  return (
    <section className="section course-listing home-blue-section scroll-reveal">
      <div className="course-listing-head">
        <div>
          <Eyebrow>{listing.eyebrow}</Eyebrow>
          <h2>{listing.title}</h2>
        </div>
        <div className="course-listing-intro">
          <p>{listing.copy}</p>
          <a className="course-listing-all" href={listing.curriculumHref}>
            <span>{listing.curriculumLinkText}</span>
            <ArrowRight size={17} />
          </a>
        </div>
      </div>

      {listing.courses.length > 0 && (
        <div className="course-grid">
          {listing.courses.map((course, index) => {
            const defaults =
              DEFAULT_COURSE_LISTING.courses[
                index % DEFAULT_COURSE_LISTING.courses.length
              ];
            const meta = Array.isArray(course.meta) ? course.meta : defaults.meta;
            const tone = course.tone || defaults.tone;
            return (
              <article
                className={`course-option-card tone-${tone}`}
                key={course.id || `${course.code || "course"}-${index}`}
              >
                <div className="course-option-header">
                  <span className="course-option-code">
                    {course.code ?? defaults.code}
                  </span>
                  <span className="course-option-plan">
                    {course.subtitle ?? defaults.subtitle}
                  </span>
                </div>

                <div className="course-option-body">
                  <h3>{course.title ?? defaults.title}</h3>
                  <div className="course-option-meta">
                    <span>
                      <Clock3 size={15} />
                      {meta[0] ?? defaults.meta[0]}
                    </span>
                    <span>
                      <Users size={15} />
                      {meta[1] ?? defaults.meta[1]}
                    </span>
                  </div>
                  <p className="course-option-copy">
                    {course.description ?? defaults.description}
                  </p>
                </div>

                <div className="course-option-footer">
                  <div className="course-option-price">
                    <span className="course-option-price-value">
                      {formatPrice(
                        course.price ?? defaults.price,
                        course.currency || defaults.currency,
                      )}
                    </span>
                    <span className="course-option-price-note">
                      {course.priceNote ?? defaults.priceNote}
                    </span>
                  </div>
                  <a
                    className="button course-option-button"
                    href={course.href ?? defaults.href}
                  >
                    {course.buttonText ?? defaults.buttonText}
                    <ArrowRight size={17} />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}