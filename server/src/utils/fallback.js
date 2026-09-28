// The curriculum page is served from one large document, so the fallback
// reuses the seed content instead of duplicating it here. The controller
// only ever reassigns `fallback.programDetails`, never mutates it.
import { programDetailsContent } from "../../content-seed.js";

const fallback = {
  home: {
    title:
      "Prepare with structure. Practice with purpose. Walk in with confidence.",
    description:
      "An 11-week live online NCLEX-RN program designed for international nurses, repeat test-takers, career changers, and nurses returning to study.",
  },
  about: { title: "Meet the instructor behind APEX RN Prep." },
  programDetails: programDetailsContent,
  menu: [
    { label: "Home", url: "/" },
    { label: "Pages", url: "/about" },
    { label: "Blog", url: "/resources" },
    { label: "Shop", url: "/program" },
    { label: "Contact", url: "/contact" },
  ],
  weeks: [
    ["01", "Fundamentals & safety"],
    ["02–05", "Medical-surgical core systems"],
    ["06", "Pharmacology"],
    ["07", "Maternity"],
    ["08", "Pediatrics"],
    ["09", "Mental health"],
    ["10–11", "NGN, clinical judgment & mock practice"],
  ].map(([week_number, title], id) => ({
    id: id + 1,
    week_number,
    title,
    status: "published",
  })),
  testimonials: [],
  faqs: [],
  resources: [],
  contacts: [],
  registrations: [],
};

export default fallback;