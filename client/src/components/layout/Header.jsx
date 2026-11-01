import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getMenu } from "../../api/menu";
import siteLogo from "../../assets/site-logo-black.png";

const defaultMenu = [
  { label: "Home", url: "/" },
  { label: "Pages", url: "/about" },
  { label: "Blog", url: "/resources" },
  { label: "Curriculum", url: "/curriculum" },
  { label: "Contact", url: "/contact" },
];

/**
 * The home page is the one place that keeps the original logo, so `logo` is
 * overridable rather than hardcoded. Both files are 1774x887, so
 * `.brand img { width: 150px }` renders either one identically.
 */
export default function Header({ transparent = false, logo = siteLogo }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(defaultMenu);
  const menuButtonRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  useEffect(() => {
    getMenu()
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length)
            setMenu(
              response.data.map((item) =>
                item.url === "/program"
                  ? { ...item, label: "Curriculum", url: "/curriculum" }
                  : item,
              ),
            );
      })
      .catch(() => undefined);
  }, []);
  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : path.startsWith("/") && location.pathname.startsWith(path);
  return (
    <header
      className={`site-header${transparent ? " site-header-transparent" : ""}`}
    >
      <Link className="brand" aria-label="APEX RN Prep home" to="/">
        <img src={logo} alt="APEX RN Prep" />
      </Link>
      <nav
        aria-label="Primary navigation"
        className={open ? "nav open" : "nav"}
        id="primary-navigation"
      >
        {menu.map((item) => (
          <Link
            aria-current={isActive(item.url) ? "page" : undefined}
            className={isActive(item.url) ? "active" : ""}
            key={`${item.label}-${item.url}`}
            to={item.url}
            onClick={() => setOpen(false)}
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
        onClick={() => setOpen((current) => !current)}
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