import {
  ArrowUpRight,
  Bell,
  BookMarked,
  HelpCircle,
  Mail,
  MessageSquareQuote,
  Users2,
} from "lucide-react";
import { useOverviewCounts } from "../hooks/useOverviewCounts";

const STAT_CARDS = [
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
    <div className="overview-layout">
      <div className="admin-stats">
        {STAT_CARDS.map(([label, key, Icon]) => (
          <div key={label} className="admin-stat-card">
            <Icon size={18} className="admin-stat-icon" />
            <span>{page.counts[key]}</span>
            <p>{label}</p>
            <button type="button" className="admin-stat-arrow" aria-label={`Open ${label}`}>
              <ArrowUpRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <aside className="admin-activity-panel">
        <div className="admin-activity-head">
          <span className="admin-activity-bell">
            <Bell size={15} />
          </span>
          <h3>Recent Activity</h3>
        </div>

        <p className="admin-activity-empty">No recent activity to show.</p>
      </aside>
    </div>
  );
}
