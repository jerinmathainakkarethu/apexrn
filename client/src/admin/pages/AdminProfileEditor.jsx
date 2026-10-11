import { useState } from "react";
import { KeyRound, LoaderCircle, Mail, Save, X } from "lucide-react";
import Eyebrow from "../../components/ui/Eyebrow";
import { updateAdminProfile } from "../../api/auth";
import { apiError } from "../lib/helpers";

export default function AdminProfileEditor({ admin, onUpdate }) {
  const [email, setEmail] = useState(admin?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const passwordMismatch =
    Boolean(confirmPassword) && newPassword !== confirmPassword;
  const passwordTooShort = Boolean(newPassword) && newPassword.length < 8;

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setToast(null);

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!currentPassword) {
      setError("Enter your current password to confirm these changes.");
      return;
    }
    if (passwordTooShort) {
      setError("The new password must be at least 8 characters.");
      return;
    }
    if (passwordMismatch) {
      setError("The new passwords do not match.");
      return;
    }
    if (newPassword && !confirmPassword) {
      setError("Confirm your new password.");
      return;
    }

    setSaving(true);
    try {
      const response = await updateAdminProfile({
        email: email.trim(),
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      localStorage.setItem("apex_admin_token", response.data.token);
      localStorage.setItem(
        "apex_admin_user",
        JSON.stringify(response.data.admin),
      );
      onUpdate(response.data.admin, response.data.token);
      setEmail(response.data.admin.email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToast("Your admin profile was updated.");
    } catch (cause) {
      setError(apiError(cause, "Your profile could not be updated."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-profile-editor">
      <header className="admin-profile-heading">
        <Eyebrow>Account settings</Eyebrow>
        <h2>Admin profile</h2>
        <p>Update your sign-in email or choose a new password.</p>
      </header>

      <form className="admin-profile-form" onSubmit={saveProfile}>
        <label className="admin-profile-field">
          <span>Email address</span>
          <div>
            <Mail size={18} aria-hidden="true" />
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </label>

        <div className="admin-profile-divider">
          <KeyRound size={17} aria-hidden="true" />
          <span>Change password</span>
          <small>
            Leave the new password fields empty to keep your current one.
          </small>
        </div>

        <label className="admin-profile-field">
          <span>
            Current password <em>*</em>
          </span>
          <input
            autoComplete="current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>
        <div className="admin-profile-password-grid">
          <label className="admin-profile-field">
            <span>New password</span>
            <input
              autoComplete="new-password"
              type="password"
              minLength={8}
              value={newPassword}
              aria-invalid={passwordTooShort || passwordMismatch}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setError("");
              }}
            />
          </label>
          <label className="admin-profile-field">
            <span>Confirm new password</span>
            <input
              autoComplete="new-password"
              type="password"
              minLength={8}
              required={Boolean(newPassword)}
              value={confirmPassword}
              aria-invalid={passwordMismatch}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
            />
          </label>
        </div>
        {passwordTooShort && (
          <p className="admin-form-error" role="alert">
            The new password must be at least 8 characters.
          </p>
        )}
        {passwordMismatch && (
          <p className="admin-form-error" role="alert">
            The new passwords do not match.
          </p>
        )}

        {error && <p className="admin-form-error">{error}</p>}
        <div className="admin-profile-actions">
          <button type="submit" className="button" disabled={saving}>
            {saving ? (
              <LoaderCircle size={16} className="admin-save-spinner" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>

      {toast && (
        <div className="menu-toast" role="status" aria-live="polite">
          <span className="menu-toast-indicator" aria-hidden="true" />
          <span>{toast}</span>
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
