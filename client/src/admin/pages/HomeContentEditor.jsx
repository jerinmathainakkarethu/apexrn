import { useState } from "react";
import { getHome, updateHome } from "../../api/home";
import { usePageContent } from "../hooks/usePageContent";
import {
  CalendarClock,
  GalleryHorizontalEnd,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  ListChecks,
  MessagesSquare,
  Megaphone,
  Search,
  Tag,
  User,
  Users,
  Workflow,
} from "lucide-react";
import { useContentDocument } from "../lib/helpers";
import HomeSection from "../components/HomeSection";
import HomeField from "../components/HomeField";
import ImageField from "../components/ImageField";
import PageEditorShell from "../components/PageEditorShell";

const HOME_SECTION_NAV = [
  { id: "sec-seo", label: "SEO" },
  { id: "sec-hero", label: "Hero" },
  { id: "sec-snapshot", label: "Snapshot" },
  { id: "sec-audience", label: "Who it's for" },
  { id: "sec-curriculum", label: "Curriculum" },
  { id: "sec-instructor", label: "Instructor" },
  { id: "sec-process", label: "How it works" },
  { id: "sec-gallery", label: "Gallery" },
  { id: "sec-testimonials", label: "Testimonials" },
  { id: "sec-community", label: "Community" },
  { id: "sec-qa", label: "Q&A" },
  { id: "sec-faq", label: "FAQ" },
  { id: "sec-pricing", label: "Pricing" },
];

export default function HomeContentEditor({ onNotice }) {
  const page = usePageContent({
    load: getHome,
    save: updateHome,
    onNotice,
  });
  const { content, update, updateItem, updateList, updateImage } =
    useContentDocument(page.value, page.setValue);
  const [uploadError, setUploadError] = useState("");
  const imageError = (message) => setUploadError(message);
  const isVisible = (key) => content.sectionVisibility?.[key] !== false;
  const toggleVisibility = (key) =>
    update(["sectionVisibility", key], !isVisible(key));
  const switchProps = (key) => ({
    sectionKey: key,
    visible: isVisible(key),
    onToggle: toggleVisibility,
  });

  return (
    <PageEditorShell
      eyebrow="Homepage builder"
      heading="Edit the home page, section by section"
      description="Sections below are in the same order they appear on the live page. Open one, make your edits, then save once at the end."
      note="The switch on each section shows or hides that section on the live home page. Flip as many as you like, then press Save homepage."
      saveLabel="Save homepage"
      successMessage="Homepage changes saved successfully."
      emptyTitle="Homepage content"
      emptyMessage="The homepage content could not be loaded, so the section inputs are unavailable. Check that the API server is running, then retry."
      hasContent={Object.keys(content).length > 0}
      loading={page.loading}
      onSave={page.commit}
      nav={HOME_SECTION_NAV}
      uploadError={uploadError}
      onRetry={page.refresh}
    >
      <HomeSection
        anchorId="sec-seo"
        number="01"
        icon={Search}
        title="SEO"
        where="Browser tab title and search-engine description. Not visible on the page itself."
        preview={content.seo?.title}
        defaultOpen
      >
        <div className="home-field-grid">
          <HomeField
            label="SEO title"
            value={content.seo?.title}
            onChange={(value) => update(["seo", "title"], value)}
          />
          <HomeField
            label="SEO description"
            value={content.seo?.description}
            onChange={(value) => update(["seo", "description"], value)}
            multiline
          />
        </div>
      </HomeSection>

      <HomeSection
        anchorId="sec-hero"
        {...switchProps("hero")}
        number="02"
        icon={ImageIcon}
        title="Hero banner"
        where="The full-width banner at the very top of the page, with the big headline and background image."
        preview={content.hero?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.hero?.eyebrow}
            onChange={(value) => update(["hero", "eyebrow"], value)}
          />
          <HomeField
            label="Headline"
            value={content.hero?.title}
            onChange={(value) => update(["hero", "title"], value)}
            multiline
          />
          <HomeField
            label="Description"
            value={content.hero?.description}
            onChange={(value) => update(["hero", "description"], value)}
            multiline
          />
          <HomeField
            label="Secondary button text"
            value={content.hero?.secondaryCta}
            onChange={(value) => update(["hero", "secondaryCta"], value)}
          />
          <HomeField
            label="Image caption"
            value={content.hero?.caption}
            onChange={(value) => update(["hero", "caption"], value)}
          />
        </div>
        <ImageField
          label="Banner image"
          image={{ url: content.hero?.image, alt: content.hero?.imageAlt }}
          onChange={(image) =>
              updateImage(["hero", "image"], ["hero", "imageAlt"], image)
            }
          onError={imageError}
        />
      </HomeSection>

      <HomeSection
        anchorId="sec-snapshot"
        {...switchProps("snapshot")}
        number="03"
        icon={ListChecks}
        title="Snapshot strip"
        where="The thin row of quick facts directly under the hero banner."
        preview={(content.snapshot || []).join(" · ")}
      >
        <HomeField
          label="Snapshot items, one per line"
          value={(content.snapshot || []).join("\n")}
          onChange={(value) => updateList(["snapshot"], value)}
          multiline
        />
      </HomeSection>

      <HomeSection
        anchorId="sec-audience"
        {...switchProps("audience")}
        number="04"
        icon={Users}
        title="Who this is for"
        where="The eyebrow + heading + four icon cards (e.g. Fundamentals & safety, Repeat test-takers...)."
        preview={content.audience?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.audience?.eyebrow}
            onChange={(value) => update(["audience", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.audience?.title}
            onChange={(value) => update(["audience", "title"], value)}
            multiline
          />
          <HomeField
            label="Supporting copy"
            value={content.audience?.copy}
            onChange={(value) => update(["audience", "copy"], value)}
            multiline
          />
        </div>
        <p className="home-section-note">Cards shown below, in order:</p>
        <div className="home-repeatable-grid">
          {(content.audience?.items || []).map((item, index) => (
            <div className="home-repeatable" key={`audience-${index}`}>
              <b>Card {index + 1}</b>
              <HomeField
                label="Title"
                value={item.title}
                onChange={(value) =>
                  updateItem(["audience", "items"], index, "title", value)
                }
              />
              <HomeField
                label="Text"
                value={item.text}
                onChange={(value) =>
                  updateItem(["audience", "items"], index, "text", value)
                }
                multiline
              />
            </div>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        anchorId="sec-curriculum"
        {...switchProps("curriculum")}
        number="05"
        icon={GraduationCap}
        title="Curriculum"
        where="The 'What you will learn' section with the clickable topic list and detail panel."
        preview={content.curriculum?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.curriculum?.eyebrow}
            onChange={(value) => update(["curriculum", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.curriculum?.title}
            onChange={(value) => update(["curriculum", "title"], value)}
            multiline
          />
          <HomeField
            label="Supporting copy"
            value={content.curriculum?.copy}
            onChange={(value) => update(["curriculum", "copy"], value)}
            multiline
          />
        </div>
        <p className="home-section-note">
          Topics, shown as tabs on the left with matching detail on the
          right:
        </p>
        <div className="home-repeatable-grid">
          {(content.curriculum?.topics || []).map((item, index) => (
            <div className="home-repeatable" key={`topic-${index}`}>
              <b>Topic {index + 1}</b>
              <HomeField
                label="Title"
                value={item.title}
                onChange={(value) =>
                  updateItem(["curriculum", "topics"], index, "title", value)
                }
              />
              <HomeField
                label="Description"
                value={item.description}
                onChange={(value) =>
                  updateItem(
                    ["curriculum", "topics"],
                    index,
                    "description",
                    value,
                  )
                }
                multiline
              />
            </div>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        anchorId="sec-instructor"
        {...switchProps("instructor")}
        number="06"
        icon={User}
        title="Instructor"
        where="The instructor photo and bio section, with credentials and the 'Meet the instructor' button."
        preview={content.instructor?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.instructor?.eyebrow}
            onChange={(value) => update(["instructor", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.instructor?.title}
            onChange={(value) => update(["instructor", "title"], value)}
            multiline
          />
          <HomeField
            label="Bio paragraphs, one per line"
            value={(content.instructor?.copy || []).join("\n")}
            onChange={(value) => updateList(["instructor", "copy"], value)}
            multiline
          />
          <HomeField
            label="Credentials, one per line"
            value={(content.instructor?.credentials || []).join("\n")}
            onChange={(value) =>
              updateList(["instructor", "credentials"], value)
            }
            multiline
          />
        </div>
        <ImageField
          label="Instructor photo"
          image={{
            url: content.instructor?.image,
            alt: content.instructor?.imageAlt,
          }}
          onChange={(image) =>
            updateImage(
              ["instructor", "image"],
              ["instructor", "imageAlt"],
              image,
            )
          }
          onError={imageError}
        />
      </HomeSection>

      <HomeSection
        anchorId="sec-process"
        {...switchProps("process")}
        number="07"
        icon={Workflow}
        title="How support works"
        where="Feeds the process-feature block between Instructor and the program gallery — steps, plus the rotating overlay image panel."
        preview={content.process?.title || content.editorial?.processTitle}
      >
        <p className="home-section-note">Step list:</p>
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.process?.eyebrow}
            onChange={(value) => update(["process", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.process?.title}
            onChange={(value) => update(["process", "title"], value)}
            multiline
          />
          <HomeField
            label="Supporting copy"
            value={content.process?.copy}
            onChange={(value) => update(["process", "copy"], value)}
            multiline
          />
        </div>
        <div className="home-repeatable-grid">
          {(content.process?.items || []).map((item, index) => (
            <div className="home-repeatable" key={`process-${index}`}>
              <b>Step {index + 1}</b>
              <HomeField
                label="Title"
                value={item.title}
                onChange={(value) =>
                  updateItem(["process", "items"], index, "title", value)
                }
              />
              <HomeField
                label="Text"
                value={item.text}
                onChange={(value) =>
                  updateItem(["process", "items"], index, "text", value)
                }
                multiline
              />
            </div>
          ))}
        </div>

        <p className="home-section-note home-section-note-divider">
          Overlay / rotating image panel that appears alongside the steps:
        </p>
        <div className="home-field-grid">
          <HomeField
            label="Panel eyebrow"
            value={content.editorial?.processEyebrow}
            onChange={(value) => update(["editorial", "processEyebrow"], value)}
          />
          <HomeField
            label="Panel heading"
            value={content.editorial?.processTitle}
            onChange={(value) => update(["editorial", "processTitle"], value)}
            multiline
          />
          <HomeField
            label="Panel copy"
            value={content.editorial?.processCopy}
            onChange={(value) => update(["editorial", "processCopy"], value)}
            multiline
          />
          <HomeField
            label="Panel button text"
            value={content.editorial?.processButton}
            onChange={(value) => update(["editorial", "processButton"], value)}
          />
          <HomeField
            label="Overlay title"
            value={content.editorial?.processOverlayTitle}
            onChange={(value) =>
              update(["editorial", "processOverlayTitle"], value)
            }
          />
        </div>
        <div className="home-repeatable-grid">
          {(content.editorial?.processImages || []).map((image, index) => (
            <div className="home-repeatable" key={`process-image-${index}`}>
              <b>Rotating image {index + 1}</b>
              <ImageField
                label="Image"
                image={image}
                onChange={(next) =>
                  update(["editorial", "processImages", index], next)
                }
                onError={imageError}
              />
            </div>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        anchorId="sec-gallery"
        {...switchProps("gallery")}
        number="08"
        icon={GalleryHorizontalEnd}
        title="Program gallery"
        where="The four-card image gallery below the process section (title, description and background image per card)."
        preview={content.editorial?.galleryTitle}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.editorial?.galleryEyebrow}
            onChange={(value) => update(["editorial", "galleryEyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.editorial?.galleryTitle}
            onChange={(value) => update(["editorial", "galleryTitle"], value)}
            multiline
          />
          <HomeField
            label="Supporting copy"
            value={content.editorial?.galleryCopy}
            onChange={(value) => update(["editorial", "galleryCopy"], value)}
            multiline
          />
        </div>
        <p className="home-section-note">Gallery cards, left to right:</p>
        <div className="home-repeatable-grid">
          {(content.editorial?.galleryItems || []).map((item, index) => (
            <div className="home-repeatable" key={`gallery-item-${index}`}>
              <b>Card {index + 1}</b>
              <HomeField
                label="Title"
                value={item.title}
                onChange={(value) =>
                  updateItem(
                    ["editorial", "galleryItems"],
                    index,
                    "title",
                    value,
                  )
                }
              />
              <HomeField
                label="Description"
                value={item.description}
                onChange={(value) =>
                  updateItem(
                    ["editorial", "galleryItems"],
                    index,
                    "description",
                    value,
                  )
                }
                multiline
              />
              <ImageField
                label="Background image"
                image={{ url: item.image, alt: item.imageAlt }}
                onChange={(image) =>
                  updateImage(
                    ["editorial", "galleryItems", index, "image"],
                    ["editorial", "galleryItems", index, "imageAlt"],
                    image,
                  )
                }
                onError={imageError}
              />
            </div>
          ))}
        </div>
      </HomeSection>

      <HomeSection
        anchorId="sec-testimonials"
        {...switchProps("testimonials")}
        number="09"
        icon={MessagesSquare}
        title="Testimonials"
        where="The student stories carousel. Not edited here — testimonials are managed as their own records."
      >
        <p className="home-section-note home-section-redirect">
          Testimonials are stored separately from the rest of the homepage
          content, so they are managed as their own records. Go to{" "}
          <strong>Testimonials</strong> in the sidebar to add, edit, or remove
          student stories — changes there show up in this section
          automatically.
        </p>
      </HomeSection>

      <HomeSection
        anchorId="sec-community"
        {...switchProps("community")}
        number="10"
        icon={Users}
        title="Community"
        where="The section with the community image and three highlight items, below testimonials."
        preview={content.community?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.community?.eyebrow}
            onChange={(value) => update(["community", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.community?.title}
            onChange={(value) => update(["community", "title"], value)}
            multiline
          />
          <HomeField
            label="Supporting copy"
            value={content.community?.copy}
            onChange={(value) => update(["community", "copy"], value)}
            multiline
          />
          <HomeField
            label="Highlight items, one per line (up to 3 shown)"
            value={(content.community?.items || []).join("\n")}
            onChange={(value) => updateList(["community", "items"], value)}
            multiline
          />
        </div>
        <ImageField
          label="Community image"
          image={{
            url: content.community?.image,
            alt: content.community?.imageAlt,
          }}
          onChange={(image) =>
            updateImage(
              ["community", "image"],
              ["community", "imageAlt"],
              image,
            )
          }
          onError={imageError}
        />
      </HomeSection>

      <HomeSection
        anchorId="sec-qa"
        {...switchProps("qa")}
        number="11"
        icon={CalendarClock}
        title="Wednesday Q&A"
        where="The live-session section near the bottom, with the registration button that opens the sign-up modal."
        preview={content.qa?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.qa?.eyebrow}
            onChange={(value) => update(["qa", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.qa?.title}
            onChange={(value) => update(["qa", "title"], value)}
            multiline
          />
          <HomeField
            label="Supporting copy"
            value={content.qa?.copy}
            onChange={(value) => update(["qa", "copy"], value)}
            multiline
          />
          <HomeField
            label="Button text"
            value={content.qa?.button}
            onChange={(value) => update(["qa", "button"], value)}
          />
        </div>
        <ImageField
          label="Q&A image"
          image={{ url: content.qa?.image, alt: content.qa?.imageAlt }}
          onChange={(image) =>
            updateImage(["qa", "image"], ["qa", "imageAlt"], image)
          }
          onError={imageError}
        />
      </HomeSection>

      <HomeSection
        anchorId="sec-faq"
        {...switchProps("faqs")}
        number="12"
        icon={HelpCircle}
        title="FAQ section"
        where="The questions block at the very bottom of the homepage. Shows the first five questions from the FAQ page."
        preview={content.faq?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.faq?.eyebrow}
            onChange={(value) => update(["faq", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.faq?.title}
            onChange={(value) => update(["faq", "title"], value)}
            multiline
          />
          <HomeField
            label="Supporting copy"
            value={content.faq?.copy}
            onChange={(value) => update(["faq", "copy"], value)}
            multiline
          />
          <HomeField
            label="Button text"
            value={content.faq?.button}
            onChange={(value) => update(["faq", "button"], value)}
          />
        </div>
        <p className="home-section-note">
          The questions and answers themselves are edited on the FAQ page editor.
        </p>
      </HomeSection>

      <HomeSection
        anchorId="sec-pricing"
        number="13"
        icon={Tag}
        title="Pricing"
        where="Pricing details used across the site. Not currently rendered on the homepage itself — check the pricing page."
        preview={content.pricing?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Heading"
            value={content.pricing?.title}
            onChange={(value) => update(["pricing", "title"], value)}
            multiline
          />
          <HomeField
            label="Supporting copy"
            value={content.pricing?.copy}
            onChange={(value) => update(["pricing", "copy"], value)}
            multiline
          />
          <HomeField
            label="Product name"
            value={content.pricing?.product}
            onChange={(value) => update(["pricing", "product"], value)}
          />
          <HomeField
            label="What's included"
            value={content.pricing?.included}
            onChange={(value) => update(["pricing", "included"], value)}
            multiline
          />
        </div>
      </HomeSection>

      <HomeSection
        anchorId="sec-finalcta"
        number="14"
        icon={Megaphone}
        title="Final call-to-action"
        where="Closing banner text. Not currently rendered on this version of the homepage — kept here in case it's reused elsewhere."
        preview={content.finalCta?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Heading"
            value={content.finalCta?.title}
            onChange={(value) => update(["finalCta", "title"], value)}
            multiline
          />
          <HomeField
            label="Primary button text"
            value={content.finalCta?.primary}
            onChange={(value) => update(["finalCta", "primary"], value)}
          />
          <HomeField
            label="Secondary button text"
            value={content.finalCta?.secondary}
            onChange={(value) => update(["finalCta", "secondary"], value)}
          />
        </div>
      </HomeSection>
    </PageEditorShell>
  );
}
