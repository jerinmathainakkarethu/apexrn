import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Instagram,
  Mail,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link className="site-footer-wordmark" to="/" aria-label="APEX RN Prep home">
            <span>APEX</span>
            <small>RN PREP</small>
          </Link>
          <p className="site-footer-manifesto">
            Prepare with structure.
            <br />
            <em>Practice with purpose.</em>
          </p>
          <p className="site-footer-note">
            Thoughtful support for your NCLEX-RN journey.
          </p>
        </div>

        <nav className="site-footer-nav" aria-label="Footer navigation">
          <div className="site-footer-column">
            <span className="site-footer-label">Explore</span>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/curriculum">Curriculum</Link>
            <Link to="/testimonials">Testimonials</Link>
            <Link to="/faqs">FAQs</Link>
            <Link to="/resources">Resources</Link>
          </div>
          <div className="site-footer-column">
            <span className="site-footer-label">Connect</span>
            <Link to="/contact">
              <MessageCircle size={15} aria-hidden="true" />
              Book a conversation
              <ArrowUpRight className="site-footer-link-arrow" size={13} aria-hidden="true" />
            </Link>
            <a href="mailto:hello@apexrnprep.com">
              <Mail size={15} aria-hidden="true" />
              Email us
              <ArrowUpRight className="site-footer-link-arrow" size={13} aria-hidden="true" />
            </a>
            <a href="/contact">
              <MessageCircle size={15} aria-hidden="true" />
              WhatsApp
              <ArrowUpRight className="site-footer-link-arrow" size={13} aria-hidden="true" />
            </a>
            <a href="/contact">
              <Instagram size={15} aria-hidden="true" />
              Instagram
              <ArrowUpRight className="site-footer-link-arrow" size={13} aria-hidden="true" />
            </a>
          </div>
        </nav>
      </div>

      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} APEX RN Prep</span>
        <span className="site-footer-legal">Prepare with structure. Practice with purpose.</span>
        <Link to="/contact">Get in touch <ArrowUpRight size={13} aria-hidden="true" /></Link>
      </div>
    </footer>
  );
}