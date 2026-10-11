import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, Save, X } from "lucide-react";
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
  className = "",
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
  toastOnSave = false,
  children,
}) {
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(
    () => () => window.clearTimeout(toastTimer.current),
    [],
  );

  const showToast = (type, message) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  };

  const save = async () => {
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      const result = await onSave();
      if (result?.error) {
        setError(result.error);
        if (toastOnSave) showToast("error", result.error);
      } else if (result === true) {
        setSaved(true);
        if (toastOnSave) showToast("success", successMessage);
      }
    } catch {
      const message = "Changes could not be saved. Please try again.";
      setError(message);
      if (toastOnSave) showToast("error", message);
    } finally {
      setSaving(false);
    }
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
    <div className={`home-content-editor ${className}`.trim()}>
      <div className="home-editor-toolbar">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2>{heading}</h2>
          <p>{description}</p>
          {note && <p className="home-visibility-note">{note}</p>}
        </div>
        <div className="home-editor-actions">
          <button
            type="button"
            className="button"
            onClick={save}
            disabled={loading || saving}
            aria-busy={saving}
          >
            {saving ? (
              <LoaderCircle size={16} className="admin-save-spinner" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : saveLabel}
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

      {error && !toastOnSave && <p className="admin-form-error">{error}</p>}
      {saved && !toastOnSave && (
        <p className="admin-form-success">{successMessage}</p>
      )}
      {uploadError && <p className="admin-form-error">{uploadError}</p>}

      {children}

      {toastOnSave && toast && (
        <div
          className={`admin-toast admin-toast-${toast.type}`}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
        >
          <span className="admin-toast-icon" aria-hidden="true">
            {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
          </span>
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
