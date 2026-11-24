import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import menu from "../../data/menu.json";
import siteLogo from "../../assets/site-logo-black.png";

/**
 * The home page is the one place that keeps the original logo, so `logo` is
 * overridable rather than hardcoded. Both files are 1774x887, so
 * `.brand img { width: 150px }` renders either one identically.
 */
export default function Header({ transparent = false, logo = siteLogo }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuButtonRef = useRef(null);
  const closeTimerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    window.clearTimeout(closeTimerRef.current);
    setOpen(false);
    setClosing(false);
  }, [location.pathname]);

  useEffect(
    () => () => window.clearTimeout(closeTimerRef.current),
    [],
  );

  const closeMenu = useCallback(() => {
    window.clearTimeout(closeTimerRef.current);
    setOpen(false);
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => setClosing(false), 240);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, closeMenu]);

  const toggleMenu = () => {
    if (open) {
      closeMenu();
      return;
    }
    window.clearTimeout(closeTimerRef.current);
    setClosing(false);
    setOpen(true);
  };

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : path.startsWith("/") && location.pathname.startsWith(path);
  return (
    <header
      className={`site-header${transparent ? " site-header-transparent" : ""}${
        open ? " menu-open" : ""
      }`}
    >
      <Link className="brand" aria-label="APEX RN Prep home" to="/">
        <img src={logo} alt="APEX RN Prep" />
      </Link>
      <nav
        aria-label="Primary navigation"
        className={`nav${open ? " open" : closing ? " closing" : ""}`}
        id="primary-navigation"
      >
        {menu.map((item) => (
          <Link
            aria-current={isActive(item.url) ? "page" : undefined}
            className={isActive(item.url) ? "active" : ""}
            key={`${item.label}-${item.url}`}
            to={item.url}
            onClick={closeMenu}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <button
        aria-controls="primary-navigation"
        aria-expanded={open}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className="menu-button"
        onClick={toggleMenu}
        ref={menuButtonRef}
        type="button"
      >
        {open ? (
          <X aria-hidden="true" size={22} />
        ) : (
          <Menu aria-hidden="true" size={22} />
        )}
      </button>
    </header>
  );
}