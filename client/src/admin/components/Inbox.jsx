import Eyebrow from "../../components/ui/Eyebrow";

export default function Inbox({ title, items }) {
  return (
    <div className="admin-collection">
      <div className="admin-section-heading">
        <Eyebrow>{title}</Eyebrow>
        <span>{items.length} records</span>
      </div>
      {items.length ? (
        items.map((item) => (
          <article className="admin-inbox-row" key={item.id}>
            <strong>{item.name || item.email}</strong>
            <span>{item.email}</span>
            <p>{item.message || item.nclex_date || "No additional details."}</p>
          </article>
        ))
      ) : (
        <p className="admin-empty">No records yet.</p>
      )}
    </div>
  );
}
