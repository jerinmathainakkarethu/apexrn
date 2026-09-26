import { getTestimonials } from "../api/testimonials";
import useRemote from "../hooks/useRemote";
import PageFrame from "../components/layout/PageFrame";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ErrorState from "../components/ui/ErrorState";
import Loading from "../components/ui/Loading";
import TestimonialSection from "../components/home/TestimonialSection";

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
      intro="Approved stories from the APEX RN Prep community. Each card plays on its own — select one to watch the full video testimonial."
    >
      <TestimonialSection testimonials={data} showHeading={false} />
    </PageFrame>
  );
}
