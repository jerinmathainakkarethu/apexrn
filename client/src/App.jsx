// Route-level code splitting. Each page is loaded on demand, and the CSS it
// imports travels with it: visiting /faqs downloads base.css + faqs.css only.
import { lazy, Suspense, useEffect, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollAnimations from "./components/ScrollAnimations";
import Loading from "./components/ui/Loading";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const ProgramPage = lazy(() => import("./pages/ProgramPage"));
const ProgramDetailsPage = lazy(() => import("./pages/ProgramDetailsPage"));
const TestimonialsPage = lazy(() => import("./pages/TestimonialsPage"));
const FaqPage = lazy(() => import("./pages/FaqPage"));
const ResourcesPage = lazy(() => import("./pages/ResourcesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BookPage = lazy(() => import("./pages/BookPage"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));

export default function App() {
  const location = useLocation();
  const [reserveVisible, setReserveVisible] = useState(false);

  useEffect(() => {
    setReserveVisible(false);
    if (location.pathname.startsWith("/admin")) return undefined;

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
      {!location.pathname.startsWith("/admin") && (
        <Link
          aria-hidden={!reserveVisible}
          className={`button reserve-spot${reserveVisible ? " is-visible" : ""}`}
          tabIndex={reserveVisible ? undefined : -1}
          to="/contact"
        >
          Reserve your spot <ArrowRight size={17} aria-hidden="true" />
        </Link>
      )}
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/program" element={<ProgramPage />} />
          <Route path="/curriculum" element={<ProgramDetailsPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/faqs" element={<FaqPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/admin/login" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </>
  );
}
