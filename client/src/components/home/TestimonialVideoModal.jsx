import { useEffect, useRef } from "react";
import { X, Play } from "lucide-react";
import { imageUrl } from "../../services/api";

export default function TestimonialVideoModal({ testimonial, close }) {
  const backdropRef = useRef(null);
  const name = testimonial?.display_name || "APEX RN Prep student";
  const url = imageUrl(testimonial?.video_url || "");

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [close]);

  const onBackdropClick = (event) => {
    if (event.target === backdropRef.current) close();
  };

  const isDirectFile = /\.(mp4|webm|mov|mkv)$/i.test(url) || url.startsWith("/uploads/");
  const embedUrl = toEmbedUrl(url);

  return (
    <div
      className="testimonial-video-backdrop modal-backdrop"
      ref={backdropRef}
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={`${name}'s story`}
    >
      <div className="testimonial-video-modal">
        <button
          type="button"
          className="modal-close testimonial-video-close"
          onClick={close}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="testimonial-video-frame">
          {url ? (
            isDirectFile ? (
              <video src={url} controls autoPlay playsInline />
            ) : embedUrl ? (
              <iframe
                src={embedUrl}
                title={`${name}'s video testimonial`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <VideoEmpty />
            )
          ) : (
            <VideoEmpty />
          )}
        </div>

        <div className="testimonial-video-meta">
          <div className="stars" aria-label="Five stars">
            ★★★★★
          </div>
          <h2>{name}</h2>
          <span>{testimonial?.country || "APEX RN Prep student story"}</span>
          {testimonial?.story && (
            <p className="testimonial-video-result">{testimonial.story}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function VideoEmpty() {
  return (
    <div className="testimonial-video-empty">
      <Play size={28} />
      <p>Video coming soon</p>
    </div>
  );
}

function toEmbedUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  // Admins often paste a bare ID, or a link without a protocol.
  if (/^[\w-]{11}$/.test(trimmed))
    return `https://www.youtube.com/embed/${trimmed}?autoplay=1`;
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (/(^|\.)(youtube\.com|youtu\.be|youtube-nocookie\.com)$/i.test(parsed.hostname)) {
      const id = youtubeId(parsed);
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : "";
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : "";
    }
    return url;
  } catch {
    return "";
  }
}

/** Handles /watch?v=, /shorts/, /embed/, /live/ and youtu.be links alike. */
function youtubeId(parsed) {
  const parts = parsed.pathname.split("/").filter(Boolean);
  if (/(^|\.)youtu\.be$/i.test(parsed.hostname)) return parts[0] || "";
  if (["shorts", "embed", "live", "v"].includes(parts[0]?.toLowerCase()))
    return parts[1] || "";
  return parsed.searchParams.get("v") || "";
}
