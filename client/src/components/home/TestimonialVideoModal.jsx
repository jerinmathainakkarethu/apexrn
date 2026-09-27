import { useEffect, useRef } from "react";
import { X, Play } from "lucide-react";

export default function TestimonialVideoModal({ testimonial, close }) {
  const backdropRef = useRef(null);
  const name = testimonial?.display_name || "APEX RN Prep student";
  const url = testimonial?.video_url || "";

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
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com") || parsed.hostname === "youtu.be") {
      const id =
        parsed.hostname === "youtu.be"
          ? parsed.pathname.slice(1)
          : parsed.searchParams.get("v");
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
