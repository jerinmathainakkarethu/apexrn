import Eyebrow from "../../components/ui/Eyebrow";
import RowEditor from "./RowEditor";

export default function Collection({ title, items, fields, onSave, onDelete, summaryKey }) {
  return (
    <div className="admin-collection">
      <div className="admin-section-heading">
        <Eyebrow>{title}</Eyebrow>
        <span>{items.length} records</span>
      </div>
      {items.length ? (
        items.map((item) => (
          <RowEditor
            key={item.id}
            item={item}
            fields={fields}
            summaryKey={summaryKey}
            onSave={(value) => onSave(item.id, value)}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p className="admin-empty">No records yet. Add your first one above.</p>
      )}
    </div>
  );
}
