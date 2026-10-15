import { useState } from "react";
import { KeyRound, LoaderCircle, Mail, Save, ShieldCheck, X } from "lucide-react";
import Eyebrow from "../../components/ui/Eyebrow";
import {
  requestPasswordChangeOtp,
  updateAdminProfile,
  verifyPasswordChangeOtp,
} from "../../api/auth";
import { apiError } from "../lib/helpers";

export default function AdminProfileEditor({ admin, onUpdate }) {
  const [email, setEmail] = useState(admin?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDestination, setOtpDestination] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [toast, setToast] = useState(null);
  const [emailSaving, setEmailSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const passwordMismatch =
    Boolean(confirmPassword) && newPassword !== confirmPassword;
  const passwordTooShort = Boolean(newPassword) && newPassword.length < 8;

  const saveEmail = async (event) => {
    event.preventDefault();
    setEmailError("");
    setToast(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (!currentPassword) {
      setEmailError("Enter your current password to confirm the email change.");
      return;
    }

    setEmailSaving(true);
    try {
      const response = await updateAdminProfile({
        email: email.trim(),
        currentPassword,
      });
      localStorage.setItem("apex_admin_token", response.data.token);
      localStorage.setItem(
        "apex_admin_user",
        JSON.stringify(response.data.admin),
      );
      onUpdate(response.data.admin, response.data.token);
      setEmail(response.data.admin.email);
      setCurrentPassword("");
      setToast("Your email address was updated.");
    } catch (cause) {
      setEmailError(
        apiError(cause, "Your email address could not be updated."),
      );
    } finally {
      setEmailSaving(false);
    }
  };

  const sendPasswordOtp = async () => {
    setPasswordError("");
    setToast(null);
    if (passwordTooShort) {
      setPasswordError("The new password must be at least 8 characters.");
      return;
    }
    if (!newPassword) {
      setPasswordError("Enter a new password.");
      return;
    }
    if (!confirmPassword) {
      setPasswordError("Re-enter the new password to confirm it.");
      return;
    }
    if (passwordMismatch) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await requestPasswordChangeOtp();
      setOtpSent(true);
      setOtpDestination(response.data.destination);
      setOtp("");
      setToast(response.data.message);
    } catch (cause) {
      setPasswordError(
        apiError(cause, "The verification code could not be sent."),
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setToast(null);
    if (!/^\d{6}$/.test(otp)) {
      setPasswordError("Enter the 6-digit verification code.");
      return;
    }
    if (passwordTooShort) {
      setPasswordError("The new password must be at least 8 characters.");
      return;
    }
    if (!newPassword || !confirmPassword || passwordMismatch) {
      setPasswordError(
        passwordMismatch
          ? "The new passwords do not match."
          : "Enter and confirm the new password.",
      );
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await verifyPasswordChangeOtp({
        code: otp,
        newPassword,
        confirmNewPassword: confirmPassword,
      });
      setOtpSent(false);
      setOtp("");
      setOtpDestination("");
      setNewPassword("");
      setConfirmPassword("");
      setToast(response.data.message);
    } catch (cause) {
      setPasswordError(apiError(cause, "The password could not be changed."));
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="admin-profile-editor">
      <header className="admin-profile-heading">
        <Eyebrow>Account settings</Eyebrow>
        <h2>Admin profile</h2>
        <p>Update your sign-in email or change your password securely.</p>
      </header>

      <form className="admin-profile-form" onSubmit={saveEmail}>
        <div className="admin-profile-section-heading">
          <Mail size={17} aria-hidden="true" />
          <h3>Email address</h3>
        </div>
        <label className="admin-profile-field">
          <span>Sign-in email</span>
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
        <label className="admin-profile-field">
          <span>Current password to confirm email change</span>
          <input
            autoComplete="current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>
        {emailError && <p className="admin-form-error">{emailError}</p>}
        <div className="admin-profile-actions">
          <button type="submit" className="button" disabled={emailSaving}>
            {emailSaving ? (
              <LoaderCircle size={16} className="admin-save-spinner" />
            ) : (
              <Save size={16} />
            )}
            {emailSaving ? "Saving..." : "Save email"}
          </button>
        </div>
      </form>

      <form
        className="admin-profile-form admin-password-change"
        onSubmit={(event) => {
          if (otpSent) changePassword(event);
          else {
            event.preventDefault();
            sendPasswordOtp();
          }
        }}
      >
        <div className="admin-profile-section-heading">
          <KeyRound size={17} aria-hidden="true" />
          <h3>Change password</h3>
        </div>
        <p className="admin-profile-help">
          Enter and confirm a new password. We’ll send a one-time code to{" "}
          <strong>{admin?.email}</strong>. Your current password is not required.
        </p>
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
                setPasswordError("");
              }}
              required
            />
          </label>
          <label className="admin-profile-field">
            <span>Re-enter new password</span>
            <input
              autoComplete="new-password"
              type="password"
              minLength={8}
              value={confirmPassword}
              aria-invalid={passwordMismatch}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setPasswordError("");
              }}
              required
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

        {otpSent && (
          <>
            <label className="admin-profile-field">
              <span>One-time verification code</span>
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                aria-describedby="admin-password-otp-hint"
              />
            </label>
            <small
              id="admin-password-otp-hint"
              className="admin-profile-help admin-profile-otp-hint"
            >
              Code sent to {otpDestination}. It expires in 10 minutes.
            </small>
          </>
        )}

        {passwordError && (
          <p className="admin-form-error" role="alert">
            {passwordError}
          </p>
        )}
        <div className="admin-profile-actions">
          <button
            type="submit"
            className="button"
            disabled={
              passwordSaving || passwordTooShort || passwordMismatch
            }
          >
            {passwordSaving ? (
              <LoaderCircle size={16} className="admin-save-spinner" />
            ) : otpSent ? (
              <ShieldCheck size={16} />
            ) : (
              <KeyRound size={16} />
            )}
            {passwordSaving
              ? otpSent
                ? "Updating..."
                : "Sending code..."
              : otpSent
                ? "Verify code and update password"
                : "Send verification code"}
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
