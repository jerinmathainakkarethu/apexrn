import { Route, Routes } from "react-router-dom";
import {
  About,
  ContactPage,
  FaqPage,
  Home,
  ProgramPage,
  ResourcesPage,
  TestimonialsPage,
} from "./pages";
import AdminDashboard from "./admin/AdminDashboard";
import ScrollAnimations from "./components/ScrollAnimations";

export default function App() {
  return (
    <>
      <ScrollAnimations />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/program" element={<ProgramPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/faqs" element={<FaqPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin/login" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}