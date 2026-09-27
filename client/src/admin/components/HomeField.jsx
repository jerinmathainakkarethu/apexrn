export default function HomeField({ label, value, onChange, multiline = false }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <label className="home-field">
      <span>{label}</span>
      <Tag
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
