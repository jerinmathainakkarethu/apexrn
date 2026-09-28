// Route-level code splitting. Each page is loaded on demand, and the CSS it
// imports travels with it: visiting /faqs downloads base.css + faqs.css only.
import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
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
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));

export default function App() {
  return (
    <>
      <ScrollAnimations />
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
          <Route path="/admin/login" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </>
  );
}
