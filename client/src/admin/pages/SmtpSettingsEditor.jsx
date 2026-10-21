import { useEffect, useState } from "react";
import { LoaderCircle, MailCheck, Save } from "lucide-react";
import Eyebrow from "../../components/ui/Eyebrow";
import {
  getIntegrationSettings,
  saveIntegrationSettings,
  sendSmtpTestEmail,
} from "../../api/admin";
import { apiError, sessionExpired } from "../lib/helpers";

function toFormValues(data) {
  return {
    ...data.smtp,
    port: data.smtp.port || 465,
    secure: Boolean(data.smtp.secure),
    password: "",
  };
}

export default function SmtpSettingsEditor() {
  const [values, setValues] = useState(null);
  const [clearPassword, setClearPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    getIntegrationSettings()
      .then(({ data }) => {
        if (active) setValues(toFormValues(data));
      })
      .catch((cause) => {
        if (!active) return;
        if (cause.response?.status === 401) return sessionExpired();
        setError(apiError(cause, "SMTP settings could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function update(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key === "password" && value) setClearPassword(false);
  }

  async function save(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setSaving(true);
    try {
      const { data } = await saveIntegrationSettings({
        smtp: values,
        clearSmtpPassword: clearPassword,
      });
      setValues(toFormValues(data));
      setClearPassword(false);
      setNotice("SMTP settings saved.");
    } catch (cause) {
      if (cause.response?.status === 401) return sessionExpired();
      setError(apiError(cause, "SMTP settings could not be saved."));
    } finally {
      setSaving(false);
    }
  }

  async function testEmail() {
    setError("");
    setNotice("");
    setTesting(true);
    try {
      const { data } = await sendSmtpTestEmail();
      setNotice(data.message);
    } catch (cause) {
      if (cause.response?.status === 401) return sessionExpired();
      setError(apiError(cause, "The test email could not be sent."));
    } finally {
      setTesting(false);
    }
  }

  if (loading) return <div className="admin-loading">Loading SMTP settings...</div>;
  if (!values) return <p className="admin-form-error">{error}</p>;

  return (
    <form className="integration-settings" onSubmit={save}>
      <div className="integration-settings-toolbar">
        <div>
          <Eyebrow>Account</Eyebrow>
          <h2>Email settings</h2>
          <p>
            Configure SMTP delivery for contact notifications and admin
            verification codes.
          </p>
        </div>
        <button className="button" type="submit" disabled={saving || testing}>
          {saving ? (
            <LoaderCircle size={17} className="admin-save-spinner" />
          ) : (
            <Save size={17} />
          )}
          {saving ? "Saving..." : "Save settings"}
        </button>
      </div>

      {error && <p className="admin-form-error">{error}</p>}
      {notice && <p className="admin-form-success">{notice}</p>}

      <section className="integration-settings-card">
        <div className="integration-settings-card-heading">
          <div>
            <Eyebrow>Mail delivery</Eyebrow>
            <h3>SMTP configuration</h3>
            <p>
              Passwords are never shown after saving. Leave the password blank
              to keep the existing one. Save changes before sending a test email.
            </p>
          </div>
          <button
            className="button integration-test-button"
            type="button"
            onClick={testEmail}
            disabled={saving || testing}
          >
            {testing ? (
              <LoaderCircle size={16} className="admin-save-spinner" />
            ) : (
              <MailCheck size={16} />
            )}
            {testing ? "Sending..." : "Send test email"}
          </button>
        </div>

        <div className="integration-settings-grid">
          <label>
            SMTP host
            <input
              required
              value={values.host || ""}
              onChange={(event) => update("host", event.target.value)}
              placeholder="smtp.gmail.com"
            />
          </label>
          <label>
            Port
            <input
              required
              type="number"
              min="1"
              max="65535"
              value={values.port}
              onChange={(event) => update("port", event.target.value)}
            />
          </label>
          <label>
            SMTP username
            <input
              required
              autoComplete="username"
              value={values.user || ""}
              onChange={(event) => update("user", event.target.value)}
              placeholder="mailbox@example.com"
            />
          </label>
          <label>
            Sender email
            <input
              required
              type="email"
              value={values.from || ""}
              onChange={(event) => update("from", event.target.value)}
              placeholder="mailbox@example.com"
            />
          </label>
          <label className="integration-settings-wide">
            SMTP password / app password
            <input
              type="password"
              autoComplete="new-password"
              value={values.password}
              onChange={(event) => update("password", event.target.value)}
              placeholder={
                values.passwordConfigured
                  ? "Saved. Enter a new value to replace it."
                  : "Enter SMTP password or app password"
              }
            />
          </label>
          <label className="integration-settings-checkbox">
            <input
              type="checkbox"
              checked={values.secure}
              onChange={(event) => update("secure", event.target.checked)}
            />
            Use secure TLS connection
          </label>
          {values.passwordConfigured && (
            <label className="integration-settings-checkbox">
              <input
                type="checkbox"
                checked={clearPassword}
                onChange={(event) => setClearPassword(event.target.checked)}
              />
              Remove saved SMTP password
            </label>
          )}
        </div>
      </section>
    </form>
  );
}
