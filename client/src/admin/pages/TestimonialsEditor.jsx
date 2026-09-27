import {
  createTestimonial,
  deleteTestimonial,
  getAdminTestimonials,
  updateTestimonial,
} from "../../api/testimonials";
import { blankTestimonial } from "../lib/blankRecords";
import { useCollectionPage } from "../hooks/useCollectionPage";
import CreateForm from "../components/CreateForm";
import Collection from "../components/Collection";

const VISIBILITY = {
  type: "select",
  options: [
    ["published", "Published — visible on the site"],
    ["draft", "Draft — hidden from the site"],
  ],
};

export default function TestimonialsEditor({ onNotice }) {
  const page = useCollectionPage({
    load: getAdminTestimonials,
    create: createTestimonial,
    update: updateTestimonial,
    remove: deleteTestimonial,
    blank: blankTestimonial,
    onNotice,
  });

  if (page.loading)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <>
      <CreateForm
        title="Add testimonial"
        value={page.draft}
        setValue={page.setDraft}
        fields={[
          ["display_name", "Display name"],
          ["country", "Country"],
          ["story", "Story"],
          ["result", "Result"],
          ["video_url", "Video", true],
          ["status", "Visibility", true, VISIBILITY],
        ]}
        onSubmit={page.submit}
      />
      <Collection
        title="Testimonials"
        items={page.items}
        summaryKey="display_name"
        fields={[
          { key: "display_name", label: "Name" },
          { key: "country", label: "Country" },
          { key: "story", label: "Story" },
          { key: "result", label: "Result" },
          { key: "video_url", label: "Video", optional: true },
          { key: "status", label: "Visibility", optional: true, ...VISIBILITY },
        ]}
        onSave={page.saveItem}
        onDelete={page.deleteItem}
      />
    </>
  );
}
