import { useState } from "react";
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
import Collection from "../components/Collection";
import HomeSection from "../components/HomeSection";
import HomeField from "../components/HomeField";
import ImageField from "../components/ImageField";
import PageEditorShell from "../components/PageEditorShell";
import { useContentDocument } from "../lib/helpers";
import {
  ArrowRight,
  MessageCircle,
  Plus,
  Target,
  Trash2,
} from "lucide-react";

const VISIBILITY = {
  type: "select",
  options: [
    ["published", "Published — visible on the site"],
    ["draft", "Draft — hidden from the site"],
  ],
};

const TESTIMONIAL_FIELDS = [
  ["display_name", "Display name"],
  ["country", "Country"],
  ["story", "Story"],
  ["result", "Result"],
  ["video_url", "Video", true],
  ["status", "Visibility", true, VISIBILITY],
];

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
  const { content, update, updateItem, updateImage } = useContentDocument(
    settingsPage.value,
    settingsPage.setValue,
  );
  const [uploadError, setUploadError] = useState("");
  const removeItem = (path, index) => {
    const current = path.reduce((value, key) => value?.[key], content) || [];
    const next = [...current];
    next.splice(index, 1);
    update(path, next);
  };
  const addItem = (path, item) => {
    const current = path.reduce((value, key) => value?.[key], content) || [];
    update(path, [...current, item]);
  };
  const isVisible = (key) => content.sectionVisibility?.[key] !== false;
  const toggleVisibility = (key) =>
    update(["sectionVisibility", key], !isVisible(key));
  const switchProps = (key) => ({
    sectionKey: key,
    visible: isVisible(key),
    onToggle: toggleVisibility,
  });

  if (page.loading && !page.loaded)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error && !page.loaded)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <>
      <PageEditorShell
        eyebrow="Testimonials page builder"
        heading="Edit the final three testimonials sections"
        description="Manage the student stories, message screenshots, and closing call to action shown on the live page."
        saveLabel="Save testimonials page"
        successMessage="Testimonials page changes saved successfully."
        emptyTitle="Testimonials page"
        emptyMessage="Testimonials page settings could not be loaded. Check that the API server is running, then retry."
        hasContent={Object.keys(content).length > 0}
        loading={settingsPage.loading}
        onSave={settingsPage.commit}
        onRetry={settingsPage.refresh}
        toastOnSave
        uploadError={uploadError}
      >
        <HomeSection
          {...switchProps("beforeAfter")}
          number="01"
          icon={ArrowRight}
          title="Before and after"
          where="Section heading, before/after labels, and student stories with optional videos."
          preview={content.beforeAfterSection?.title}
        >
          <div className="home-field-grid">
            {[
              ["eyebrow", "Section eyebrow"],
              ["title", "Section heading"],
              ["copy", "Section description"],
              ["beforeLabel", "Before label"],
              ["afterLabel", "After label"],
            ].map(([field, label]) => (
              <HomeField
                key={`before-after-${field}`}
                label={label}
                value={content.beforeAfterSection?.[field]}
                onChange={(value) =>
                  update(["beforeAfterSection", field], value)
                }
                multiline={field === "copy"}
              />
            ))}
          </div>
          <div className="home-repeatable-grid">
            {(Array.isArray(content.beforeAfter) ? content.beforeAfter : []).map(
              (item, index) => (
                <div
                  className="home-repeatable"
                  key={item.id || `before-after-${index}`}
                >
                  <b>Student story {index + 1}</b>
                  {[
                    ["who", "Name / location"],
                    ["before", "Before"],
                    ["after", "After"],
                    ["video", "Video URL"],
                    ["videoPoster", "Video poster URL"],
                  ].map(([field, label]) => (
                    <HomeField
                      key={`before-after-${index}-${field}`}
                      label={label}
                      value={item[field]}
                      onChange={(value) =>
                        updateItem(["beforeAfter"], index, field, value)
                      }
                      multiline={field === "before" || field === "after"}
                    />
                  ))}
                  <button
                    type="button"
                    className="icon-danger"
                    aria-label={`Remove student story ${index + 1}`}
                    onClick={() => removeItem(["beforeAfter"], index)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ),
            )}
            <button
              type="button"
              className="admin-add-row"
              onClick={() =>
                addItem(["beforeAfter"], {
                  who: "",
                  before: "",
                  after: "",
                  video: "",
                  videoPoster: "",
                })
              }
            >
              <Plus size={15} />
              Add before/after story
            </button>
          </div>
        </HomeSection>
        <HomeSection
          {...switchProps("messages")}
          number="02"
          icon={MessageCircle}
          title="Student messages"
          where="Section heading, privacy note, and uploaded student message screenshots."
          preview={content.messagesSection?.title}
        >
          <div className="home-field-grid">
            {[
              ["eyebrow", "Section eyebrow"],
              ["title", "Section heading"],
              ["copy", "Section description"],
              ["privacyNote", "Privacy note"],
            ].map(([field, label]) => (
              <HomeField
                key={`messages-${field}`}
                label={label}
                value={content.messagesSection?.[field]}
                onChange={(value) =>
                  update(["messagesSection", field], value)
                }
                multiline={field === "copy" || field === "privacyNote"}
              />
            ))}
          </div>
          <div className="home-repeatable-grid">
            {(Array.isArray(content.screenshots) ? content.screenshots : []).map(
              (shot, index) => (
                <div
                  className="home-repeatable"
                  key={shot.id || `screenshot-${index}`}
                >
                  <b>Message {index + 1}</b>
                  <HomeField
                    label="Message type (e.g. WhatsApp, email)"
                    value={shot.kind}
                    onChange={(value) =>
                      updateItem(["screenshots"], index, "kind", value)
                    }
                  />
                  <HomeField
                    label="Type label"
                    value={shot.kindLabel}
                    onChange={(value) =>
                      updateItem(["screenshots"], index, "kindLabel", value)
                    }
                  />
                  <HomeField
                    label="Caption"
                    value={shot.caption}
                    onChange={(value) =>
                      updateItem(["screenshots"], index, "caption", value)
                    }
                    multiline
                  />
                  <ImageField
                    label="Message screenshot"
                    image={{ url: shot.image, alt: shot.alt }}
                    onChange={(image) =>
                      updateImage(
                        ["screenshots", index, "image"],
                        ["screenshots", index, "alt"],
                        image,
                      )
                    }
                    onError={setUploadError}
                  />
                  <button
                    type="button"
                    className="icon-danger"
                    aria-label={`Remove message ${index + 1}`}
                    onClick={() => removeItem(["screenshots"], index)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ),
            )}
            <button
              type="button"
              className="admin-add-row"
              onClick={() =>
                addItem(["screenshots"], {
                  kind: "",
                  kindLabel: "",
                  caption: "",
                  image: "",
                  alt: "",
                })
              }
            >
              <Plus size={15} />
              Add message screenshot
            </button>
          </div>
        </HomeSection>
        <HomeSection
          {...switchProps("finalCta")}
          number="03"
          icon={Target}
          title="Closing call to action"
          where="Closing call-to-action copy and both button labels and links."
          preview={content.finalCta?.title}
        >
          <div className="home-field-grid">
            {[
              ["eyebrow", "Eyebrow"],
              ["title", "Heading"],
              ["copy", "Supporting copy"],
              ["primary", "Primary button text"],
              ["primaryHref", "Primary button link"],
              ["secondary", "Secondary button text"],
              ["secondaryHref", "Secondary button link"],
            ].map(([field, label]) => (
              <HomeField
                key={`final-cta-${field}`}
                label={label}
                value={content.finalCta?.[field]}
                onChange={(value) => update(["finalCta", field], value)}
                multiline={field === "copy"}
              />
            ))}
          </div>
        </HomeSection>
      </PageEditorShell>
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
        draft={page.draft}
        blank={blankTestimonial}
        setDraft={page.setDraft}
        addFields={TESTIMONIAL_FIELDS}
        addLabel="Add testimonial"
        onAdd={page.submit}
        loading={page.loading}
        emptyMessage="No testimonials yet. Add your first one."
      />
    </>
  );
}
