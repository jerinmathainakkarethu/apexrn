import {
  createTestimonial,
  deleteTestimonial,
  getAdminTestimonials,
  getTestimonialsPageSettings,
  updateTestimonial,
  updateTestimonialsPageSettings,
} from "../../api/testimonials";
import { blankTestimonial } from "../lib/blankRecords";
import { useCollectionPage } from "../hooks/useCollectionPage";
import { usePageContent } from "../hooks/usePageContent";
import CreateForm from "../components/CreateForm";
import Collection from "../components/Collection";
import HomeSection from "../components/HomeSection";
import PageEditorShell from "../components/PageEditorShell";
import { useContentDocument } from "../lib/helpers";
import {
  ArrowRight,
  BookOpen,
  MessageCircle,
  MessageSquareQuote,
  Target,
} from "lucide-react";

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
  const settingsPage = usePageContent({
    load: getTestimonialsPageSettings,
    save: updateTestimonialsPageSettings,
    onNotice,
  });
  const { content, update } = useContentDocument(
    settingsPage.value,
    settingsPage.setValue,
  );
  const isVisible = (key) => content.sectionVisibility?.[key] !== false;
  const toggleVisibility = (key) =>
    update(["sectionVisibility", key], !isVisible(key));
  const switchProps = (key) => ({
    sectionKey: key,
    visible: isVisible(key),
    onToggle: toggleVisibility,
  });

  if (page.loading)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <>
      <PageEditorShell
        eyebrow="Testimonials page builder"
        heading="Show or hide testimonials page sections"
        description="Choose which sections appear on the live testimonials page, then save your changes."
        saveLabel="Save page sections"
        successMessage="Testimonials page visibility saved successfully."
        emptyTitle="Testimonials page"
        emptyMessage="Testimonials page settings could not be loaded. Check that the API server is running, then retry."
        hasContent={Object.keys(content).length > 0}
        loading={settingsPage.loading}
        onSave={settingsPage.commit}
        onRetry={settingsPage.refresh}
      >
        <HomeSection
          {...switchProps("hero")}
          number="01"
          icon={BookOpen}
          title="Page header"
          where="The title and introduction at the top of the testimonials page."
          preview="Testimonials & results"
        />
        <HomeSection
          {...switchProps("stories")}
          number="02"
          icon={MessageSquareQuote}
          title="Written stories"
          where="The student success-story cards."
          preview="From struggle to result"
        />
        <HomeSection
          {...switchProps("beforeAfter")}
          number="03"
          icon={ArrowRight}
          title="Before and after"
          where="The student progress stories and video testimonials."
          preview="The change in one line"
        />
        <HomeSection
          {...switchProps("messages")}
          number="04"
          icon={MessageCircle}
          title="Student messages"
          where="The screenshots of student messages and privacy note."
          preview="Messages from students"
        />
        <HomeSection
          {...switchProps("finalCta")}
          number="05"
          icon={Target}
          title="Closing call to action"
          where="The contact buttons at the bottom of the page."
          preview="Ready to reserve your spot?"
        />
      </PageEditorShell>
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
