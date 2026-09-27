import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Collapsible accordion section for the content builders.
 * `where` = a one-line description of where this content shows up on the
 * live page, `preview` = the current title/eyebrow text shown even while
 * collapsed, so an admin can identify a section without opening it.
 * `sectionKey` = when set, a switch appears that hides/shows this section
 * on the live site.
 */
export default function HomeSection({
  number,
  icon: Icon,
  title,
  where,
  preview,
  children,
  defaultOpen = false,
  anchorId,
  sectionKey,
  visible = true,
  onToggle,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      id={anchorId}
      className={`home-content-section${open ? " open" : ""}${
        sectionKey && !visible ? " is-hidden" : ""
      }`}
    >
      <div className="home-section-row">
        <button
          type="button"
          className="home-section-heading"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <div className="home-section-heading-left">
            <span className="home-section-badge">{number}</span>
            <div className="home-section-icon">
              <Icon size={17} strokeWidth={1.6} />
            </div>
            <div>
              <h3>{title}</h3>
              <p className="home-section-where">{where}</p>
              {!open && preview ? (
                <p className="home-section-preview">"{preview}"</p>
              ) : null}
            </div>
          </div>
          <ChevronDown size={18} className="home-section-chevron" />
        </button>
        {sectionKey ? (
          <label className="admin-switch" title={`Show "${title}" on the live site`}>
            <input
              type="checkbox"
              checked={visible}
              onChange={() => onToggle(sectionKey)}
            />
            <span className="admin-switch-track">
              <span className="admin-switch-thumb" />
            </span>
            <span className="admin-switch-text">
              {visible ? "Live" : "Hidden"}
            </span>
          </label>
        ) : null}
      </div>
      {open && <div className="home-section-body">{children}</div>}
    </section>
  );
}
