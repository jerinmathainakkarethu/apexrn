import { getTestimonials } from "../api/testimonials";
import useRemote from "../hooks/useRemote";
import PageFrame from "../components/layout/PageFrame";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ErrorState from "../components/ui/ErrorState";
import Loading from "../components/ui/Loading";

export default function TestimonialsPage() {
  const data = useRemote(getTestimonials);
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
      eyebrow="Student stories"
      title="What our students say."
      intro="Approved stories from the APEX RN Prep community will appear here."
    >
      <section className="content-page-grid">
        {data.map((item) => (
          <article className="content-page-item" key={item.id}>
            <div className="stars">★★★★★</div>
            <p>{item.story}</p>
            <h2>{item.display_name}</h2>
            <span>{item.country}</span>
          </article>
        ))}
      </section>
    </PageFrame>
  );
}