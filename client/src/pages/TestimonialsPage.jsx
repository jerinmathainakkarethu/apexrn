import "../styles/testimonials.css"; // must stay last
import {
  ArrowRight,
  EyeOff,
  Mail,
  MessageCircle,
} from "lucide-react";
import PageFrame from "../components/layout/PageFrame";
import Button from "../components/ui/Button";
import SectionTitle from "../components/ui/SectionTitle";
import Loading from "../components/ui/Loading";
import ErrorState from "../components/ui/ErrorState";
import useRemote from "../hooks/useRemote";
import { getTestimonialsPageSettings } from "../api/testimonials";
import { imageUrl } from "../services/api";

function isEmbeddableVideoUrl(url = "") {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}

function toEmbedUrl(url = "") {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtube.com/watch")) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtube.com/embed/")) return url;
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split(/[?&]/)[0];
      return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    return url;
  }
  return url;
}

function ScreenshotCard({ shot }) {
  const kind = shot.kind || "message";
  const isEmail = kind.toLowerCase() === "email";
  const Icon = isEmail ? Mail : MessageCircle;

  if (!shot.image && !shot.caption && !shot.kindLabel) return null;

  return (
    <figure className="tm-shot">
      {shot.image && (
        <div className={`tm-shot-frame tm-shot-frame-${kind}`}>
          <img
            className="tm-shot-image"
            src={imageUrl(shot.image)}
            alt={shot.alt || shot.kindLabel || kind}
            loading="lazy"
          />
        </div>
      )}
      <figcaption>
        {(shot.kindLabel || kind) && (
          <span className="tm-shot-kind">
            <Icon size={13} aria-hidden="true" />
            {shot.kindLabel || kind}
          </span>
        )}
        {shot.caption}
      </figcaption>
    </figure>
  );
}

export default function TestimonialsPage() {
  const pageSettings = useRemote(getTestimonialsPageSettings);
  const content = pageSettings && pageSettings !== false ? pageSettings : {};
  const isVisible = (key) => content.sectionVisibility?.[key] !== false;
  const beforeAfter = Array.isArray(content.beforeAfter)
    ? content.beforeAfter
    : [];
  const screenshots = Array.isArray(content.screenshots)
    ? content.screenshots
    : [];

  if (pageSettings === null)
    return (
      <PageFrame showHero={false}>
        <Loading />
      </PageFrame>
    );
  if (pageSettings === false)
    return (
      <PageFrame showHero={false}>
        <ErrorState />
      </PageFrame>
    );

  return (
    <PageFrame showHero={false}>
      <div className="tm">
        {isVisible("beforeAfter") && (
          <section
            className="tm-block section-tone-sage"
            aria-label={content.beforeAfterSection?.title || "Before and after"}
          >
            <SectionTitle
              eyebrow={content.beforeAfterSection?.eyebrow}
              copy={content.beforeAfterSection?.copy}
            >
              {content.beforeAfterSection?.title}
            </SectionTitle>

            <div className="tm-ba-list">
              {beforeAfter.map((item, index) => {
                if (!item.who && !item.before && !item.after && !item.video)
                  return null;
                return (
                  <article
                    className="tm-ba"
                    key={item.id || `before-after-${index}`}
                  >
                    {item.who && (
                      <span className="tm-ba-who">{item.who}</span>
                    )}
                    <div className="tm-ba-row">
                      <div className="tm-ba-side tm-ba-before">
                        {content.beforeAfterSection?.beforeLabel && (
                          <span>
                            {content.beforeAfterSection.beforeLabel}
                          </span>
                        )}
                        {item.before && <p>{item.before}</p>}
                      </div>
                      <span className="tm-ba-arrow" aria-hidden="true">
                        <ArrowRight size={20} />
                      </span>
                      <div className="tm-ba-side tm-ba-after">
                        {content.beforeAfterSection?.afterLabel && (
                          <span>
                            {content.beforeAfterSection.afterLabel}
                          </span>
                        )}
                        {item.video ? (
                          <div className="tm-ba-video-wrap">
                            <div className="tm-ba-video">
                              {isEmbeddableVideoUrl(item.video) ? (
                                <iframe
                                  src={toEmbedUrl(item.video)}
                                  title={`${item.who || "Student"} video testimonial`}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  loading="lazy"
                                />
                              ) : (
                                <video
                                  src={item.video}
                                  poster={
                                    item.videoPoster
                                      ? imageUrl(item.videoPoster)
                                      : undefined
                                  }
                                  controls
                                  preload="metadata"
                                />
                              )}
                            </div>
                            {item.after && (
                              <p className="tm-ba-video-caption">
                                {item.after}
                              </p>
                            )}
                          </div>
                        ) : (
                          item.after && <p>{item.after}</p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {isVisible("messages") && (
          <section
            className="tm-block section-tone-blush-2"
            aria-label={content.messagesSection?.title || "Student messages"}
          >
            <SectionTitle
              eyebrow={content.messagesSection?.eyebrow}
              copy={content.messagesSection?.copy}
            >
              {content.messagesSection?.title}
            </SectionTitle>

            <div className="tm-shot-grid">
              {screenshots.map((shot, index) => (
                <ScreenshotCard
                  shot={shot}
                  key={shot.id || `screenshot-${index}`}
                />
              ))}
            </div>

            {content.messagesSection?.privacyNote && (
              <p className="tm-privacy">
                <EyeOff size={15} aria-hidden="true" />
                {content.messagesSection.privacyNote}
              </p>
            )}
          </section>
        )}

        {isVisible("finalCta") && (
          <section className="final-cta">
            {content.finalCta?.eyebrow && (
              <p className="eyebrow">{content.finalCta.eyebrow}</p>
            )}
            {content.finalCta?.title && <h2>{content.finalCta.title}</h2>}
            {content.finalCta?.copy && <p>{content.finalCta.copy}</p>}
            <div className="button-row">
              {content.finalCta?.primary && (
                <Button href={content.finalCta.primaryHref || "#"}>
                  {content.finalCta.primary}
                </Button>
              )}
              {content.finalCta?.secondary && (
                <Button
                  secondary
                  href={content.finalCta.secondaryHref || "#"}
                >
                  {content.finalCta.secondary}
                </Button>
              )}
            </div>
          </section>
        )}
      </div>
    </PageFrame>
  );
}
