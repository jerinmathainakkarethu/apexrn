import "../styles/content-pages.css"; // must stay last
import resources from "../data/resources.json";
import PageFrame from "../components/layout/PageFrame";
import Button from "../components/ui/Button";
import Eyebrow from "../components/ui/Eyebrow";

export default function ResourcesPage() {
  return (
    <PageFrame
      eyebrow="Free resources"
      title="Make your next study session count."
      intro="Practical resources published by APEX RN Prep."
    >
      <section className="content-page-grid">
        {resources.length === 0 ? (
          <p>New study resources are in the works. Please check back soon.</p>
        ) : resources.map((item) => (
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