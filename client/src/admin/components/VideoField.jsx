import { useState } from "react";
import { uploadVideo } from "../../api/admin";
import { imageUrl } from "../../services/api";
import { apiError } from "../lib/helpers";

export default function VideoField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const response = await uploadVideo(file);
      onChange(response.data.url);
    } catch (uploadError) {
      setError(apiError(uploadError, "The video could not be uploaded."));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }
  return (
    <div className="admin-video-field">
      <label>
        {label}
        <textarea
          rows={1}
          value={value || ""}
          onChange={(event) => {
            setError("");
            onChange(event.target.value);
          }}
          placeholder="Paste a YouTube / Vimeo link, or upload a file"
          spellCheck="false"
        />
      </label>
      <label className="home-upload-button">
        <span>{uploading ? "Uploading..." : "Upload video"}</span>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
          onChange={upload}
          disabled={uploading}
        />
      </label>
      {error && <small className="admin-field-error">{error}</small>}
      {value?.startsWith("/uploads/") && (
        <video className="admin-video-preview" src={imageUrl(value)} controls />
      )}
    </div>
  );
}
