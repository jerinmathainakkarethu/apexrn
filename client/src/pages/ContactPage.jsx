import { useState } from "react";
import "../styles/contact.css";
import { ArrowRight, Mail, MessageCircle, User } from "lucide-react";
import PageFrame from "../components/layout/PageFrame";

const STEPS = ["Send your message", "We review it", "We get back to you"];

export default function ContactPage() {
  const [status, setStatus] = useState("idle");
  const [emailLink, setEmailLink] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const body = [
      `Name: ${values.name}`,
      `Email: ${values.email}`,
      `WhatsApp: ${values.whatsappNumber || "Not provided"}`,
      "",
      "Message:",
      values.message,
    ].join("\n");
    const href = `mailto:hello@apexrnprep.com?subject=${encodeURIComponent(
      "APEX RN Prep inquiry",
    )}&body=${encodeURIComponent(body)}`;
    setEmailLink(href);
    setStatus("email");
    window.location.href = href;
  }

  return (
    <PageFrame
      pageClassName="contact-page-shell blue-page-shell"
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
                placeholder="Your email address"
                required
              />
            </div>
          </div>

          <div className="contact-field contact-field-wide">
            <label htmlFor="contact-whatsapp">
              WhatsApp number <span>(optional)</span>
            </label>
            <div className="contact-control">
              <MessageCircle size={17} aria-hidden="true" />
              <input
                id="contact-whatsapp"
                name="whatsappNumber"
                type="tel"
                autoComplete="tel"
                placeholder="Your phone number"
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
            <button type="submit" className="button">
              Open email to send
              <ArrowRight size={17} />
            </button>

            <div aria-live="polite" className="contact-status">
              {status === "email" && (
                <p>
                  Your email app should open with your message. If it does not,{" "}
                  <a href={emailLink}>open the email here</a>.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </PageFrame>
  );
}
