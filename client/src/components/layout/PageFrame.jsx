import Header from "./Header";
import Footer from "./Footer";
import Eyebrow from "../ui/Eyebrow";

export default function PageFrame({ eyebrow, title, intro, children }) {
  return (
    <>
      <Header />
      <main>
        <section className="page-hero">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1>{title}</h1>
          <p>{intro}</p>
        </section>
        {children}
      </main>
      <Footer />
    </>
  );
}