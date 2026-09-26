import { Link, useLocation } from "react-router-dom";
import { Grid2X2, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { getMenu } from "../../api/menu";
import logo from "../../assets/nclex-logo.png";

const defaultMenu = [
  { label: "Home", url: "/" },
  { label: "Pages", url: "/about" },
  { label: "Blog", url: "/resources" },
  { label: "Shop", url: "/program" },
  { label: "Contact", url: "/contact" },
];

export default function Header({ transparent = false }) {
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