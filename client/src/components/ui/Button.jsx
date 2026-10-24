import { ArrowRight } from "lucide-react";

export default function Button({ children, secondary = false, href = "#", target = "_self" }) {
  return (
    <a className={`button ${secondary ? "secondary" : ""}`} href={href} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined}>
      {children}
      <ArrowRight size={17} />
    </a>
  );
}