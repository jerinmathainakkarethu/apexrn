import { useState } from "react";
import { getAbout, updateAbout } from "../../api/about";
import { usePageContent } from "../hooks/usePageContent";
import {
  Award,
  BookOpen,
  Compass,
  Image as ImageIcon,
  ListChecks,
  MessageSquareQuote,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useContentDocument } from "../lib/helpers";
import HomeSection from "../components/HomeSection";
import HomeField from "../components/HomeField";
import ImageField from "../components/ImageField";
import PageEditorShell from "../components/PageEditorShell";

const ABOUT_SECTION_NAV = [
  { id: "about-header", label: "Page header" },
  { id: "about-story", label: "Your story" },
  { id: "about-philosophy", label: "Philosophy" },
  { id: "about-credentials", label: "Credentials" },
  { id: "about-principles", label: "Values" },
  { id: "about-images", label: "Images" },
  { id: "about-benefits", label: "Benefits" },
  { id: "about-video", label: "Video" },
  { id: "about-testimonials", label: "Testimonials" },
];

export default function AboutContentEditor({ onNotice }) {
  const page = usePageContent({
    load: getAbout,
    save: updateAbout,
    onNotice,
  });
  const { content, update, updateItem, updateList } = useContentDocument(
    page.value,
    page.setValue,
  );
  const [uploadError, setUploadError] = useState("");
  const removeItem = (path, index) => {
    const current = path.reduce((acc, key) => acc?.[key], content) || [];
    const next = [...current];
    next.splice(index, 1);
    update(path, next);
  };
  const addItem = (path, entry) => {
    const current = path.reduce((acc, key) => acc?.[key], content) || [];
    update(path, [...current, entry]);
  };

  return (
    <PageEditorShell
      eyebrow="About page builder"
      heading="Edit the about page, section by section"
      description="Sections below are in the same order they appear on the live about page. Open one, make your edits, then save once at the end."
      saveLabel="Save about page"
      successMessage="About page changes saved successfully."
      emptyTitle="About content"
      emptyMessage="The about content could not be loaded, so the inputs are unavailable. Check that the API server is running, then retry."
      hasContent={Object.keys(content).length > 0}
      loading={page.loading}
      onSave={page.commit}
      nav={ABOUT_SECTION_NAV}
      uploadError={uploadError}
      onRetry={page.refresh}
    >
      <HomeSection
        anchorId="about-header"
        number="01"
        icon={User}
        title="Page header"
        where="Eyebrow, page title and the search-engine description at the top of the about page."
        preview={content.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.eyebrow}
            onChange={(value) => update(["eyebrow"], value)}
          />
          <HomeField
            label="Page title"
            value={content.title}
            onChange={(value) => update(["title"], value)}
            multiline
          />
          <HomeField
            label="Intro (meta description)"
            value={content.intro}
            onChange={(value) => update(["intro"], value)}
            multiline
          />
        </div>
      </HomeSection>

      <HomeSection
        anchorId="about-story"
        number="02"
        icon={MessageSquareQuote}
        title="Your story"
        where="The first content block: your bedside and teaching background, and why you started APEX RN Prep. Shown with the instructor photo."
        preview={content.sectionTitle}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.sectionEyebrow}
            onChange={(value) => update(["sectionEyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.sectionTitle}
            onChange={(value) => update(["sectionTitle"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Story copy"
          value={content.copy}
          onChange={(value) => update(["copy"], value)}
          multiline
        />
        <HomeField
          label="Second paragraph (why you started, who it is for)"
          value={content.copySecondary}
          onChange={(value) => update(["copySecondary"], value)}
          multiline
        />
      </HomeSection>

      <HomeSection
        anchorId="about-philosophy"
        number="03"
        icon={BookOpen}
        title="Teaching philosophy"
        where="The four teaching principles, shown as a row of cards under the story."
        preview={content.philosophy?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.philosophy?.eyebrow}
            onChange={(value) => update(["philosophy", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.philosophy?.title}
            onChange={(value) => update(["philosophy", "title"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Copy"
          value={content.philosophy?.copy}
          onChange={(value) => update(["philosophy", "copy"], value)}
          multiline
        />
        <div className="home-repeatable-grid">
          {(content.philosophy?.items || []).map((item, index) => (
            <div className="home-repeatable" key={`about-philosophy-${index}`}>
              <b>Principle {index + 1}</b>
              <HomeField
                label="Title"
                value={item.title}
                onChange={(value) =>
                  updateItem(["philosophy", "items"], index, "title", value)
                }
              />
              <HomeField
                label="Copy"
                value={item.copy}
                onChange={(value) =>
                  updateItem(["philosophy", "items"], index, "copy", value)
                }
                multiline
              />
              <button
                type="button"
                className="icon-danger"
                aria-label={`Remove principle ${index + 1}`}
                onClick={() => removeItem(["philosophy", "items"], index)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add-row"
            onClick={() =>
              addItem(["philosophy", "items"], { title: "", copy: "" })
            }
          >
            <Plus size={15} />
            Add principle
          </button>
        </div>
      </HomeSection>

      <HomeSection
        anchorId="about-credentials"
        number="04"
        icon={Award}
        title="Credentials"
        where="The four credential cards: license states, certifications, years teaching, students taught."
        preview={(content.credentials?.items || [])
          .map((item) => item.label)
          .join(" / ")}
      >
        <p className="home-section-note">
          Placeholder data. Replace every value with your verified professional
          details before the page goes live.
        </p>
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.credentials?.eyebrow}
            onChange={(value) => update(["credentials", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.credentials?.title}
            onChange={(value) => update(["credentials", "title"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Copy"
          value={content.credentials?.copy}
          onChange={(value) => update(["credentials", "copy"], value)}
          multiline
        />
        <div className="home-repeatable-grid">
          {(content.credentials?.items || []).map((item, index) => (
            <div className="home-repeatable" key={`about-credential-${index}`}>
              <b>Credential {index + 1}</b>
              <HomeField
                label="Value"
                value={item.value}
                onChange={(value) =>
                  updateItem(["credentials", "items"], index, "value", value)
                }
              />
              <HomeField
                label="Label"
                value={item.label}
                onChange={(value) =>
                  updateItem(["credentials", "items"], index, "label", value)
                }
              />
              <button
                type="button"
                className="icon-danger"
                aria-label={`Remove credential ${index + 1}`}
                onClick={() => removeItem(["credentials", "items"], index)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add-row"
            onClick={() =>
              addItem(["credentials", "items"], { value: "", label: "" })
            }
          >
            <Plus size={15} />
            Add credential
          </button>
        </div>
      </HomeSection>

      <HomeSection
        anchorId="about-principles"
        number="05"
        icon={Compass}
        title="Values"
        where="The values list that closes the page. Keep it professional; add a faith line here only if you want one."
        preview={content.principles?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.principles?.eyebrow}
            onChange={(value) => update(["principles", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.principles?.title}
            onChange={(value) => update(["principles", "title"], value)}
            multiline
          />
        </div>
        <div className="home-repeatable-grid">
          {(content.principles?.items || []).map((item, index) => (
            <div className="home-repeatable" key={`about-principle-${index}`}>
              <b>Value {index + 1}</b>
              <HomeField
                label="Title"
                value={item.title}
                onChange={(value) =>
                  updateItem(["principles", "items"], index, "title", value)
                }
              />
              <HomeField
                label="Copy"
                value={item.copy}
                onChange={(value) =>
                  updateItem(["principles", "items"], index, "copy", value)
                }
                multiline
              />
              <button
                type="button"
                className="icon-danger"
                aria-label={`Remove value ${index + 1}`}
                onClick={() => removeItem(["principles", "items"], index)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add-row"
            onClick={() =>
              addItem(["principles", "items"], { title: "", copy: "" })
            }
          >
            <Plus size={15} />
            Add value
          </button>
        </div>
      </HomeSection>

      <HomeSection
        anchorId="about-images"
        number="06"
        icon={ImageIcon}
        title="Images"
        where="The two stacked photos in the benefits block, plus the main instructor photo."
        preview={content.imageAlt}
      >
        <ImageField
          label="Instructor photo"
          image={{ url: content.image, alt: content.imageAlt }}
          onChange={(image) => {
            update(["image"], image.url);
            update(["imageAlt"], image.alt);
          }}
          onError={setUploadError}
        />
        <div className="home-repeatable-grid">
          {(content.images || []).map((item, index) => (
            <div className="home-repeatable" key={`about-image-${index}`}>
              <b>Photo {index + 1}</b>
              <ImageField
                label={`Photo ${index + 1}`}
                image={item}
                onChange={(image) => {
                  const next = [...(content.images || [])];
                  next[index] = image;
                  update(["images"], next);
                }}
                onError={setUploadError}
              />
            </div>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        anchorId="about-benefits"
        number="07"
        icon={ListChecks}
        title="Key benefits"
        where="The 'Key benefits' block with the tick list and Learn more button."
        preview={content.benefits?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.benefits?.eyebrow}
            onChange={(value) => update(["benefits", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.benefits?.title}
            onChange={(value) => update(["benefits", "title"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Copy"
          value={content.benefits?.copy}
          onChange={(value) => update(["benefits", "copy"], value)}
          multiline
        />
        <HomeField
          label="Tick list (one per line)"
          value={(content.benefits?.items || []).join("\n")}
          onChange={(value) => updateList(["benefits", "items"], value)}
          multiline
        />
        <HomeField
          label="Button text"
          value={content.benefits?.button}
          onChange={(value) => update(["benefits", "button"], value)}
        />
      </HomeSection>

      <HomeSection
        anchorId="about-video"
        number="08"
        icon={Search}
        title="Video banner"
        where="The wide banner with the play button in the middle of the about page."
        preview={content.video?.buttonLabel}
      >
        <ImageField
          label="Video banner image"
          image={{ url: content.video?.image, alt: content.video?.alt }}
          onChange={(image) => {
            update(["video", "image"], image.url);
            update(["video", "alt"], image.alt);
          }}
          onError={setUploadError}
        />
        <HomeField
          label="Play button label"
          value={content.video?.buttonLabel}
          onChange={(value) => update(["video", "buttonLabel"], value)}
        />
      </HomeSection>

      <HomeSection
        anchorId="about-testimonials"
        number="09"
        icon={MessageSquareQuote}
        title="Testimonials heading"
        where="The heading above the two student quotes. The quotes themselves come from the Testimonials tab."
        preview={content.testimonials?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.testimonials?.eyebrow}
            onChange={(value) => update(["testimonials", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.testimonials?.title}
            onChange={(value) => update(["testimonials", "title"], value)}
            multiline
          />
          <HomeField
            label="Default role / country"
            value={content.testimonials?.defaultRole}
            onChange={(value) => update(["testimonials", "defaultRole"], value)}
          />
        </div>
      </HomeSection>
    </PageEditorShell>
  );
}
