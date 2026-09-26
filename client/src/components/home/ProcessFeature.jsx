import { useEffect, useState } from "react";
import { imageUrl } from "../../services/api";
import SectionTitle from "../ui/SectionTitle";
import Button from "../ui/Button";

export default function ProcessFeature({ content }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = content.editorial.processImages || [];
  useEffect(() => {
    if (images.length < 2) return undefined;
    const timer = window.setInterval(
      () => setActiveImage((current) => (current + 1) % images.length),
      2000,
    );
    return () => window.clearInterval(timer);
  }, [images.length]);
  return (
    <section className="editorial-process">
      <div className="editorial-process-image">
        {images.map((image, index) => (
          <img
            className={index === activeImage ? "active" : ""}
            key={image.url}
            src={imageUrl(image.url)}
            alt={image.alt}
          />
        ))}
        <div className="editorial-process-overlay">
          {content.editorial.processOverlayTitle}
        </div>
      </div>
      <div className="editorial-process-copy">
        <SectionTitle eyebrow={content.editorial.processEyebrow}>
          {content.editorial.processTitle}
        </SectionTitle>
        <p>{content.editorial.processCopy}</p>
        <ul className="editorial-list">
          {content.process.items.slice(0, 2).map((item) => (
            <li key={item.title}>
              {item.title}: {item.text}
            </li>
          ))}
        </ul>
        <Button>{content.editorial.processButton}</Button>
      </div>
    </section>
  );
}