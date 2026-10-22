import { useEffect, useState } from "react";
import "../styles/content-pages.css";
import PageFrame from "../components/layout/PageFrame";
import jotformConfig from "../config/jotform";
import Button from "../components/ui/Button";

const JOTFORM_EMBED_HANDLER =
  "https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js";

let embedHandlerPromise;

function loadJotformEmbedHandler() {
  if (window.jotformEmbedHandler) return Promise.resolve();
  if (embedHandlerPromise) return embedHandlerPromise;

  embedHandlerPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = JOTFORM_EMBED_HANDLER;
    script.async = true;
    script.onload = () => {
      if (window.jotformEmbedHandler) resolve();
      else reject(new Error("Jotform embed handler did not initialize."));
    };
    script.onerror = () => {
      embedHandlerPromise = null;
      reject(new Error("Jotform embed handler could not be loaded."));
    };
    document.head.appendChild(script);
  });

  return embedHandlerPromise;
}

export default function BookPage() {
  const [embedError, setEmbedError] = useState("");
  const formId =
    jotformConfig.formId || jotformConfig.url.split("/").filter(Boolean).pop();

  useEffect(() => {
    if (!jotformConfig.url || !formId) return undefined;
    let active = true;

    loadJotformEmbedHandler()
      .then(() => {
        if (active) {
          window.jotformEmbedHandler(
            `iframe[id='JotFormIFrame-${formId}']`,
            "https://form.jotform.com/",
          );
        }
      })
      .catch(() => {
        if (active) {
          setEmbedError(
            "The form could not be resized automatically. Open it directly to complete your registration.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, [formId]);

  return (
    <PageFrame
      eyebrow="Book / Register"
      title="Secure your spot"
      intro="Take the next step toward your NCLEX success. Complete the registration form and our team will help you get started."
      pageClassName="book-page"
    >
      <section className="content-page-grid book-page-grid">
        <article className="content-page-item book-page-item">
          {jotformConfig.url ? (
            <div className="book-form-card">
              <div className="book-form-heading">
                <span className="book-form-step">APEX RN PREP · REGISTRATION</span>
                <h2>Course registration and payment</h2>
                <p>
                  Fill in your details below to reserve your place. Your
                  information is sent securely through our registration form.
                </p>
              </div>
              <iframe
                id={`JotFormIFrame-${formId}`}
                title="APEX RN Prep Registration"
                src={jotformConfig.url}
                className="book-form-iframe"
                loading="lazy"
                scrolling="no"
                allow="payment"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
              {embedError && (
                <p className="book-form-error" role="alert">
                  {embedError}{" "}
                  <a href={jotformConfig.url} target="_blank" rel="noreferrer">
                    Open registration form
                  </a>
                  .
                </p>
              )}
              <p className="book-form-help">
                Need help with registration?{" "}
                <a href="/contact">Contact our team</a>.
              </p>
            </div>
          ) : (
            <div className="book-form-unavailable">
              <h2>Registration is temporarily unavailable</h2>
              <p>Please contact us and our team will help you register.</p>
              <div>
                <Button href="/contact">Contact us</Button>
              </div>
            </div>
          )}
        </article>
      </section>
    </PageFrame>
  );
}
