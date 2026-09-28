import { getResources } from "../api/resources";
import "../styles/content-pages.css"; // must stay last
import useRemote from "../hooks/useRemote";
import PageFrame from "../components/layout/PageFrame";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Button from "../components/ui/Button";
import ErrorState from "../components/ui/ErrorState";
import Eyebrow from "../components/ui/Eyebrow";
import Loading from "../components/ui/Loading";

export default function ResourcesPage() {
  const data = useRemote(getResources);
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
      eyebrow="Free resources"
      title="Make your next study session count."
      intro="Practical resources published by APEX RN Prep."
    >
      <section className="content-page-grid">
        {data.map((item) => (
          <article className="content-page-item" key={item.id}>
            <Eyebrow>{item.status}</Eyebrow>
            <h2>{item.title}</h2>
            <p>{item.excerpt}</p>
            <Button href={`/resources/${item.slug}`}>Read resource</Button>
          </article>
        ))}
      </section>
    </PageFrame>
  );
}