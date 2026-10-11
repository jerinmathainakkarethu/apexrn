import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Plus, X } from "lucide-react";
import Eyebrow from "../../components/ui/Eyebrow";
import { validateFields } from "../lib/helpers";
import RowEditor from "./RowEditor";

export default function Collection({
  title,
  items,
  fields,
  onSave,
  onDelete,
  summaryKey,
  draft,
  blank,
  setDraft,
  addFields,
  addLabel = "Add item",
  onAdd,
  loading = false,
  draggable = false,
  onMove,
  emptyMessage = "No records yet. Add your first one.",
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [moving, setMoving] = useState(false);
  const dragIndex = useRef(null);
  const toastTimer = useRef(null);

  useEffect(
    () => () => window.clearTimeout(toastTimer.current),
    [],
  );

  useEffect(() => {
    if (!modalOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modalOpen]);

  const showToast = (type, message) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = window.setTimeout(() => setToast(null), 3600);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDraft?.(blank);
    setFieldErrors({});
  };

  const addRecord = async (event) => {
    event.preventDefault();
    const errors = validateFields(draft, addFields);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      showToast("error", Object.values(errors).join(" "));
      return;
    }
    const result = await onAdd(draft);
    if (result === true) {
      setModalOpen(false);
      setDraft(blank);
      setFieldErrors({});
      showToast(
        "success",
        `${addLabel.replace(/^Add /, "")} added successfully.`,
      );
    } else if (result?.error) {
      showToast("error", result.error);
    }
  };

  const saveRecord = async (id, value) => {
    try {
      const result = await onSave(id, value);
      if (result === true) showToast("success", `${title} item saved.`);
      else if (result?.error) showToast("error", result.error);
      return result;
    } catch (error) {
      const message = error.message || `${title} item could not be saved.`;
      showToast("error", message);
      return { error: message };
    }
  };

  const deleteRecord = async (id) => {
    try {
      const result = await onDelete(id);
      if (result === true) showToast("success", `${title} item deleted.`);
      else if (result?.error) showToast("error", result.error);
      return result;
    } catch (error) {
      const message = error.message || `${title} item could not be deleted.`;
      showToast("error", message);
      return { error: message };
    }
  };

  const moveItem = async (fromIndex, toIndex) => {
    if (
      !onMove ||
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      toIndex >= items.length ||
      loading ||
      moving
    ) {
      return;
    }
    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    setMoving(true);
    try {
      const result = await onMove(nextItems);
      if (result === true) showToast("success", `${title} order updated.`);
      else if (result?.error) showToast("error", result.error);
    } catch (error) {
      showToast("error", error.message || `${title} order could not be updated.`);
    } finally {
      setMoving(false);
    }
  };

  const isBusy = loading || moving;

  return (
    <div className={`admin-collection${onAdd ? " menu-admin-list" : ""}`}>
      <div
        className={`admin-section-heading${onAdd ? " menu-admin-heading" : ""}`}
      >
        <Eyebrow>{title}</Eyebrow>
        {onAdd ? (
          <div>
            <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
            <button
              type="button"
              className="button menu-add-button"
              onClick={() => setModalOpen(true)}
              disabled={loading}
            >
              <Plus size={16} />
              {addLabel}
            </button>
          </div>
        ) : (
          <span>{items.length} records</span>
        )}
      </div>
      {items.length ? (
        items.map((item, index) => (
          <div
            className={draggable ? "menu-sortable-row" : undefined}
            key={item.id}
            onDragOver={
              draggable
                ? (event) => event.preventDefault()
                : undefined
            }
            onDrop={
              draggable
                ? (event) => {
                    event.preventDefault();
                    if (dragIndex.current !== null) {
                      moveItem(dragIndex.current, index);
                    }
                    dragIndex.current = null;
                  }
                : undefined
            }
          >
            {draggable && (
              <div className="menu-sort-controls">
                <button
                  type="button"
                  className="menu-drag-handle"
                  draggable={!isBusy}
                  aria-label={`Drag to reorder ${item[summaryKey]}`}
                  title="Drag to reorder"
                  disabled={isBusy}
                  onDragStart={(event) => {
                    dragIndex.current = index;
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", String(index));
                  }}
                  onDragEnd={() => {
                    dragIndex.current = null;
                  }}
                >
                  <GripVertical size={18} />
                </button>
                <div className="menu-order-buttons">
                  <button
                    type="button"
                    aria-label={`Move ${item[summaryKey]} up`}
                    disabled={index === 0 || isBusy}
                    onClick={() => moveItem(index, index - 1)}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${item[summaryKey]} down`}
                    disabled={index === items.length - 1 || isBusy}
                    onClick={() => moveItem(index, index + 1)}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
            )}
            <RowEditor
              item={item}
              fields={fields}
              summaryKey={summaryKey}
              onSave={(value) => saveRecord(item.id, value)}
              onDelete={onDelete ? deleteRecord : undefined}
            />
          </div>
        ))
      ) : (
        <p className="admin-empty">{emptyMessage}</p>
      )}
      {onAdd && modalOpen && (
        <div
          className="menu-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            aria-labelledby="record-modal-title"
            aria-modal="true"
            className="menu-modal"
            role="dialog"
          >
            <header className="menu-modal-header">
              <div>
                <Eyebrow>{title}</Eyebrow>
                <h2 id="record-modal-title">{addLabel}</h2>
              </div>
              <button
                type="button"
                className="menu-modal-close"
                aria-label="Close"
                onClick={closeModal}
              >
                <X size={19} />
              </button>
            </header>
            <form className="menu-modal-form" onSubmit={addRecord}>
              {addFields.map(([key, label, optional, control]) => (
                <label
                  key={key}
                  className={fieldErrors[key] ? "has-error" : ""}
                >
                  <span>{label}</span>
                  {control?.type === "select" ? (
                    <select
                      value={draft[key] ?? control.options[0][0]}
                      onChange={(event) => {
                        setFieldErrors({ ...fieldErrors, [key]: "" });
                        setDraft({ ...draft, [key]: event.target.value });
                      }}
                    >
                      {control.options.map(([optionValue, optionLabel]) => (
                        <option key={optionValue} value={optionValue}>
                          {optionLabel}
                        </option>
                      ))}
                    </select>
                  ) : key === "answer" || key === "description" ? (
                    <textarea
                      rows={4}
                      value={draft[key] ?? ""}
                      onChange={(event) => {
                        setFieldErrors({ ...fieldErrors, [key]: "" });
                        setDraft({ ...draft, [key]: event.target.value });
                      }}
                    />
                  ) : (
                    <input
                      autoFocus={key === addFields[0][0]}
                      type="text"
                      value={draft[key] ?? ""}
                      onChange={(event) => {
                        setFieldErrors({ ...fieldErrors, [key]: "" });
                        setDraft({ ...draft, [key]: event.target.value });
                      }}
                    />
                  )}
                  {fieldErrors[key] && (
                    <small className="admin-field-error">
                      {fieldErrors[key]}
                    </small>
                  )}
                  {optional && <small>Optional</small>}
                </label>
              ))}
              <div className="menu-modal-actions">
                <button
                  type="button"
                  className="menu-modal-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="button" disabled={loading}>
                  <Plus size={16} />
                  {loading ? "Adding..." : addLabel}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {toast && (
        <div
          className={`menu-toast menu-toast-${toast.type}`}
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
        >
          <span className="menu-toast-indicator" aria-hidden="true" />
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
