import { ArrowRight } from "lucide-react";

export default function Button({ children, secondary = false, href = "#contact" }) {
  return (
    <a className={`button ${secondary ? "secondary" : ""}`} href={href}>
      {children}
      <ArrowRight size={17} />
    </a>
  );
}