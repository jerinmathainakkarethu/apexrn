import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  X,
} from "lucide-react";
import { getMenu, updateMenu } from "../../api/menu";
import { blankMenu } from "../lib/blankRecords";
import { useJsonList } from "../hooks/useJsonList";
import { validateFields } from "../lib/helpers";
import RowEditor from "../components/RowEditor";
import Eyebrow from "../../components/ui/Eyebrow";

export default function MenuEditor({ onNotice }) {
  const page = useJsonList({
    load: getMenu,
    save: updateMenu,
    onNotice,
  });
  const [newMenu, setNewMenu] = useState(blankMenu);
  const [modalOpen, setModalOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [toast, setToast] = useState(null);
  const dragIndex = useRef(null);
  const toastTimer = useRef(null);
  const menu = page.items;

  useEffect(
    () => () => {
      window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (type, message) => {
    window.clearTimeout(toastTimer.current);
    setToast({ type, message });
    toastTimer.current = window.setTimeout(() => setToast(null), 3600);
  };

  const addMenuItem = async (event) => {
    event.preventDefault();
    const errors = validateFields(newMenu, [
      ["label", "Menu label"],
      ["url", "URL or path"],
    ]);
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      showToast("error", Object.values(errors).join(" "));
      return;
    }

    const result = await page.commit([
      ...menu,
      { label: newMenu.label.trim(), url: newMenu.url.trim() },
    ]);
    if (result === true) {
      setNewMenu(blankMenu);
      setFieldErrors({});
      setModalOpen(false);
      showToast("success", "Menu item added successfully.");
    } else if (result?.error) {
      showToast("error", result.error);
    }
  };
  const saveMenuItem = (index, value) =>
    page.commit(
      menu.map((item, itemIndex) =>
        itemIndex === index ? { label: value.label, url: value.url } : item,
      ),
    );
  const deleteMenuItem = (index) =>
    page.commit(menu.filter((_, itemIndex) => itemIndex !== index));

  const moveMenuItem = async (fromIndex, toIndex) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      toIndex >= menu.length ||
      page.loading
    )
      return;
    const nextMenu = [...menu];
    const [movedItem] = nextMenu.splice(fromIndex, 1);
    nextMenu.splice(toIndex, 0, movedItem);
    const result = await page.commit(nextMenu);
    if (result === true) showToast("success", "Menu order updated.");
    else if (result?.error) showToast("error", result.error);
  };

  const closeModal = () => {
    setModalOpen(false);
    setNewMenu(blankMenu);
    setFieldErrors({});
  };

  useEffect(() => {
    if (!modalOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modalOpen]);

  if (page.loading && !page.loaded)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error && !page.loaded)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <div className="menu-admin">
      <div className="admin-collection menu-admin-list">
        <div className="admin-section-heading menu-admin-heading">
          <Eyebrow>Header menu</Eyebrow>
          <div>
            <span>{menu.length} items</span>
            <button
              type="button"
              className="button menu-add-button"
              onClick={() => setModalOpen(true)}
            >
              <Plus size={16} />
              Add menu
            </button>
          </div>
        </div>
        {menu.length ? (
          menu.map((item, index) => (
            <div
              className="menu-sortable-row"
              data-index={index}
              key={`${item.label}-${item.url}-${menu
                .slice(0, index)
                .filter(
                  (previous) =>
                    previous.label === item.label && previous.url === item.url,
                ).length}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex.current !== null) {
                  moveMenuItem(dragIndex.current, index);
                }
                dragIndex.current = null;
              }}
            >
              <div className="menu-sort-controls">
                <button
                  type="button"
                  className="menu-drag-handle"
                  draggable={!page.loading}
                  aria-label={`Drag to reorder ${item.label}`}
                  title="Drag to reorder"
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
                    aria-label={`Move ${item.label} up`}
                    disabled={index === 0 || page.loading}
                    onClick={() => moveMenuItem(index, index - 1)}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${item.label} down`}
                    disabled={index === menu.length - 1 || page.loading}
                    onClick={() => moveMenuItem(index, index + 1)}
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              </div>
              <RowEditor
                item={item}
                summaryKey="label"
                fields={[
                  { key: "label", label: "Label" },
                  { key: "url", label: "URL or path" },
                ]}
                onSave={(value) => saveMenuItem(index, value)}
                onDelete={() => deleteMenuItem(index)}
              />
            </div>
          ))
        ) : (
          <p className="admin-empty">No menu items yet. Add your first one.</p>
        )}
      </div>

      {modalOpen && (
        <div
          className="menu-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            aria-labelledby="menu-modal-title"
            aria-modal="true"
            className="menu-modal"
            role="dialog"
          >
            <header className="menu-modal-header">
              <div>
                <Eyebrow>Website navigation</Eyebrow>
                <h2 id="menu-modal-title">Add menu item</h2>
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
            <form className="menu-modal-form" onSubmit={addMenuItem}>
              <label className={fieldErrors.label ? "has-error" : ""}>
                <span>Menu label</span>
                <input
                  autoFocus
                  value={newMenu.label}
                  onChange={(event) => {
                    setNewMenu({ ...newMenu, label: event.target.value });
                    setFieldErrors({ ...fieldErrors, label: "" });
                  }}
                  placeholder="e.g. About"
                />
                {fieldErrors.label && (
                  <small className="admin-field-error">
                    {fieldErrors.label}
                  </small>
                )}
              </label>
              <label className={fieldErrors.url ? "has-error" : ""}>
                <span>URL or path</span>
                <input
                  value={newMenu.url}
                  onChange={(event) => {
                    setNewMenu({ ...newMenu, url: event.target.value });
                    setFieldErrors({ ...fieldErrors, url: "" });
                  }}
                  placeholder="e.g. /about"
                />
                {fieldErrors.url && (
                  <small className="admin-field-error">
                    {fieldErrors.url}
                  </small>
                )}
              </label>
              <div className="menu-modal-actions">
                <button
                  type="button"
                  className="menu-modal-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button"
                  disabled={page.loading}
                >
                  <Plus size={16} />
                  {page.loading ? "Adding..." : "Add menu"}
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
