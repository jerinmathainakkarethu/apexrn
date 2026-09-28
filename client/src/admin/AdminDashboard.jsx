import { useEffect, useState } from "react";
import "./admin.css";
import "./pages.css";
import {
  ArrowRight,
  BookMarked,
  CalendarDays,
  Check,
  HelpCircle,
  Home as HomeIcon,
  LayoutGrid,
  LogOut,
  Mail,
  MenuIcon as MenuGlyph,
  MessageSquareQuote,
  User,
  Users2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Eyebrow from "../components/ui/Eyebrow";
import { loginAdmin } from "../api/auth";
import { apiError, onSessionExpired } from "./lib/helpers";
import OverviewEditor from "./pages/OverviewEditor";
import HomeContentEditor from "./pages/HomeContentEditor";
import AboutContentEditor from "./pages/AboutContentEditor";
import MenuEditor from "./pages/MenuEditor";
import ProgramWeeksEditor from "./pages/ProgramWeeksEditor";
import TestimonialsEditor from "./pages/TestimonialsEditor";
import FaqEditor from "./pages/FaqEditor";
import ResourcesEditor from "./pages/ResourcesEditor";
import MessagesEditor from "./pages/MessagesEditor";
import QaRegistrationsEditor from "./pages/QaRegistrationsEditor";

// "Pages" removed — every content type below already has its own sidebar entry,
// so a separate page-picker just duplicated navigation.
const sectionGroups = [
  {
    label: "Overview",
    items: [{ key: "Overview", icon: LayoutGrid }],
  },
  {
    label: "Content",
    items: [
      { key: "Menu", icon: MenuGlyph },
      { key: "Home content", icon: HomeIcon },
      { key: "About content", icon: User },
    ],
  },
  {
    label: "Program",
    items: [
      { key: "Program weeks", icon: CalendarDays },
      { key: "Testimonials", icon: MessageSquareQuote },
      { key: "FAQs", icon: HelpCircle },
      { key: "Resources", icon: BookMarked },
    ],
  },
  {
    label: "Inbox",
    items: [
      { key: "Messages", icon: Mail },
      { key: "Q&A registrations", icon: Users2 },
    ],
  },
];

/**
 * The shell only handles the session, the sidebar and the notice line.
 * Every page below loads and saves its own data through its own hook, so
 * opening or saving one page never calls another page's API.
 */
export default function AdminDashboard() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("apex_admin_token"),
  );
  const [admin, setAdmin] = useState(() =>
    JSON.parse(localStorage.getItem("apex_admin_user") || "null"),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [active, setActive] = useState("Overview");
  const [notice, setNotice] = useState("");

  const logout = () => {
    localStorage.removeItem("apex_admin_token");
    localStorage.removeItem("apex_admin_user");
    setToken(null);
    setAdmin(null);
  };

  useEffect(() => onSessionExpired(logout), []);

  async function signIn(event) {
    event.preventDefault();
    setLoginError("");
    if (!email.trim()) return setLoginError("Email is required.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setLoginError("Enter a valid email address.");
    if (password.length < 6)
      return setLoginError("Password must be at least 6 characters.");
    try {
      const response = await loginAdmin({ email, password });
      localStorage.setItem("apex_admin_token", response.data.token);
      localStorage.setItem(
        "apex_admin_user",
        JSON.stringify(response.data.admin),
      );
      setToken(response.data.token);
      setAdmin(response.data.admin);
    } catch (error) {
      setLoginError(
        apiError(error, "Unable to sign in with these credentials."),
      );
    }
  }

  if (!token)
    return (
      <div className="admin-page">
        <form className="admin-login" onSubmit={signIn}>
          <Link className="brand" to="/">
            <span>APEX</span>
            <small>RN PREP</small>
          </Link>
          <Eyebrow>Admin workspace</Eyebrow>
          <h1>Welcome back.</h1>
          <p>
            Sign in with the admin credentials from your server environment.
          </p>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {loginError && <p className="admin-error">{loginError}</p>}
          <button className="button" type="submit">
            Sign in <ArrowRight size={17} />
          </button>
        </form>
      </div>
    );

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <aside>
          <Link className="brand" to="/">
            <span>APEX</span>
            <small>RN PREP</small>
          </Link>
          <div className="admin-nav">
            {sectionGroups.map((group) => (
              <div className="admin-nav-group" key={group.label}>
                <span className="admin-nav-label">{group.label}</span>
                {group.items.map(({ key, icon: Icon }) => (
                  <button
                    className={active === key ? "selected" : ""}
                    onClick={() => {
                      setActive(key);
                      setNotice("");
                    }}
                    key={key}
                  >
                    <Icon size={15} />
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button className="admin-logout" onClick={logout}>
            <LogOut size={15} /> Log out
          </button>
        </aside>
        <section className="admin-content">
          <div className="admin-heading">
            <div>
              <Eyebrow>{admin?.email || "Admin workspace"}</Eyebrow>
              <h1>{active}.</h1>
            </div>
            {notice && (
              <span className="admin-notice">
                <Check size={15} />
                {notice}
              </span>
            )}
          </div>
          <AdminView active={active} onNotice={setNotice} />
        </section>
      </div>
    </div>
  );
}

function AdminView({ active, onNotice }) {
  switch (active) {
    case "Overview":
      return <OverviewEditor />;
    case "Menu":
      return <MenuEditor onNotice={onNotice} />;
    case "Home content":
      return <HomeContentEditor onNotice={onNotice} />;
    case "About content":
      return <AboutContentEditor onNotice={onNotice} />;
    case "Program weeks":
      return <ProgramWeeksEditor onNotice={onNotice} />;
    case "Testimonials":
      return <TestimonialsEditor onNotice={onNotice} />;
    case "FAQs":
      return <FaqEditor onNotice={onNotice} />;
    case "Resources":
      return <ResourcesEditor onNotice={onNotice} />;
    case "Messages":
      return <MessagesEditor />;
    case "Q&A registrations":
      return <QaRegistrationsEditor />;
    default:
      return null;
  }
}
