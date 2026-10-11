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
        {fields.map(([key, label, optional, control]) =>
          key === "video_url" ? (
            <VideoField
              key={key}
              label={label}
              value={value[key]}
              onChange={(next) => setValue({ ...value, [key]: next })}
            />
          ) : control?.type === "select" ? (
            <label key={key}>
              <span>{label}</span>
              <select
                value={value[key] ?? control.options[0][0]}
                onChange={(event) => {
                  setErrors({ ...errors, [key]: "" });
                  setValue({ ...value, [key]: event.target.value });
                }}
              >
                {control.options.map(([optionValue, optionLabel]) => (
                  <option key={optionValue} value={optionValue}>
                    {optionLabel}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label key={key} className={errors[key] ? "has-error" : ""}>
              <span>
                {label}
                {!optional && <em className="admin-required">*</em>}
              </span>
              {key === "story" || key === "answer" || key === "content" ? (
                <textarea
                  rows={3}
                  value={value[key] || ""}
                  onChange={(event) => {
                    setErrors({ ...errors, [key]: "" });
                    setValue({ ...value, [key]: event.target.value });
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={value[key] || ""}
                  onChange={(event) => {
                    setErrors({ ...errors, [key]: "" });
                    setValue({ ...value, [key]: event.target.value });
                  }}
                />
              )}
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
