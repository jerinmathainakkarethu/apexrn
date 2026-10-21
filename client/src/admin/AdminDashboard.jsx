import { useEffect, useState } from "react";
import "./admin.css";
import "./pages.css";
import {
  ArrowRight,
  BookMarked,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  HelpCircle,
  Home as HomeIcon,
  LayoutGrid,
  ListChecks,
  Lock,
  LogOut,
  Mail,
  MenuIcon as MenuGlyph,
  MessageSquareQuote,
  User,
  Users2,
} from "lucide-react";
import { Link } from "react-router-dom";
import Eyebrow from "../components/ui/Eyebrow";
import { loginAdmin, verifyAdminOtp } from "../api/auth";
import { apiError, onSessionExpired } from "./lib/helpers";
import OverviewEditor from "./pages/OverviewEditor";
import HomeContentEditor from "./pages/HomeContentEditor";
import AboutContentEditor from "./pages/AboutContentEditor";
import MenuEditor from "./pages/MenuEditor";
import ProgramWeeksEditor from "./pages/ProgramWeeksEditor";
import ProgramDetailsEditor from "./pages/ProgramDetailsEditor";
import TestimonialsEditor from "./pages/TestimonialsEditor";
import FaqEditor from "./pages/FaqEditor";
import AdminProfileEditor from "./pages/AdminProfileEditor";
import MessagesEditor from "./pages/MessagesEditor";

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
      { key: "Curriculum page", icon: ListChecks },
      { key: "Testimonials", icon: MessageSquareQuote },
      { key: "FAQs", icon: HelpCircle },
    ],
  },
  {
    label: "Inbox",
    items: [{ key: "Contact submissions", icon: Mail }],
  },
  {
    label: "Account",
    items: [{ key: "Admin profile", icon: User }],
  },
];

/**
 * The shell only handles the session, the sidebar and the notice line.
 * Every page below loads and saves its own data through its own hook, so
 * opening or saving one page never calls another page's API.
 */
const dashboardNav = ["Home", "Pages", "Blog", "Shop", "Contact"];

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
  const [loginMessage, setLoginMessage] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDestination, setOtpDestination] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    setLoginMessage("");
    if (!email.trim()) return setLoginError("Email is required.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setLoginError("Enter a valid email address.");
    if (!otpSent && password.length < 6)
      return setLoginError("Password must be at least 6 characters.");
    if (otpSent && !/^\d{6}$/.test(otp))
      return setLoginError("Enter the 6-digit verification code.");

    setAuthBusy(true);
    try {
      const response = otpSent
        ? await verifyAdminOtp({ email: email.trim(), code: otp })
        : await loginAdmin({ email: email.trim(), password });
      if (!otpSent) {
        setOtpSent(true);
        setOtpDestination(response.data.destination);
        setPassword("");
        setLoginMessage(response.data.message);
        return;
      }
      localStorage.setItem("apex_admin_token", response.data.token);
      localStorage.setItem(
        "apex_admin_user",
        JSON.stringify(response.data.admin),
      );
      setToken(response.data.token);
      setAdmin(response.data.admin);
    } catch (error) {
      setLoginError(
        apiError(
          error,
          otpSent
            ? "Unable to verify this code."
            : "Unable to send a verification code.",
        ),
      );
    } finally {
      setAuthBusy(false);
    }
  }

  if (!token)
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-hero">
          <header className="admin-auth-topbar">
            <Link className="brand" to="/">
              <span>APEX</span>
              <small>RN PREP</small>
            </Link>
          </header>

          <div className="admin-auth-copy">
            <Eyebrow>Admin workspace</Eyebrow>
            <h1>Welcome back.</h1>
            <p>Secure admin access protected by email verification.</p>
          </div>

          <div className="admin-auth-plant" aria-hidden="true">
            <svg viewBox="0 0 240 210">
              <path d="M95 175 C 92 145, 86 104, 98 70 C 110 44, 130 35, 145 34" />
              <path d="M98 77 C 88 95, 72 108, 47 119 C 64 116, 79 110, 90 100" />
              <path d="M110 62 C 126 57, 139 44, 154 23 C 151 45, 141 57, 124 68" />
              <path d="M118 86 C 135 86, 152 78, 171 62 C 164 83, 151 93, 130 100" />
              <path d="M91 118 C 82 128, 67 136, 48 145 C 61 145, 76 139, 86 128" />
              <path d="M96 154 C 118 152, 135 144, 153 127 C 149 145, 136 158, 113 164" />
            </svg>
          </div>
        </div>

        <main className="admin-auth-panel">
          <div className="admin-auth-panel-header">
            <span className="admin-auth-panel-rule" aria-hidden="true" />
            <span>Admin workspace</span>
          </div>

          <form className="admin-login" onSubmit={signIn}>
            <label className="admin-field">
              <span>Email</span>
              <div className="input-wrap">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  readOnly={otpSent}
                  required
                  placeholder="name@domain.com"
                />
              </div>
            </label>

            {otpSent ? (
              <label className="admin-field">
                <span>Verification code</span>
                <div className="input-wrap">
                  <Lock size={18} />
                  <input
                    autoFocus
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(event) =>
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    placeholder="Enter 6-digit code"
                  />
                </div>
                <small className="admin-otp-hint">
                  Sent to {otpDestination}. The code expires in 10 minutes.
                </small>
                <button
                  type="button"
                  className="admin-otp-back"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setOtpDestination("");
                    setLoginError("");
                    setLoginMessage("");
                  }}
                >
                  Back to sign in
                </button>
              </label>
            ) : (
              <label className="admin-field">
                <span>Password</span>
                <div className="input-wrap password-wrap">
                  <Lock size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="••••••••••"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}

            {!otpSent && (
              <div className="admin-login-meta">
                <label className="remember-me">
                  <input type="checkbox" defaultChecked />
                  <span className="checkmark" />
                  Remember me
                </label>
                <Link className="forgot-link" to="/admin/login">
                  Forgot password?
                </Link>
              </div>
            )}

            {loginMessage && <p className="admin-success">{loginMessage}</p>}
            {loginError && <p className="admin-error">{loginError}</p>}

            <button
              className="button admin-submit"
              type="submit"
              disabled={authBusy}
            >
              {authBusy
                ? otpSent
                  ? "Verifying..."
                  : "Sending code..."
                : otpSent
                  ? "Verify and sign in"
                  : "Send verification code"}
              <ArrowRight size={17} />
            </button>
          </form>
        </main>
      </div>
    );

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <aside>
          <div className="admin-sidebar-brand-wrap">
            <Link className="brand" to="/">
              <span>APEX</span>
              <small>RN PREP</small>
            </Link>
          </div>

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
      



          {active === "Overview" && (
            <div className="admin-hero-panel">
              <div className="admin-hero-copy">
                <Eyebrow>Admin dashboard</Eyebrow>
                <h1>Overview</h1>
                <p>Here&apos;s what&apos;s happening with your program.</p>
              </div>

              <div className="admin-hero-welcome">
                <span>Welcome back,</span>
                <strong>Admin</strong>
                <div className="admin-hero-rule" aria-hidden="true" />
              </div>
            </div>
          )}

         

          <div
            className={`admin-workspace${
              active === "Overview" ? " admin-workspace-overview" : ""
            }`}
          >
            <AdminView
              active={active}
              onNotice={setNotice}
              admin={admin}
              onAdminUpdate={(updatedAdmin, updatedToken) => {
                setAdmin(updatedAdmin);
                setToken(updatedToken);
              }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminView({ active, onNotice, admin, onAdminUpdate }) {
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
    case "Curriculum page":
      return <ProgramDetailsEditor onNotice={onNotice} />;
    case "Testimonials":
      return <TestimonialsEditor onNotice={onNotice} />;
    case "FAQs":
      return <FaqEditor onNotice={onNotice} />;
    case "Contact submissions":
      return <MessagesEditor />;
    case "Admin profile":
      return (
        <AdminProfileEditor admin={admin} onUpdate={onAdminUpdate} />
      );
    default:
      return null;
  }
}
