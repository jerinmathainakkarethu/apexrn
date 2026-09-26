import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <Link className="brand" to="/">
            <span>APEX</span>
            <small>RN PREP</small>
          </Link>
          <p>
            Prepare with structure.
            <br />
            Practice with purpose.
          </p>
        </div>
        <div className="footer-links">
          <div>
            <span>Explore</span>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/program">Program</Link>
            <Link to="/testimonials">Testimonials</Link>
            <Link to="/faqs">FAQs</Link>
            <Link to="/resources">Resources</Link>
          </div>
          <div>
            <span>Connect</span>
            <Link to="/contact">Book a conversation</Link>
            <a href="mailto:hello@apexrnprep.com">Email us</a>
            <a href="/contact">WhatsApp</a>
            <a href="/contact">
              <Instagram size={16} /> Instagram
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 APEX RN Prep</span>
        <span>Privacy · Terms · Refund policy</span>
      </div>
    </footer>
  );
}