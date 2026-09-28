import { getProgram } from "../api/program";
import "../styles/content-pages.css"; // must stay last
import useRemote from "../hooks/useRemote";
import PageFrame from "../components/layout/PageFrame";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import Loading from "../components/ui/Loading";

export default function ProgramPage() {
  const data = useRemote(getProgram);
  if (data === null)
    return (
      <>
        <Header />
        <Loading />
        <Footer />
      </>
    );
  if (data === false)
    return (
      <>
        <Header />
        <ErrorState />
        <Footer />
      </>
    );
  return (
    <PageFrame
      eyebrow="The program"
      title="An 11-week plan you can trust."
      intro="Live online preparation, organized week by week from fundamentals to clinical judgment."
    >
      <section className="content-page-grid">
        {data.map((week) => (
          <article className="content-page-item" key={week.id}>
            <span>{week.week_number}</span>
            <h2>{week.title}</h2>
            <p>
              {week.description ||
                "Focused teaching, guided practice, and clear next steps."}
            </p>
            <Button href="#contact">Explore this week</Button>
          </article>
        ))}
      </section>
    </PageFrame>
  );
}