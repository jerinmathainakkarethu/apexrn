import { useEffect } from "react";
import { createPortal } from "react-dom";
import { PlayCircle, X } from "lucide-react";
import { imageUrl } from "../../services/api";

const YOUTUBE =
  /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i;
const VIMEO = /vimeo\.com\/(?:video\/)?(\d+)/i;

export function resolveVideo(url) {
  const value = String(url || "").trim();
  if (!value) return null;
  const youtube = value.match(YOUTUBE);
  if (youtube) {
    return { type: "embed", src: `https://www.youtube.com/embed/${youtube[1]}` };
  }
  const vimeo = value.match(VIMEO);
  if (vimeo) {
    return { type: "embed", src: `https://player.vimeo.com/video/${vimeo[1]}` };
  }
  return { type: "file", src: imageUrl(value) };
}

export default function TestimonialVideoModal({ testimonial, close }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [close]);

  if (!testimonial) return null;
  const name = testimonial.display_name || "APEX RN Prep student";
  const source = resolveVideo(testimonial.video_url);
  const meta = [testimonial.result, testimonial.country]
    .filter(Boolean)
    .join(" · ");

  return createPortal(
    <div
      className="modal-backdrop testimonial-video-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Video testimonial from ${name}`}
      onClick={close}
    >
      <div className="testimonial-video-modal" onClick={(event) => event.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={close}
          aria-label="Close video"
        >
          <X />
        </button>
        <div className="testimonial-video-frame">
          {source ? (
            source.type === "embed" ? (
              <iframe
                src={`${source.src}?autoplay=1&rel=0`}
                title={`${name} video testimonial`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={source.src}
                poster={testimonial.photo_url ? imageUrl(testimonial.photo_url) : undefined}
                controls
                autoPlay
                playsInline
              />
            )
          ) : (
            <div className="testimonial-video-empty">
              <PlayCircle size={44} strokeWidth={1} />
              <p>Video coming soon.</p>
            </div>
          )}
        </div>
        <div className="testimonial-video-meta">
          <div className="stars" aria-label="Five stars">
            ★★★★★
          </div>
          <h2>{name}</h2>
          {meta && <span>{meta}</span>}
        </div>
      </div>
    </div>,
    document.body,
  );
}
