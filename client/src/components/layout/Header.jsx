import { Link, useLocation } from "react-router-dom";
import { Grid2X2, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getMenu } from "../../api/menu";
import siteLogo from "../../assets/site-logo-black.png";

const defaultMenu = [
  { label: "Home", url: "/" },
  { label: "Pages", url: "/about" },
  { label: "Blog", url: "/resources" },
  { label: "Shop", url: "/program" },
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
  const location = useLocation();
  useEffect(() => {
    getMenu()
      .then((response) => {
        if (Array.isArray(response.data) && response.data.length)
          setMenu(response.data);
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
      <a className="brand" aria-label="APEX RN Prep home" href="/">
        <img src={logo} alt="APEX RN Prep" />
      </a>
      <nav className={open ? "nav open" : "nav"}>
        {menu.map((item) => (
          <a
            className={isActive(item.url) ? "active" : ""}
            href={item.url}
            key={`${item.label}-${item.url}`}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="header-tools">
        <button aria-label="Shopping cart" className="header-tool">
          <ShoppingBag />
          <b>0</b>
        </button>
        <button aria-label="Search" className="header-tool">
          <Search />
        </button>
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          className="header-tool header-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Grid2X2 />}
        </button>
      </div>
    </header>
  );
}