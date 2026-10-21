import { useState } from "react";
import "../styles/contact.css";
import { ArrowRight, Check, Mail, MessageCircle, User, X } from "lucide-react";
import { submitContact } from "../api/submissions";
import PageFrame from "../components/layout/PageFrame";

const STEPS = ["Send your message", "We review it", "We get back to you"];

export default function ContactPage() {
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    // Grab the form now: event.currentTarget is null once we `await`,
    // so calling reset() on it after the request would throw.
    const form = event.currentTarget;
    setStatus("loading");
    setErrorMessage("");
    try {
      await submitContact(Object.fromEntries(new FormData(form).entries()));
      form.reset();
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
      setStatus("error");
    }
  }

  return (
    <PageFrame
      eyebrow="Start a conversation"
      title="Your NCLEX plan can start here."
      intro="Tell us where you are in your preparation and the APEX RN Prep team will be in touch."
    >
      <div className="contact-page">
        <ol className="contact-steps" aria-label="What happens next">
          {STEPS.map((step, index) => (
            <li key={step}>
              <span className="contact-step-num">{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>

        <form className="contact-page-form" onSubmit={handleSubmit}>
          <div className="contact-field">
            <label htmlFor="contact-name">Name *</label>
            <div className="contact-control">
              <User size={17} aria-hidden="true" />
              <input
                id="contact-name"
                name="name"
                autoComplete="name"
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div className="contact-field">
            <label htmlFor="contact-email">Email *</label>
            <div className="contact-control">
              <Mail size={17} aria-hidden="true" />
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="contact-field contact-field-wide">
            <label htmlFor="contact-whatsapp">
              WhatsApp <span>(optional)</span>
            </label>
            <div className="contact-control">
              <MessageCircle size={17} aria-hidden="true" />
              <input
                id="contact-whatsapp"
                name="whatsapp"
                type="tel"
                autoComplete="tel"
                placeholder="Include your country code"
              />
            </div>
          </div>

          <div className="contact-field contact-field-wide">
            <label htmlFor="contact-message">Message *</label>
            <div className="contact-control">
              <textarea
                id="contact-message"
                name="message"
                rows="6"
                placeholder="Where are you in your preparation, and how can we help?"
                required
              />
            </div>
          </div>

          <div className="contact-actions">
            <button
              type="submit"
              className="button"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Sending..." : "Send message"}
              <ArrowRight size={17} />
            </button>

            <div aria-live="polite" className="contact-status">
              {status === "success" && (
                <p className="form-success">
                  <span className="status-icon">
                    <Check size={14} />
                  </span>
                  Message received. We'll be in touch soon.
                </p>
              )}
              {status === "error" && (
                <p className="form-error">
                  <span className="status-icon">
                    <X size={14} />
                  </span>
                  {errorMessage}
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </PageFrame>
  );
}
