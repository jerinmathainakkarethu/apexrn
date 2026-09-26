import Eyebrow from "./Eyebrow";

export default function SectionTitle({ eyebrow, children, copy, dark = false }) {
  return (
    <div className={`section-title ${dark ? "dark" : ""}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2>{children}</h2>
      {copy && <p>{copy}</p>}
    </div>
  );
}