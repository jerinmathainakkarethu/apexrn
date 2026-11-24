// Route-level code splitting keeps each page's code and styles on demand.
import { lazy, Suspense, useEffect, useLayoutEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollAnimations from "./components/ScrollAnimations";
import Loading from "./components/ui/Loading";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const ProgramDetailsPage = lazy(() => import("./pages/ProgramDetailsPage"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BookPage = lazy(() => import("./pages/BookPage"));

export default function App() {
  const location = useLocation();
  const [reserveVisible, setReserveVisible] = useState(false);

  useLayoutEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    setReserveVisible(false);

    let sectionObserver;
    let mutationObserver;
    const observeOpeningSection = () => {
      const openingSection = document.querySelector(
        "main > section, main > div > section",
      );
      if (!openingSection) return false;

      sectionObserver = new IntersectionObserver(([entry]) => {
        setReserveVisible(!entry.isIntersecting);
      });
      sectionObserver.observe(openingSection);
      mutationObserver?.disconnect();
      return true;
    };

    if (!observeOpeningSection()) {
      mutationObserver = new MutationObserver(observeOpeningSection);
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      sectionObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [location.pathname]);

  return (
    <>
      <ScrollAnimations />
      <div
        aria-hidden={!reserveVisible}
        className={`reserve-actions${reserveVisible ? " is-visible" : ""}`}
      >
        <a
          className="button reserve-action reserve-contact"
          href="https://wa.me/8133301460/?text=Hi"
          tabIndex={reserveVisible ? undefined : -1}
        >
          Contact Us
        </a>
        <Link
          className="button reserve-action reserve-enroll"
          tabIndex={reserveVisible ? undefined : -1}
          to="/book"
        >
          Enroll Now <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/program" element={<Navigate to="/curriculum" replace />} />
          <Route path="/curriculum" element={<ProgramDetailsPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/faqs" element={<FaqPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/book" element={<BookPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
