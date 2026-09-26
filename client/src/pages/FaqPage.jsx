import { ArrowRight } from "lucide-react";
import { getFaqs } from "../api/faqs";
import useRemote from "../hooks/useRemote";
import PageFrame from "../components/layout/PageFrame";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ErrorState from "../components/ui/ErrorState";
import Loading from "../components/ui/Loading";

export default function FaqPage() {
  const data = useRemote(getFaqs);
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
      eyebrow="Questions, answered"
      title="A clearer way forward."
      intro="Find the practical details you need before you begin."
    >
      <section className="faq-page-list">
        {data.map((item) => (
          <details key={item.id}>
            <summary>
              {item.question}
              <ArrowRight size={17} />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </section>
    </PageFrame>
  );
}