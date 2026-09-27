import {
  BookMarked,
  CalendarDays,
  HelpCircle,
  Mail,
  MessageSquareQuote,
  Users2,
} from "lucide-react";
import { useOverviewCounts } from "../hooks/useOverviewCounts";

const STAT_CARDS = [
  ["Program weeks", "program", CalendarDays],
  ["Testimonials", "testimonials", MessageSquareQuote],
  ["FAQs", "faqs", HelpCircle],
  ["Resources", "resources", BookMarked],
  ["Messages", "contacts", Mail],
  ["Q&A registrations", "registrations", Users2],
];

export default function OverviewEditor() {
  const page = useOverviewCounts();

  if (page.loading)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <>
      <div className="admin-stats">
        {STAT_CARDS.map(([label, key, Icon]) => (
          <div key={label}>
            <Icon size={18} className="admin-stat-icon" />
            <span>{page.counts[key]}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>
    </>
  );
}
