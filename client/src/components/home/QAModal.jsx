import { ArrowRight, X } from "lucide-react";
import { registerForQa } from "../../api/submissions";
import Eyebrow from "../ui/Eyebrow";

export default function QAModal({ status, setStatus, close }) {
  return (
    <div className="modal-backdrop" onClick={close}>
      <form
        className="modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={async (event) => {
          event.preventDefault();
          setStatus("loading");
          try {
            await registerForQa(
              Object.fromEntries(new FormData(event.currentTarget).entries()),
            );
            setStatus("success");
          } catch {
            setStatus("error");
          }
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
        {status === "success" ? (
          <p className="form-success">
            You’re registered. We’ll be in touch with the session details.
          </p>
        ) : (
          <button
            className="button"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Registering..." : "Register"}{" "}
            <ArrowRight size={17} />
          </button>
        )}
        {status === "error" && (
          <p className="form-error">
            We couldn’t complete that registration. Please try again.
          </p>
        )}
      </form>
    </div>
  );
}