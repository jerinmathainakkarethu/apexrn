import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  LogOut,
  Plus,
  Save,
  Trash2,
  LayoutGrid,
  MenuIcon as MenuGlyph,
  Home as HomeIcon,
  User,
  CalendarDays,
  MessageSquareQuote,
  HelpCircle,
  BookMarked,
  Mail,
  Users2,
  Search,
  Image as ImageIcon,
  ListChecks,
  Users,
  GraduationCap,
  Workflow,
  GalleryHorizontalEnd,
  MessagesSquare,
  CalendarClock,
  Tag,
  Megaphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import Eyebrow from "../components/ui/Eyebrow";
import { getAbout, updateAbout } from "../api/about";
import { getMenu, updateMenu } from "../api/menu";
import { getHome, updateHome } from "../api/home";
import { getAdminContacts, getAdminQa, uploadImage, uploadVideo } from "../api/admin";
import {
  createProgramWeek,
  deleteProgramWeek,
  getProgram,
  updateProgramWeek,
} from "../api/program";
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from "../api/testimonials";
import { createFaq, deleteFaq, updateFaq } from "../api/faqs";
import { createResource, deleteResource, updateResource } from "../api/resources";
import { loginAdmin } from "../api/auth";
import { imageUrl } from "../services/api";

// "Pages" removed — every content type below already has its own sidebar entry,
// so a separate page-picker just duplicated navigation.
const sectionGroups = [
  {
    label: "Overview",
    items: [{ key: "Overview", icon: LayoutGrid }],
  },
  {
    label: "Content",
    items: [
      { key: "Menu", icon: MenuGlyph },
      { key: "Home content", icon: HomeIcon },
      { key: "About content", icon: User },
    ],
  },
  {
    label: "Program",
    items: [
      { key: "Program weeks", icon: CalendarDays },
      { key: "Testimonials", icon: MessageSquareQuote },
      { key: "FAQs", icon: HelpCircle },
      { key: "Resources", icon: BookMarked },
    ],
  },
  {
    label: "Inbox",
    items: [
      { key: "Messages", icon: Mail },
      { key: "Q&A registrations", icon: Users2 },
    ],
  },
];

const blankTestimonial = {
  display_name: "",
  country: "",
  story: "",
  result: "",
  video_url: "",
  status: "draft",
  featured: false,
};
const blankFaq = {
  question: "",
  answer: "",
  status: "published",
  sort_order: 0,
};
const blankResource = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  status: "draft",
};
const blankWeek = {
  week_number: "",
  title: "",
  description: "",
  status: "published",
};
const blankMenu = { label: "", url: "" };

function parseContent(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
function apiError(error, fallback = "The change could not be saved.") {
  const details = error.response?.data?.errors;
  if (Array.isArray(details) && details.length)
    return details.map((item) => `${item.field}: ${item.message}`).join(" ");
  return error.response?.data?.message || fallback;
}
function validateFields(value, fields) {
  return fields.reduce((errors, [key, label, optional]) => {
    if (optional) return errors;
    if (!String(value[key] ?? "").trim()) errors[key] = `${label} is required.`;
    return errors;
  }, {});
}

function setHomePath(value, path, nextValue) {
  const next = structuredClone(value);
  let target = next;
  path.slice(0, -1).forEach((key) => {
    target[key] = target[key] ?? {};
    target = target[key];
  });
  target[path[path.length - 1]] = nextValue;
  return next;
}

function HomeField({ label, value, onChange, multiline = false }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <label className="home-field">
      <span>{label}</span>
      <Tag
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function ImageField({ label, image, onChange, onError }) {
  const [uploading, setUploading] = useState(false);
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadImage(file);
      onChange({ ...image, url: response.data.url });
    } catch (error) {
      onError(apiError(error, "The image could not be uploaded."));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }
  return (
    <div className="home-image-field">
      <HomeField
        label={`${label} URL`}
        value={image?.url}
        onChange={(url) => onChange({ ...image, url })}
      />
      <HomeField
        label="Alt text"
        value={image?.alt}
        onChange={(alt) => onChange({ ...image, alt })}
      />
      <label className="home-upload-button">
        <span>{uploading ? "Uploading..." : "Upload image"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={upload}
          disabled={uploading}
        />
      </label>
      {image?.url && (
        <img
          className="home-image-preview"
          src={imageUrl(image.url)}
          alt={image.alt || "Preview"}
        />
      )}
    </div>
  );
}

function VideoField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const response = await uploadVideo(file);
      onChange(response.data.url);
    } catch (uploadError) {
      setError(apiError(uploadError, "The video could not be uploaded."));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }
  return (
    <div className="admin-video-field">
      <label>
        {label}
        <textarea
          rows={1}
          value={value || ""}
          onChange={(event) => {
            setError("");
            onChange(event.target.value);
          }}
          placeholder="Paste a YouTube / Vimeo link, or upload a file"
          spellCheck="false"
        />
      </label>
      <label className="home-upload-button">
        <span>{uploading ? "Uploading..." : "Upload video"}</span>
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
          onChange={upload}
          disabled={uploading}
        />
      </label>
      {error && <small className="admin-field-error">{error}</small>}
      {value?.startsWith("/uploads/") && (
        <video className="admin-video-preview" src={imageUrl(value)} controls />
      )}
    </div>
  );
}

/**
 * Collapsible accordion section for the homepage builder.
 * `where` = a one-line description of where this content shows up on the
 * live page, `preview` = the current title/eyebrow text shown even while
 * collapsed, so an admin can identify a section without opening it.
 * `sectionKey` = when set, a switch appears that hides/shows this section
 * on the live site.
 */
function HomeSection({
  number,
  icon: Icon,
  title,
  where,
  preview,
  children,
  defaultOpen = false,
  anchorId,
  sectionKey,
  visible = true,
  onToggle,
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section
      id={anchorId}
      className={`home-content-section${open ? " open" : ""}${
        sectionKey && !visible ? " is-hidden" : ""
      }`}
    >
      <div className="home-section-row">
        <button
          type="button"
          className="home-section-heading"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          <div className="home-section-heading-left">
            <span className="home-section-badge">{number}</span>
            <div className="home-section-icon">
              <Icon size={17} strokeWidth={1.6} />
            </div>
            <div>
              <h3>{title}</h3>
              <p className="home-section-where">{where}</p>
              {!open && preview ? (
                <p className="home-section-preview">"{preview}"</p>
              ) : null}
            </div>
          </div>
          <ChevronDown size={18} className="home-section-chevron" />
        </button>
        {sectionKey ? (
          <label className="admin-switch" title={`Show "${title}" on the live site`}>
            <input
              type="checkbox"
              checked={visible}
              onChange={() => onToggle(sectionKey)}
            />
            <span className="admin-switch-track">
              <span className="admin-switch-thumb" />
            </span>
            <span className="admin-switch-text">
              {visible ? "Live" : "Hidden"}
            </span>
          </label>
        ) : null}
      </div>
      {open && <div className="home-section-body">{children}</div>}
    </section>
  );
}

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
  { id: "sec-pricing", label: "Pricing" },
];

function HomeContentEditor({ value, onChange, onSave, onRetry }) {
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [saved, setSaved] = useState(false);
  const content = parseContent(value) || {};
  const update = (path, nextValue) =>
    onChange(JSON.stringify(setHomePath(content, path, nextValue), null, 2));
  const updateItem = (path, index, field, nextValue) =>
    update([...path, index, field], nextValue);
  const updateList = (path, text) =>
    update(
      path,
      text
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    );
  const save = async () => {
    setError("");
    setSaved(false);
    const result = await onSave();
    if (result?.error) setError(result.error);
    else setSaved(true);
  };
  const imageError = (message) => setUploadError(message);
  const jumpTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const isVisible = (key) => content.sectionVisibility?.[key] !== false;
  const toggleVisibility = (key) =>
    update(["sectionVisibility", key], !isVisible(key));
  const switchProps = (key) => ({
    sectionKey: key,
    visible: isVisible(key),
    onToggle: toggleVisibility,
  });

  if (!Object.keys(content).length)
    return (
      <div className="admin-create">
        <Eyebrow>Homepage content</Eyebrow>
        <p className="admin-form-error">
          The homepage content could not be loaded, so the section inputs are
          unavailable. Check that the API server is running, then retry.
        </p>
        <div className="button-row">
          <button type="button" className="button" onClick={onRetry}>
            Retry loading
          </button>
        </div>
      </div>
    );

  return (
    <div className="home-content-editor">
      <div className="home-editor-toolbar">
        <div>
          <Eyebrow>Homepage builder</Eyebrow>
          <h2>Edit the home page, section by section</h2>
          <p>
            Sections below are in the same order they appear on the live
            page. Open one, make your edits, then save once at the end.
          </p>
          <p className="home-visibility-note">
            The switch on each section shows or hides that section on the live
            home page. Flip as many as you like, then press Save homepage.
          </p>
        </div>
        <div className="home-editor-actions">
          <button type="button" className="button" onClick={save}>
            <Save size={16} />
            Save homepage
          </button>
        </div>
      </div>

      <>
      <nav className="home-jump-nav" aria-label="Jump to section">
        {HOME_SECTION_NAV.map((item) => (
          <button type="button" key={item.id} onClick={() => jumpTo(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>

      {error && <p className="admin-form-error">{error}</p>}
      {saved && (
        <p className="admin-form-success">
          Homepage changes saved successfully.
        </p>
      )}
      {uploadError && <p className="admin-form-error">{uploadError}</p>}

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
          onChange={(image) => {
            let next = setHomePath(content, ["hero", "image"], image.url);
            next = setHomePath(next, ["hero", "imageAlt"], image.alt);
            onChange(JSON.stringify(next, null, 2));
          }}
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
          onChange={(image) => {
            let next = setHomePath(content, ["instructor", "image"], image.url);
            next = setHomePath(next, ["instructor", "imageAlt"], image.alt);
            onChange(JSON.stringify(next, null, 2));
          }}
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
                onChange={(image) => {
                  let next = setHomePath(
                    content,
                    ["editorial", "galleryItems", index, "image"],
                    image.url,
                  );
                  next = setHomePath(
                    next,
                    ["editorial", "galleryItems", index, "imageAlt"],
                    image.alt,
                  );
                  onChange(JSON.stringify(next, null, 2));
                }}
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
          onChange={(image) => {
            let next = setHomePath(content, ["community", "image"], image.url);
            next = setHomePath(next, ["community", "imageAlt"], image.alt);
            onChange(JSON.stringify(next, null, 2));
          }}
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
          onChange={(image) => {
            let next = setHomePath(content, ["qa", "image"], image.url);
            next = setHomePath(next, ["qa", "imageAlt"], image.alt);
            onChange(JSON.stringify(next, null, 2));
          }}
          onError={imageError}
        />
      </HomeSection>

      <HomeSection
        anchorId="sec-pricing"
        number="12"
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
        number="13"
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
        </>
      )}
    </div>
  );
}

const ABOUT_SECTION_NAV = [
  { id: "about-header", label: "Page header" },
  { id: "about-story", label: "Instructor story" },
  { id: "about-images", label: "Images" },
  { id: "about-benefits", label: "Benefits" },
  { id: "about-stats", label: "Stats" },
  { id: "about-video", label: "Video" },
  { id: "about-testimonials", label: "Testimonials" },
];

function AboutContentEditor({ value, onChange, onSave, onRetry }) {
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [saved, setSaved] = useState(false);
  const content = parseContent(value) || {};
  const update = (path, nextValue) =>
    onChange(JSON.stringify(setHomePath(content, path, nextValue), null, 2));
  const updateItem = (path, index, field, nextValue) =>
    update([...path, index, field], nextValue);
  const updateList = (path, text) =>
    update(
      path,
      text
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    );
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
  const save = async () => {
    setError("");
    setSaved(false);
    const result = await onSave();
    if (result?.error) setError(result.error);
    else setSaved(true);
  };
  const jumpTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  if (!Object.keys(content).length)
    return (
      <div className="admin-create">
        <Eyebrow>About content</Eyebrow>
        <p className="admin-form-error">
          The about content could not be loaded, so the inputs are
          unavailable. Check that the API server is running, then retry.
        </p>
        <div className="button-row">
          <button type="button" className="button" onClick={onRetry}>
            Retry loading
          </button>
        </div>
      </div>
    );

  return (
    <div className="home-content-editor">
      <div className="home-editor-toolbar">
        <div>
          <Eyebrow>About page builder</Eyebrow>
          <h2>Edit the about page, section by section</h2>
          <p>
            Sections below are in the same order they appear on the live about
            page. Open one, make your edits, then save once at the end.
          </p>
        </div>
        <div className="home-editor-actions">
          <button type="button" className="button" onClick={save}>
            <Save size={16} />
            Save about page
          </button>
        </div>
      </div>

      <nav className="home-jump-nav" aria-label="Jump to section">
        {ABOUT_SECTION_NAV.map((item) => (
          <button type="button" key={item.id} onClick={() => jumpTo(item.id)}>
            {item.label}
          </button>
        ))}
      </nav>

      {error && <p className="admin-form-error">{error}</p>}
      {saved && (
        <p className="admin-form-success">
          About page changes saved successfully.
        </p>
      )}
      {uploadError && <p className="admin-form-error">{uploadError}</p>}

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
        title="Instructor story"
        where="The instructor headline, the story paragraph and the short list of values."
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
          label="Values (one per line)"
          value={(content.values || []).join("\n")}
          onChange={(value) => updateList(["values"], value)}
          multiline
        />
      </HomeSection>

      <HomeSection
        anchorId="about-images"
        number="03"
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
        number="04"
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
        anchorId="about-stats"
        number="05"
        icon={Workflow}
        title="Stats"
        where="The four big numbers under the benefits block."
        preview={(content.stats || []).map((item) => item.value).join(" / ")}
      >
        <p className="home-section-note">
          Shown left to right under the benefits block.
        </p>
        <div className="home-repeatable-grid">
          {(content.stats || []).map((item, index) => (
            <div className="home-repeatable" key={`about-stat-${index}`}>
              <b>Stat {index + 1}</b>
              <HomeField
                label="Value"
                value={item.value}
                onChange={(value) =>
                  updateItem(["stats"], index, "value", value)
                }
              />
              <HomeField
                label="Label"
                value={item.label}
                onChange={(value) =>
                  updateItem(["stats"], index, "label", value)
                }
              />
              <button
                type="button"
                className="icon-danger"
                aria-label={`Remove stat ${index + 1}`}
                onClick={() => removeItem(["stats"], index)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add-row"
            onClick={() => addItem(["stats"], { value: "", label: "" })}
          >
            <Plus size={15} />
            Add stat
          </button>
        </div>
      </HomeSection>

      <HomeSection
        anchorId="about-video"
        number="06"
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
        number="07"
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
    </div>
  );
}

export default function AdminDashboard() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("apex_admin_token"),
  );
  const [admin, setAdmin] = useState(() =>
    JSON.parse(localStorage.getItem("apex_admin_user") || "null"),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [active, setActive] = useState("Overview");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [homeText, setHomeText] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [menu, setMenu] = useState([]);
  const [program, setProgram] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [resources, setResources] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [newTestimonial, setNewTestimonial] = useState(blankTestimonial);
  const [newFaq, setNewFaq] = useState(blankFaq);
  const [newResource, setNewResource] = useState(blankResource);
  const [newWeek, setNewWeek] = useState(blankWeek);
  const [newMenu, setNewMenu] = useState(blankMenu);

  useEffect(() => {
    if (!token) return;
    refreshAll();
  }, [token]);

  async function refreshAll() {
    setLoading(true);
    const requests = [
      ["homepage content", () => getHome()],
      ["about content", () => getAbout()],
      ["menu", () => getMenu()],
      ["program weeks", () => getProgram()],
      ["testimonials", () => getTestimonials()],
      ["faqs", () => fetchCollection("/faqs")],
      ["resources", () => fetchCollection("/resources")],
      ["messages", () => getAdminContacts()],
      ["Q&A registrations", () => getAdminQa()],
    ];
    try {
      const results = await Promise.allSettled(
        requests.map(([, request]) => request()),
      );
      const unauthorized = results.some(
        (result) =>
          result.status === "rejected" && result.reason?.response?.status === 401,
      );
      if (unauthorized) {
        logout();
        return;
      }
      const failed = [];
      const result = (index) => {
        if (results[index].status === "rejected") {
          failed.push(requests[index][0]);
          return null;
        }
        return results[index].value;
      };
      const home = result(0);
      const about = result(1);
      const menuItems = result(2);
      const weeks = result(3);
      const stories = result(4);
      const faqItems = result(5);
      const resourceItems = result(6);
      const messages = result(7);
      const qa = result(8);
      if (home) setHomeText(JSON.stringify(home.data, null, 2));
      if (about) setAboutText(JSON.stringify(about.data, null, 2));
      if (menuItems) setMenu(menuItems.data);
      if (weeks) setProgram(weeks.data);
      if (stories) setTestimonials(stories.data);
      if (faqItems) setFaqs(faqItems);
      if (resourceItems) setResources(resourceItems);
      if (messages) setContacts(messages.data);
      if (qa) setRegistrations(qa.data);
      if (failed.length)
        setNotice(`Could not load: ${failed.join(", ")}. Other tabs still work.`);
    } finally {
      setLoading(false);
    }
  }
  async function fetchCollection(path) {
    const response = await (await import("../services/api")).default.get(path);
    return response.data;
  }
  async function signIn(event) {
    event.preventDefault();
    setLoginError("");
    if (!email.trim()) return setLoginError("Email is required.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setLoginError("Enter a valid email address.");
    if (password.length < 6)
      return setLoginError("Password must be at least 6 characters.");
    try {
      const response = await loginAdmin({ email, password });
      localStorage.setItem("apex_admin_token", response.data.token);
      localStorage.setItem(
        "apex_admin_user",
        JSON.stringify(response.data.admin),
      );
      setToken(response.data.token);
      setAdmin(response.data.admin);
    } catch (error) {
      setLoginError(
        apiError(error, "Unable to sign in with these credentials."),
      );
    }
  }
  function logout() {
    localStorage.removeItem("apex_admin_token");
    localStorage.removeItem("apex_admin_user");
    setToken(null);
    setAdmin(null);
  }
  async function saveJson(text, save) {
    const value = parseContent(text);
    if (!value || Array.isArray(value))
      return {
        error:
          "This page could not be read. Reload the admin panel and try again.",
      };
    const result = await save(value);
    return result?.error ? result : undefined;
  }
  async function action(work, success = "Saved to MySQL.") {
    try {
      await work();
      setNotice(success);
      await refreshAll();
      return true;
    } catch (error) {
      const message = apiError(error);
      setNotice(message);
      return { error: message };
    }
  }

  if (!token)
    return (
      <div className="admin-page">
        <form className="admin-login" onSubmit={signIn}>
          <Link className="brand" to="/">
            <span>APEX</span>
            <small>RN PREP</small>
          </Link>
          <Eyebrow>Admin workspace</Eyebrow>
          <h1>Welcome back.</h1>
          <p>
            Sign in with the admin credentials from your server environment.
          </p>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {loginError && <p className="admin-error">{loginError}</p>}
          <button className="button" type="submit">
            Sign in <ArrowRight size={17} />
          </button>
        </form>
      </div>
    );

  return (
    <div className="admin-page">
      <div className="admin-shell">
        <aside>
          <Link className="brand" to="/">
            <span>APEX</span>
            <small>RN PREP</small>
          </Link>
          <div className="admin-nav">
            {sectionGroups.map((group) => (
              <div className="admin-nav-group" key={group.label}>
                <span className="admin-nav-label">{group.label}</span>
                {group.items.map(({ key, icon: Icon }) => (
                  <button
                    className={active === key ? "selected" : ""}
                    onClick={() => setActive(key)}
                    key={key}
                  >
                    <Icon size={15} />
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button className="admin-logout" onClick={logout}>
            <LogOut size={15} /> Log out
          </button>
        </aside>
        <section className="admin-content">
          <div className="admin-heading">
            <div>
              <Eyebrow>{admin?.email || "Admin workspace"}</Eyebrow>
              <h1>{active}.</h1>
            </div>
            {notice && (
              <span className="admin-notice">
                <Check size={15} />
                {notice}
              </span>
            )}
          </div>
          {loading ? (
            <div className="admin-loading">Loading MySQL content...</div>
          ) : (
            <AdminView
              active={active}
              homeText={homeText}
              setHomeText={setHomeText}
              aboutText={aboutText}
              setAboutText={setAboutText}
              saveJson={saveJson}
              menu={menu}
              setMenu={setMenu}
              program={program}
              testimonials={testimonials}
              faqs={faqs}
              resources={resources}
              contacts={contacts}
              registrations={registrations}
              newWeek={newWeek}
              setNewWeek={setNewWeek}
              newMenu={newMenu}
              setNewMenu={setNewMenu}
              newTestimonial={newTestimonial}
              setNewTestimonial={setNewTestimonial}
              newFaq={newFaq}
              setNewFaq={setNewFaq}
              newResource={newResource}
              setNewResource={setNewResource}
              action={action}
              onRetry={refreshAll}
            />
          )}
        </section>
      </div>
    </div>
  );
}

function AdminView(props) {
  const {
    active,
    homeText,
    setHomeText,
    aboutText,
    setAboutText,
    saveJson,
    menu,
    setMenu,
    program,
    testimonials,
    faqs,
    resources,
    contacts,
    registrations,
    newWeek,
    setNewWeek,
    newMenu,
    setNewMenu,
    newTestimonial,
    setNewTestimonial,
    newFaq,
    setNewFaq,
    newResource,
    setNewResource,
    action,
    onRetry,
  } = props;

  if (active === "Overview") {
    const stats = [
      ["Program weeks", program.length, CalendarDays],
      ["Testimonials", testimonials.length, MessageSquareQuote],
      ["FAQs", faqs.length, HelpCircle],
      ["Resources", resources.length, BookMarked],
      ["Messages", contacts.length, Mail],
      ["Q&A registrations", registrations.length, Users2],
    ];
    return (
      <div className="admin-stats">
        {stats.map(([label, value, Icon]) => (
          <div key={label}>
            <Icon size={18} className="admin-stat-icon" />
            <span>{value}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>
    );
  }
  if (active === "Menu")
    return (
      <MenuEditor
        menu={menu}
        setMenu={setMenu}
        newMenu={newMenu}
        setNewMenu={setNewMenu}
        action={action}
      />
    );
  if (active === "Home content")
    return (
      <HomeContentEditor
        value={homeText}
        onChange={setHomeText}
        onRetry={onRetry}
        onSave={() =>
          saveJson(homeText, (value) => action(() => updateHome(value)))
        }
      />
    );
  if (active === "About content")
    return (
      <AboutContentEditor
        value={aboutText}
        onChange={setAboutText}
        onRetry={onRetry}
        onSave={() =>
          saveJson(aboutText, (value) =>
            action(() => updateAbout(value)),
          )
        }
      />
    );
  if (active === "Program weeks")
    return (
      <>
        <CreateForm
          title="Add program week"
          value={newWeek}
          setValue={setNewWeek}
          fields={[
            ["week_number", "Week"],
            ["title", "Title"],
            ["description", "Description"],
          ]}
          onSubmit={() =>
            action(() =>
              import("../services/api").then(({ createProgramWeek }) =>
                createProgramWeek(newWeek),
              ),
            ).then((result) => result === true && setNewWeek(blankWeek))
          }
        />
        <Collection
          title="Program weeks"
          items={program}
          summaryKey="title"
          fields={[
            { key: "week_number", label: "Week" },
            { key: "title", label: "Title" },
            { key: "description", label: "Description" },
          ]}
          onSave={(id, value) =>
            action(() =>
              import("../services/api").then(({ updateProgramWeek }) =>
                updateProgramWeek(id, value),
              ),
            )
          }
          onDelete={(id) =>
            action(() =>
              import("../services/api").then(({ deleteProgramWeek }) =>
                deleteProgramWeek(id),
              ),
            )
          }
        />
      </>
    );
  if (active === "Testimonials")
    return (
      <>
        <CreateForm
          title="Add testimonial"
          value={newTestimonial}
          setValue={setNewTestimonial}
          fields={[
            ["display_name", "Display name"],
            ["country", "Country"],
            ["story", "Story"],
            ["result", "Result"],
            ["video_url", "Video", true],
          ]}
          onSubmit={() =>
            action(() =>
              import("../services/api").then(({ createTestimonial }) =>
                createTestimonial(newTestimonial),
              ),
            ).then(
              (result) =>
                result === true && setNewTestimonial(blankTestimonial),
            )
          }
        />
        <Collection
          title="Testimonials"
          items={testimonials}
          summaryKey="display_name"
          fields={[
            { key: "display_name", label: "Name" },
            { key: "country", label: "Country" },
            { key: "story", label: "Story" },
            { key: "result", label: "Result" },
            { key: "video_url", label: "Video", optional: true },
          ]}
          onSave={(id, value) =>
            action(() =>
              import("../services/api").then(({ updateTestimonial }) =>
                updateTestimonial(id, value),
              ),
            )
          }
          onDelete={(id) =>
            action(() =>
              import("../services/api").then(({ deleteTestimonial }) =>
                deleteTestimonial(id),
              ),
            )
          }
        />
      </>
    );
  if (active === "FAQs")
    return (
      <>
        <CreateForm
          title="Add FAQ"
          value={newFaq}
          setValue={setNewFaq}
          fields={[
            ["question", "Question"],
            ["answer", "Answer"],
          ]}
          onSubmit={() =>
            action(() =>
              import("../services/api").then(({ createFaq }) =>
                createFaq(newFaq),
              ),
            ).then((result) => result === true && setNewFaq(blankFaq))
          }
        />
        <Collection
          title="FAQs"
          items={faqs}
          summaryKey="question"
          fields={[
            { key: "question", label: "Question" },
            { key: "answer", label: "Answer" },
          ]}
          onSave={(id, value) =>
            action(() =>
              import("../services/api").then(({ updateFaq }) =>
                updateFaq(id, value),
              ),
            )
          }
          onDelete={(id) =>
            action(() =>
              import("../services/api").then(({ deleteFaq }) => deleteFaq(id)),
            )
          }
        />
      </>
    );
  if (active === "Resources")
    return (
      <>
        <CreateForm
          title="Add resource"
          value={newResource}
          setValue={setNewResource}
          fields={[
            ["title", "Title"],
            ["slug", "Slug"],
            ["excerpt", "Excerpt"],
            ["content", "Content"],
          ]}
          onSubmit={() =>
            action(() =>
              import("../services/api").then(({ createResource }) =>
                createResource(newResource),
              ),
            ).then((result) => result === true && setNewResource(blankResource))
          }
        />
        <Collection
          title="Resources"
          items={resources}
          summaryKey="title"
          fields={[
            { key: "title", label: "Title" },
            { key: "slug", label: "Slug" },
            { key: "excerpt", label: "Excerpt" },
            { key: "content", label: "Content" },
          ]}
          onSave={(id, value) =>
            action(() =>
              import("../services/api").then(({ updateResource }) =>
                updateResource(id, value),
              ),
            )
          }
          onDelete={(id) =>
            action(() =>
              import("../services/api").then(({ deleteResource }) =>
                deleteResource(id),
              ),
            )
          }
        />
      </>
    );
  if (active === "Messages")
    return <Inbox items={contacts} title="Contact messages" />;
  if (active === "Q&A registrations")
    return <Inbox items={registrations} title="Wednesday Q&A registrations" />;
  return null;
}

function MenuEditor({ menu, setMenu, newMenu, setNewMenu, action }) {
  const addMenuItem = () => {
    const errors = validateFields(newMenu, [
      ["label", "Menu label"],
      ["url", "URL or path"],
    ]);
    if (Object.keys(errors).length)
      return Promise.resolve({ error: Object.values(errors).join(" ") });
    return action(() =>
      updateMenu([
        ...menu,
        { label: newMenu.label.trim(), url: newMenu.url.trim() },
      ]),
    ).then((result) => {
      if (result === true) setNewMenu(blankMenu);
      return result;
    });
  };
  const saveMenuItem = (index, value) =>
    action(() =>
      updateMenu(
        menu.map((item, itemIndex) =>
          itemIndex === index ? { label: value.label, url: value.url } : item,
        ),
      ),
    );
  const deleteMenuItem = (index) =>
    action(() =>
      updateMenu(menu.filter((_, itemIndex) => itemIndex !== index)),
    );
  return (
    <>
      <CreateForm
        title="Add menu item"
        value={newMenu}
        setValue={setNewMenu}
        fields={[
          ["label", "Menu label"],
          ["url", "URL or path"],
        ]}
        onSubmit={addMenuItem}
      />
      <div className="admin-collection">
        <div className="admin-section-heading">
          <Eyebrow>Header menu</Eyebrow>
          <span>{menu.length} items</span>
        </div>
        {menu.map((item, index) => (
          <RowEditor
            key={`${item.label}-${index}`}
            item={item}
            summaryKey="label"
            fields={[
              { key: "label", label: "Label" },
              { key: "url", label: "URL or path" },
            ]}
            onSave={(value) => saveMenuItem(index, value)}
            onDelete={() => deleteMenuItem(index)}
          />
        ))}
      </div>
    </>
  );
}

function CreateForm({ title, value, setValue, fields, onSubmit }) {
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const submit = async () => {
    const nextErrors = validateFields(value, fields);
    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length) return;
    const result = await onSubmit();
    if (result?.error) setSubmitError(result.error);
  };
  return (
    <div className="admin-create">
      <Eyebrow>{title}</Eyebrow>
      <div className="admin-create-grid">
        {fields.map(([key, label, optional]) =>
          key === "video_url" ? (
            <VideoField
              key={key}
              label={label}
              value={value[key]}
              onChange={(next) => setValue({ ...value, [key]: next })}
            />
          ) : (
            <label key={key} className={errors[key] ? "has-error" : ""}>
              <span>
                {label}
                {!optional && <em className="admin-required">*</em>}
              </span>
              <textarea
                rows={
                  key === "story" || key === "answer" || key === "content"
                    ? 3
                    : 1
                }
                value={value[key] || ""}
                onChange={(event) => {
                  setErrors({ ...errors, [key]: "" });
                  setValue({ ...value, [key]: event.target.value });
                }}
              />
              {errors[key] && (
                <small className="admin-field-error">{errors[key]}</small>
              )}
            </label>
          ),
        )}
      </div>
      {submitError && <p className="admin-form-error">{submitError}</p>}
      <button type="button" className="button" onClick={submit}>
        <Plus size={16} />
        Create
      </button>
    </div>
  );
}

function Collection({ title, items, fields, onSave, onDelete, summaryKey }) {
  return (
    <div className="admin-collection">
      <div className="admin-section-heading">
        <Eyebrow>{title}</Eyebrow>
        <span>{items.length} records</span>
      </div>
      {items.length ? (
        items.map((item) => (
          <RowEditor
            key={item.id}
            item={item}
            fields={fields}
            summaryKey={summaryKey}
            onSave={(value) => onSave(item.id, value)}
            onDelete={onDelete}
          />
        ))
      ) : (
        <p className="admin-empty">No records yet. Add your first one above.</p>
      )}
    </div>
  );
}

function Inbox({ title, items }) {
  return (
    <div className="admin-collection">
      <div className="admin-section-heading">
        <Eyebrow>{title}</Eyebrow>
        <span>{items.length} records</span>
      </div>
      {items.length ? (
        items.map((item) => (
          <article className="admin-inbox-row" key={item.id}>
            <strong>{item.name || item.email}</strong>
            <span>{item.email}</span>
            <p>{item.message || item.nclex_date || "No additional details."}</p>
          </article>
        ))
      ) : (
        <p className="admin-empty">No records yet.</p>
      )}
    </div>
  );
}

function RowEditor({ item, fields, onSave, onDelete, summaryKey }) {
  const [draft, setDraft] = useState(item);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);
  const label = draft[summaryKey || fields[0]?.key] || "Untitled record";
  const save = async () => {
    const nextErrors = validateFields(
      draft,
      fields.map((field) => [field.key, field.label, field.optional]),
    );
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length) return;
    const result = await onSave(draft);
    if (result?.error) setMessage(result.error);
  };
  return (
    <div className={`admin-row${expanded ? " expanded" : ""}`}>
      <button
        type="button"
        className="admin-row-summary"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <strong>{label}</strong>
        <ChevronDown size={16} className="admin-row-chevron" />
      </button>
      {expanded && (
        <>
          <div className="admin-row-fields">
            {fields.map((field) =>
              field.key === "video_url" ? (
                <VideoField
                  key={field.key}
                  label={field.label}
                  value={draft[field.key]}
                  onChange={(next) => {
                    setErrors({ ...errors, [field.key]: "" });
                    setDraft({ ...draft, [field.key]: next });
                  }}
                />
              ) : (
                <label
                  key={field.key}
                  className={errors[field.key] ? "has-error" : ""}
                >
                  <span>
                    {field.label}
                    {!field.optional && <em className="admin-required">*</em>}
                  </span>
                  <textarea
                    rows={
                      field.key === "story" ||
                      field.key === "answer" ||
                      field.key === "content"
                        ? 4
                        : 1
                    }
                    value={draft[field.key] ?? ""}
                    onChange={(event) => {
                      setErrors({ ...errors, [field.key]: "" });
                      setDraft({ ...draft, [field.key]: event.target.value });
                    }}
                  />
                  {errors[field.key] && (
                    <small className="admin-field-error">
                      {errors[field.key]}
                    </small>
                  )}
                </label>
              ),
            )}
          </div>
          {message && <p className="admin-form-error">{message}</p>}
          <div className="admin-row-actions">
            <button type="button" className="button" onClick={save}>
              <Save size={15} />
              Save
            </button>
            {onDelete && (
              <button
                type="button"
                className="icon-danger"
                onClick={() => onDelete(item.id)}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
