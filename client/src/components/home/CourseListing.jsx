import { ArrowRight, Clock3, Users } from "lucide-react";
import Eyebrow from "../ui/Eyebrow";

const COURSES = [
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
  },
];

const formatters = new Map();

function formatPrice(value, currency) {
  if (!formatters.has(currency)) {
    formatters.set(
      currency,
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      }),
    );
  }
  return formatters.get(currency).format(value);
}

export default function CourseListing({ courses = COURSES }) {
  return (
    <section className="section course-listing scroll-reveal">
      <div className="course-listing-head">
        <div>
          <Eyebrow>Enrollment</Eyebrow>
          <h2>Course registrations and payments.</h2>
        </div>
        <div className="course-listing-intro">
          <p>
            Both options cover the same 11-week live NCLEX-RN prep program,
            taught week by week from fundamentals through to clinical
            judgment.
          </p>
          <a className="course-listing-all" href="/curriculum">
            <span>See the full curriculum</span>
            <ArrowRight size={17} />
          </a>
        </div>
      </div>

      <div className="course-grid">
        {courses.map((course) => (
          <article className="course-card" key={course.id}>
            <div className={`course-card-media tone-${course.tone}`}>
              <span className="course-card-code">{course.code}</span>
              <span className="course-card-sub">{course.subtitle}</span>
            </div>

            <div className="course-card-body">
              <div className="course-card-meta">
                <span>
                  <Clock3 size={15} />
                  {course.meta[0]}
                </span>
                <span>
                  <Users size={15} />
                  {course.meta[1]}
                </span>
              </div>

              <h3>{course.title}</h3>
              <p className="course-card-subtitle">{course.subtitle}</p>
              <p className="course-card-copy">{course.description}</p>
            </div>

            <div className="course-card-foot">
              <div className="course-card-price">
                <span className="course-price-now">
                  {formatPrice(course.price, course.currency)}
                </span>
                <span className="course-price-note">{course.priceNote}</span>
              </div>
              <a className="button" href={course.href}>
                Enroll now
                <ArrowRight size={17} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}