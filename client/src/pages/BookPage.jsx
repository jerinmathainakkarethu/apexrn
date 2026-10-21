import { useState } from "react";
import "../styles/content-pages.css";
import PageFrame from "../components/layout/PageFrame";
import jotformConfig from "../config/jotform";
import Button from "../components/ui/Button";

export default function BookPage() {
  const [hasConfig, setHasConfig] = useState(Boolean(jotformConfig.url));
  return (
    <PageFrame
      eyebrow="Book / Register"
      title="Secure your spot"
      intro="Complete the form below to register for the program. If the form hasn't loaded yet or hasn't been configured, you'll see instructions below."
    >
      <section className="content-page-grid" style={{ gridTemplateColumns: "1fr" }}>
        <article className="content-page-item" style={{ maxWidth: "900px" }}>
          {hasConfig && jotformConfig.url ? (
            <div style={{ width: "100%", minHeight: "800px" }}>
              <iframe
                title="APEX RN Prep Registration"
                src={jotformConfig.url}
                style={{ width: "100%", height: "1200px", border: "0" }}
                allow="payment"
                allowFullScreen
              />
            </div>
          ) : (
            <div>
              <p style={{ marginBottom: "16px" }}>
                Jotform URL not configured. Set <strong>VITE_JOTFORM_URL</strong> in <code>client/.env</code> or update <code>client/src/config/jotform.js</code>.
              </p>
              <p style={{ marginBottom: "16px" }}>
                Required placeholders (provide these after creating your form):
              </p>
              <ul>
                <li>Jotform URL (embed URL / form URL)</li>
                <li>Form ID</li>
                <li>Field mappings (map your Jotform question names to: full_name, email, phone, whatsapp, course, payment_option, amount, currency)</li>
                <li>Webhook URL/secret (if using Jotform webhook to post to <code>POST /api/jotform/webhook</code>)</li>
                <li>Jotform API key (optional, for server-side retrieval)</li>
              </ul>
              <p style={{ marginTop: "16px" }}>
                Webhook endpoint (ready): <code>POST {window.location.origin.replace(":5173", ":5000")}/api/jotform/webhook</code> (or use your API base)
              </p>
              <div style={{ marginTop: "20px" }}>
                <Button href="/contact">Contact us</Button>
              </div>
            </div>
          )}
        </article>
      </section>
    </PageFrame>
  );
}
