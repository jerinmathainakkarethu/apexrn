import { useState } from "react";
import { uploadImage } from "../../api/admin";
import { imageUrl } from "../../services/api";
import { apiError } from "../lib/helpers";
import HomeField from "./HomeField";

export default function ImageField({ label, image, onChange, onError }) {
  const [uploading, setUploading] = useState(false);
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadImage(file);
      onChange({ ...image, url: response.data.url });
    } catch (error) {
      onError(apiError(error, "The image could not be uploaded."));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }
  return (
    <div className="home-image-field">
      <HomeField
        label={`${label} URL`}
        value={image?.url}
        onChange={(url) => onChange({ ...image, url })}
      />
      <HomeField
        label="Alt text"
        value={image?.alt}
        onChange={(alt) => onChange({ ...image, alt })}
      />
      <label className="home-upload-button">
        <span>{uploading ? "Uploading..." : "Upload image"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={upload}
          disabled={uploading}
        />
      </label>
      {image?.url && (
        <img
          className="home-image-preview"
          src={imageUrl(image.url)}
          alt={image.alt || "Preview"}
        />
      )}
    </div>
  );
}
