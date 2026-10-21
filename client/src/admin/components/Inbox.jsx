import {
  ArrowLeft,
  CalendarDays,
  Mail,
  MessageSquareText,
  Phone,
} from "lucide-react";
import Eyebrow from "../../components/ui/Eyebrow";

function formatListTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function Inbox({
  title,
  items,
  variant = "default",
  selectedItem,
  onSelectItem,
  onBack,
}) {
  const isContactInbox = variant === "contact";

  if (isContactInbox && selectedItem) {
    return (
      <section className="admin-collection contact-inbox contact-inbox-detail">
        <button
          type="button"
          className="contact-inbox-back"
          onClick={onBack}
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to submissions
        </button>

        <div className="contact-inbox-detail-heading">
          <span className="contact-inbox-avatar" aria-hidden="true">
            {(selectedItem.name || selectedItem.email || "?")
              .trim()
              .charAt(0)
              .toUpperCase()}
          </span>
          <div>
            <Eyebrow>Contact submission</Eyebrow>
            <h2>{selectedItem.name || "Website visitor"}</h2>
            <a href={`mailto:${selectedItem.email}`}>{selectedItem.email}</a>
          </div>
          <span className="contact-inbox-status contact-inbox-status-read">
            Read
          </span>
        </div>

        <div className="contact-inbox-detail-meta">
          {selectedItem.created_at && (
            <time dateTime={selectedItem.created_at}>
              <CalendarDays size={16} aria-hidden="true" />
              Received {new Date(selectedItem.created_at).toLocaleString()}
            </time>
          )}
          {selectedItem.whatsapp && (
            <a
              href={`https://wa.me/${selectedItem.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              <Phone size={16} aria-hidden="true" />
              WhatsApp: {selectedItem.whatsapp}
            </a>
          )}
        </div>

        <div className="contact-inbox-message contact-inbox-full-message">
          <span>
            <MessageSquareText size={17} aria-hidden="true" />
            Message
          </span>
          <p>{selectedItem.message || "No message provided."}</p>
        </div>
      </section>
    );
  }

  return (
    <div className={`admin-collection${isContactInbox ? " contact-inbox" : ""}`}>
      <div
        className={`admin-section-heading${isContactInbox ? " contact-inbox-heading" : ""}`}
      >
        <Eyebrow>{title}</Eyebrow>
        <span className={isContactInbox ? "contact-inbox-count" : ""}>
          {items.length} {items.length === 1 ? "record" : "records"}
          {isContactInbox &&
            ` · ${items.filter((item) => item.status !== "read").length} unread`}
        </span>
      </div>
      {items.length ? (
        isContactInbox ? (
          <div className="contact-inbox-list">
            {items.map((item) => {
              const unread = item.status !== "read";
              return (
                <button
                  type="button"
                  className={`contact-inbox-list-item${unread ? " is-unread" : " is-read"}`}
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  aria-label={`Open ${unread ? "unread" : "read"} message from ${item.name || item.email || "website visitor"}`}
                >
                  <strong className="contact-inbox-list-name">
                    {item.name || "Website visitor"}
                  </strong>
                  <span className="contact-inbox-list-message" title={item.message || ""}>
                    {item.message || "No message provided."}
                  </span>
                  <time
                    className="contact-inbox-list-time"
                    dateTime={item.created_at || undefined}
                    title={
                      item.created_at
                        ? new Date(item.created_at).toLocaleString()
                        : undefined
                    }
                  >
                    {formatListTime(item.created_at)}
                  </time>
                  <span className="contact-inbox-list-state">
                    {item.email}. {unread ? "Unread" : "Read"}.
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          items.map((item) => (
            <article className="admin-inbox-row" key={item.id}>
              <strong>{item.name || item.email}</strong>
              <span>{item.email}</span>
              {item.whatsapp && <span>WhatsApp: {item.whatsapp}</span>}
              <p>{item.message || item.nclex_date || "No additional details."}</p>
              {item.created_at && (
                <span>
                  Received: {new Date(item.created_at).toLocaleString()}
                </span>
              )}
            </article>
          ))
        )
      ) : (
        <p className={`admin-empty${isContactInbox ? " contact-inbox-empty" : ""}`}>
          {isContactInbox
            ? "New contact messages will appear here."
            : "No records yet."}
        </p>
      )}
    </div>
  );
}
