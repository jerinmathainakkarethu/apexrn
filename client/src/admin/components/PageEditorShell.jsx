import { useState } from "react";
import { Save } from "lucide-react";
import Eyebrow from "../../components/ui/Eyebrow";

/**
 * Chrome shared by the JSON-free content builders (home, about, ...):
 * the page heading, the single save button, the jump nav, the
 * error/success notices and the "content could not be loaded" fallback.
 */
export default function PageEditorShell({
  eyebrow,
  heading,
  description,
  note,
  saveLabel,
  successMessage,
  emptyTitle,
  emptyMessage,
  hasContent,
  loading = false,
  nav = [],
  uploadError = "",
  onSave,
  onRetry,
  children,
}) {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const save = async () => {
    setError("");
    setSaved(false);
    const result = await onSave();
    if (result?.error) setError(result.error);
    else setSaved(true);
  };
  const jumpTo = (id) =>
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  if (loading && !hasContent)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (!hasContent)
    return (
      <div className="admin-create">
        <Eyebrow>{emptyTitle}</Eyebrow>
        <p className="admin-form-error">{emptyMessage}</p>
        <div className="button-row">
          <button type="button" className="button" onClick={onRetry}>
            Retry loading
          </button>
        </div>
      </div>
    );

  return (
    <div className="home-content-editor">
      <div className="home-editor-toolbar">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2>{heading}</h2>
          <p>{description}</p>
          {note && <p className="home-visibility-note">{note}</p>}
        </div>
        <div className="home-editor-actions">
          <button type="button" className="button" onClick={save}>
            <Save size={16} />
            {saveLabel}
          </button>
        </div>
      </div>

      {nav.length ? (
        <nav className="home-jump-nav" aria-label="Jump to section">
          {nav.map((item) => (
            <button type="button" key={item.id} onClick={() => jumpTo(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
      ) : null}

      {error && <p className="admin-form-error">{error}</p>}
      {saved && <p className="admin-form-success">{successMessage}</p>}
      {uploadError && <p className="admin-form-error">{uploadError}</p>}

      {children}
    </div>
  );
}
