import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { submitContact } from "../api/submissions";
import PageFrame from "../components/layout/PageFrame";

export default function ContactPage() {
  const [status, setStatus] = useState("idle");
  return (
    <PageFrame
      eyebrow="Start a conversation"
      title="Your NCLEX plan can start here."
      intro="Tell us where you are in your preparation and the APEX RN Prep team will be in touch."
    >
      <form
        className="contact-page-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setStatus("loading");
          try {
            await submitContact(
              Object.fromEntries(new FormData(event.currentTarget).entries()),
            );
            setStatus("success");
            event.currentTarget.reset();
          } catch {
            setStatus("error");
          }
        }}
      >
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" required />
        </label>
        <label>
          WhatsApp
          <input name="whatsapp" />
        </label>
        <label>
          Message
          <textarea name="message" rows="6" required />
        </label>
        <button className="button" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send message"}{" "}
          <ArrowRight size={17} />
        </button>
        {status === "success" && (
          <p className="form-success">
            <Check size={16} /> Message received.
          </p>
        )}
        {status === "error" && <p className="form-error">Please try again.</p>}
      </form>
    </PageFrame>
  );
}