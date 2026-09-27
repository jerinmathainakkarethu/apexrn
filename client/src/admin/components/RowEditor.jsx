import { useState } from "react";
import { ChevronDown, Save, Trash2 } from "lucide-react";
import { validateFields } from "../lib/helpers";
import VideoField from "./VideoField";

export default function RowEditor({ item, fields, onSave, onDelete, summaryKey }) {
  const [draft, setDraft] = useState(item);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);
  const label = draft[summaryKey || fields[0]?.key] || "Untitled record";
  const save = async () => {
    const nextErrors = validateFields(
      draft,
      fields.map((field) => [field.key, field.label, field.optional]),
    );
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length) return;
    const result = await onSave(draft);
    if (result?.error) setMessage(result.error);
  };
  return (
    <div className={`admin-row${expanded ? " expanded" : ""}`}>
      <button
        type="button"
        className="admin-row-summary"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <strong>{label}</strong>
        <ChevronDown size={16} className="admin-row-chevron" />
      </button>
      {expanded && (
        <>
          <div className="admin-row-fields">
            {fields.map((field) =>
              field.key === "video_url" ? (
                <VideoField
                  key={field.key}
                  label={field.label}
                  value={draft[field.key]}
                  onChange={(next) => {
                    setErrors({ ...errors, [field.key]: "" });
                    setDraft({ ...draft, [field.key]: next });
                  }}
                />
              ) : (
                <label
                  key={field.key}
                  className={errors[field.key] ? "has-error" : ""}
                >
                  <span>
                    {field.label}
                    {!field.optional && <em className="admin-required">*</em>}
                  </span>
                  <textarea
                    rows={
                      field.key === "story" ||
                      field.key === "answer" ||
                      field.key === "content"
                        ? 4
                        : 1
                    }
                    value={draft[field.key] ?? ""}
                    onChange={(event) => {
                      setErrors({ ...errors, [field.key]: "" });
                      setDraft({ ...draft, [field.key]: event.target.value });
                    }}
                  />
                  {errors[field.key] && (
                    <small className="admin-field-error">
                      {errors[field.key]}
                    </small>
                  )}
                </label>
              ),
            )}
          </div>
          {message && <p className="admin-form-error">{message}</p>}
          <div className="admin-row-actions">
            <button type="button" className="button" onClick={save}>
              <Save size={15} />
              Save
            </button>
            {onDelete && (
              <button
                type="button"
                className="icon-danger"
                onClick={() => onDelete(item.id)}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
