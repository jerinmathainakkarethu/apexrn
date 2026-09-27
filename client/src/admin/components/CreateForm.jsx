import { useState } from "react";
import { Plus } from "lucide-react";
import Eyebrow from "../../components/ui/Eyebrow";
import { validateFields } from "../lib/helpers";
import VideoField from "./VideoField";

export default function CreateForm({ title, value, setValue, fields, onSubmit }) {
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const submit = async () => {
    const nextErrors = validateFields(value, fields);
    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length) return;
    const result = await onSubmit();
    if (result?.error) setSubmitError(result.error);
  };
  return (
    <div className="admin-create">
      <Eyebrow>{title}</Eyebrow>
      <div className="admin-create-grid">
        {fields.map(([key, label, optional]) =>
          key === "video_url" ? (
            <VideoField
              key={key}
              label={label}
              value={value[key]}
              onChange={(next) => setValue({ ...value, [key]: next })}
            />
          ) : (
            <label key={key} className={errors[key] ? "has-error" : ""}>
              <span>
                {label}
                {!optional && <em className="admin-required">*</em>}
              </span>
              <textarea
                rows={
                  key === "story" || key === "answer" || key === "content"
                    ? 3
                    : 1
                }
                value={value[key] || ""}
                onChange={(event) => {
                  setErrors({ ...errors, [key]: "" });
                  setValue({ ...value, [key]: event.target.value });
                }}
              />
              {errors[key] && (
                <small className="admin-field-error">{errors[key]}</small>
              )}
            </label>
          ),
        )}
      </div>
      {submitError && <p className="admin-form-error">{submitError}</p>}
      <button type="button" className="button" onClick={submit}>
        <Plus size={16} />
        Create
      </button>
    </div>
  );
}
