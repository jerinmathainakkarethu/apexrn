import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import Eyebrow from "../ui/Eyebrow";

export default function QAModal({ status, setStatus, close }) {
  const [emailLink, setEmailLink] = useState("");

  return (
    <div className="modal-backdrop" onClick={close}>
      <form
        className="modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          const values = Object.fromEntries(
            new FormData(event.currentTarget).entries(),
          );
          const body = Object.entries(values)
            .map(([key, value]) => `${key}: ${value || "Not provided"}`)
            .join("\n");
          const href = `mailto:hello@apexrnprep.com?subject=${encodeURIComponent(
            "Free Wednesday Q&A registration",
          )}&body=${encodeURIComponent(body)}`;
          setEmailLink(href);
          setStatus("email");
          window.location.href = href;
        }}
      >
        <button type="button" className="modal-close" onClick={close}>
          <X />
        </button>
        <Eyebrow>Free Wednesday Q&A</Eyebrow>
        <h2>Reserve your place.</h2>
        <p>Bring your questions. We’ll bring a clear way forward.</p>
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
          <input name="whatsapp" required />
        </label>
        <label>
          NCLEX date
          <input name="nclex_date" type="date" />
        </label>
        {status === "email" && (
          <p>
            Your email app should open with your registration. If it does not,{" "}
            <a href={emailLink}>open the email here</a>.
          </p>
        )}
        <button className="button" type="submit">
          Open email to register <ArrowRight size={17} />
        </button>
      </form>
    </div>
  );
}