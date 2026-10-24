// Page documents reuse seed content so the API can serve a complete shape
// without MySQL. Controllers reassign these objects; they do not mutate them.
import {
  aboutContent,
  homeContent,
  menuContent,
  programDetailsContent,
} from "../../content-seed.js";

const fallback = {
  home: homeContent,
  about: aboutContent,
  programDetails: programDetailsContent,
  menu: menuContent,
  weeks: [
    ["01", "Fundamentals & safety"],
    ["02â€“05", "Medical-surgical core systems"],
    ["06", "Pharmacology"],
    ["07", "Maternity"],
    ["08", "Pediatrics"],
    ["09", "Mental health"],
    ["10â€“11", "NGN, clinical judgment & mock practice"],
  ].map(([week_number, title], id) => ({
    id: id + 1,
    week_number,
    title,
    status: "published",
  })),
  testimonials: [],
  testimonialsPage: {
    sectionVisibility: {
      beforeAfter: true,
      messages: true,
      finalCta: true,
    },
  },
  faqs: [],
  resources: [],
  contacts: [],
  registrations: [],
  jotformRegistrations: [],
};

export default fallback;