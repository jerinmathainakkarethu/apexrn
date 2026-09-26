import { useEffect, useState } from "react";
import { ArrowRight, Check, LogOut, Plus, Save, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import Eyebrow from "../components/ui/Eyebrow";
import { getAbout, updateAbout } from "../api/about";
import { getMenu, updateMenu } from "../api/menu";
import { getHome, updateHome } from "../api/home";
import { getAdminContacts, getAdminQa, uploadImage } from "../api/admin";
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

const sections = [
  "Overview",
  "Pages",
  "Menu",
  "Home content",
  "About content",
  "Program weeks",
  "Testimonials",
  "FAQs",
  "Resources",
  "Messages",
  "Q&A registrations",
];
const pageOptions = [
  "Home",
  "About",
  "Program",
  "Testimonials",
  "FAQs",
  "Resources",
  "Contact",
  "Wednesday Q&A",
];
const blankTestimonial = {
  display_name: "",
  country: "",
  story: "",
  result: "",
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
  return fields.reduce((errors, [key, label]) => {
    if (!String(value[key] ?? "").trim()) errors[key] = `${label} is required.`;
    return errors;
  }, {});
}
function Editor({ title, value, onChange, onSave, saving }) {
  const [error, setError] = useState("");
  const submit = async () => {
    setError("");
    const result = await onSave();
    if (result?.error) setError(result.error);
  };
  return (
    <div className="admin-editor">
      <div className="admin-editor-top">
        <div>
          <Eyebrow>{title}</Eyebrow>
          <p>
            Edit the backend content JSON. Changes publish to the public site
            immediately.
          </p>
        </div>
        <button
          type="button"
          className="button"
          onClick={submit}
          disabled={saving}
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
      <textarea
        className={error ? "has-error" : ""}
        value={value}
        onChange={(event) => {
          setError("");
          onChange(event.target.value);
        }}
        spellCheck="false"
      />
      {error && <p className="admin-field-error">{error}</p>}
    </div>
  );
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

function HomeSection({ title, description, children }) {
  return (
    <section className="home-content-section">
      <div className="home-section-heading">
        <div>
          <span>Home section</span>
          <h3>{title}</h3>
        </div>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}

function HomeContentEditor({ value, onChange, onSave }) {
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
  if (!Object.keys(content).length)
    return (
      <Editor
        title="Homepage content"
        value={value}
        onChange={onChange}
        onSave={onSave}
        saving={false}
      />
    );
  return (
    <div className="home-content-editor">
      <div className="home-editor-toolbar">
        <div>
          <Eyebrow>Homepage builder</Eyebrow>
          <p>
            Edit each homepage section separately. Save once when you are ready
            to publish all changes.
          </p>
        </div>
        <button type="button" className="button" onClick={save}>
          <Save size={16} />
          Save homepage
        </button>
      </div>
      {error && <p className="admin-form-error">{error}</p>}
      {saved && (
        <p className="admin-form-success">
          Homepage changes saved successfully.
        </p>
      )}
      {uploadError && <p className="admin-form-error">{uploadError}</p>}
      <HomeSection title="SEO settings">
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
        title="Banner / hero"
        description="The first section visitors see"
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.hero?.eyebrow}
            onChange={(value) => update(["hero", "eyebrow"], value)}
          />
          <HomeField
            label="Banner title"
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
            label="Primary button text"
            value={content.hero?.primaryCta}
            onChange={(value) => update(["hero", "primaryCta"], value)}
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
      <HomeSection title="Program snapshot">
        <HomeField
          label="Snapshot items, one per line"
          value={(content.snapshot || []).join("\n")}
          onChange={(value) => updateList(["snapshot"], value)}
          multiline
        />
      </HomeSection>
      <HomeSection title="Audience section">
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.audience?.eyebrow}
            onChange={(value) => update(["audience", "eyebrow"], value)}
          />
          <HomeField
            label="Title"
            value={content.audience?.title}
            onChange={(value) => update(["audience", "title"], value)}
            multiline
          />
          <HomeField
            label="Copy"
            value={content.audience?.copy}
            onChange={(value) => update(["audience", "copy"], value)}
            multiline
          />
        </div>
        <div className="home-repeatable-grid">
          {(content.audience?.items || []).map((item, index) => (
            <div className="home-repeatable" key={`audience-${index}`}>
              <b>Audience item {index + 1}</b>
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
      <HomeSection title="Why APEX RN Prep">
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.approach?.eyebrow}
            onChange={(value) => update(["approach", "eyebrow"], value)}
          />
          <HomeField
            label="Title"
            value={content.approach?.title}
            onChange={(value) => update(["approach", "title"], value)}
            multiline
          />
          <HomeField
            label="Copy"
            value={content.approach?.copy}
            onChange={(value) => update(["approach", "copy"], value)}
            multiline
          />
          <HomeField
            label="Benefits, one per line"
            value={(content.approach?.benefits || []).join("\n")}
            onChange={(value) => updateList(["approach", "benefits"], value)}
            multiline
          />
        </div>
      </HomeSection>
      <HomeSection title="Program experience">
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.experience?.eyebrow}
            onChange={(value) => update(["experience", "eyebrow"], value)}
          />
          <HomeField
            label="Title"
            value={content.experience?.title}
            onChange={(value) => update(["experience", "title"], value)}
            multiline
          />
          <HomeField
            label="Copy"
            value={content.experience?.copy}
            onChange={(value) => update(["experience", "copy"], value)}
            multiline
          />
          <HomeField
            label="Experience items, one per line"
            value={(content.experience?.items || []).join("\n")}
            onChange={(value) => updateList(["experience", "items"], value)}
            multiline
          />
        </div>
        <ImageField
          label="Program experience image"
          image={{
            url: content.experience?.image,
            alt: content.experience?.imageAlt,
          }}
          onChange={(image) => {
            let next = setHomePath(content, ["experience", "image"], image.url);
            next = setHomePath(next, ["experience", "imageAlt"], image.alt);
            onChange(JSON.stringify(next, null, 2));
          }}
          onError={imageError}
        />
      </HomeSection>
      <HomeSection title="Curriculum">
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.curriculum?.eyebrow}
            onChange={(value) => update(["curriculum", "eyebrow"], value)}
          />
          <HomeField
            label="Title"
            value={content.curriculum?.title}
            onChange={(value) => update(["curriculum", "title"], value)}
            multiline
          />
          <HomeField
            label="Copy"
            value={content.curriculum?.copy}
            onChange={(value) => update(["curriculum", "copy"], value)}
            multiline
          />
        </div>
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
      <HomeSection title="Instructor">
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.instructor?.eyebrow}
            onChange={(value) => update(["instructor", "eyebrow"], value)}
          />
          <HomeField
            label="Title"
            value={content.instructor?.title}
            onChange={(value) => update(["instructor", "title"], value)}
            multiline
          />
          <HomeField
            label="Paragraphs, one per line"
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
          label="Instructor image"
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
      <HomeSection title="How support works">
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.process?.eyebrow}
            onChange={(value) => update(["process", "eyebrow"], value)}
          />
          <HomeField
            label="Title"
            value={content.process?.title}
            onChange={(value) => update(["process", "title"], value)}
            multiline
          />
          <HomeField
            label="Copy"
            value={content.process?.copy}
            onChange={(value) => update(["process", "copy"], value)}
            multiline
          />
        </div>
        <div className="home-repeatable-grid">
          {(content.process?.items || []).map((item, index) => (
            <div className="home-repeatable" key={`process-${index}`}>
              <b>Process step {index + 1}</b>
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
      </HomeSection>
      <HomeSection title="Editorial process and gallery">
        <div className="home-field-grid">
          <HomeField
            label="Process eyebrow"
            value={content.editorial?.processEyebrow}
            onChange={(value) => update(["editorial", "processEyebrow"], value)}
          />
          <HomeField
            label="Process title"
            value={content.editorial?.processTitle}
            onChange={(value) => update(["editorial", "processTitle"], value)}
            multiline
          />
          <HomeField
            label="Process copy"
            value={content.editorial?.processCopy}
            onChange={(value) => update(["editorial", "processCopy"], value)}
            multiline
          />
          <HomeField
            label="Process button"
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
          <HomeField
            label="Gallery eyebrow"
            value={content.editorial?.galleryEyebrow}
            onChange={(value) => update(["editorial", "galleryEyebrow"], value)}
          />
          <HomeField
            label="Gallery title"
            value={content.editorial?.galleryTitle}
            onChange={(value) => update(["editorial", "galleryTitle"], value)}
            multiline
          />
          <HomeField
            label="Gallery copy"
            value={content.editorial?.galleryCopy}
            onChange={(value) => update(["editorial", "galleryCopy"], value)}
            multiline
          />
        </div>
        <div className="home-repeatable-grid">
          {(content.editorial?.galleryItems || []).map((item, index) => (
            <div className="home-repeatable" key={`gallery-item-${index}`}>
              <b>Gallery card {index + 1}</b>
              <HomeField
                label="Card title"
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
                label="Card description"
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
                label="Card image"
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
        <div className="home-repeatable-grid">
          {(content.editorial?.processImages || []).map((image, index) => (
            <div className="home-repeatable" key={`process-image-${index}`}>
              <b>Rotating image {index + 1}</b>
              <ImageField
                label="Process image"
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
      <HomeSection title="Community, Q&A, pricing and final CTA">
        <div className="home-field-grid">
          <HomeField
            label="Community title"
            value={content.community?.title}
            onChange={(value) => update(["community", "title"], value)}
            multiline
          />
          <HomeField
            label="Community copy"
            value={content.community?.copy}
            onChange={(value) => update(["community", "copy"], value)}
            multiline
          />
          <HomeField
            label="Community items, one per line"
            value={(content.community?.items || []).join("\n")}
            onChange={(value) => updateList(["community", "items"], value)}
            multiline
          />
          <HomeField
            label="Q&A eyebrow"
            value={content.qa?.eyebrow}
            onChange={(value) => update(["qa", "eyebrow"], value)}
          />
          <HomeField
            label="Q&A title"
            value={content.qa?.title}
            onChange={(value) => update(["qa", "title"], value)}
            multiline
          />
          <HomeField
            label="Q&A copy"
            value={content.qa?.copy}
            onChange={(value) => update(["qa", "copy"], value)}
            multiline
          />
          <HomeField
            label="Q&A button"
            value={content.qa?.button}
            onChange={(value) => update(["qa", "button"], value)}
          />
          <HomeField
            label="Pricing title"
            value={content.pricing?.title}
            onChange={(value) => update(["pricing", "title"], value)}
            multiline
          />
          <HomeField
            label="Pricing copy"
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
            label="Included text"
            value={content.pricing?.included}
            onChange={(value) => update(["pricing", "included"], value)}
            multiline
          />
          <HomeField
            label="Final CTA title"
            value={content.finalCta?.title}
            onChange={(value) => update(["finalCta", "title"], value)}
            multiline
          />
          <HomeField
            label="Final CTA primary button"
            value={content.finalCta?.primary}
            onChange={(value) => update(["finalCta", "primary"], value)}
          />
          <HomeField
            label="Final CTA secondary button"
            value={content.finalCta?.secondary}
            onChange={(value) => update(["finalCta", "secondary"], value)}
          />
        </div>
        <ImageField
          label="Student community image"
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
        <ImageField
          label="Wednesday Q&A image"
          image={{ url: content.qa?.image, alt: content.qa?.imageAlt }}
          onChange={(image) => {
            let next = setHomePath(content, ["qa", "image"], image.url);
            next = setHomePath(next, ["qa", "imageAlt"], image.alt);
            onChange(JSON.stringify(next, null, 2));
          }}
          onError={imageError}
        />
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
  const [selectedPage, setSelectedPage] = useState("Home");
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
    try {
      const [
        home,
        about,
        menuItems,
        weeks,
        stories,
        faqItems,
        resourceItems,
        messages,
        qa,
      ] = await Promise.all([
        getHome(),
        getAbout(),
        getMenu(),
        getProgram(),
        getTestimonials(),
        fetchCollection("/faqs"),
        fetchCollection("/resources"),
        getAdminContacts(),
        getAdminQa(),
      ]);
      setHomeText(JSON.stringify(home.data, null, 2));
      setAboutText(JSON.stringify(about.data, null, 2));
      setMenu(menuItems.data);
      setProgram(weeks.data);
      setTestimonials(stories.data);
      setFaqs(faqItems);
      setResources(resourceItems);
      setContacts(messages.data);
      setRegistrations(qa.data);
    } catch (error) {
      if (error.response?.status === 401) logout();
      else
        setNotice(
          error.response?.data?.message || "Could not load admin content.",
        );
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
      return { error: "Content must be a valid JSON object." };
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
            {sections.map((section) => (
              <button
                className={active === section ? "selected" : ""}
                onClick={() => setActive(section)}
                key={section}
              >
                {section}
              </button>
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
              selectedPage={selectedPage}
              setSelectedPage={setSelectedPage}
              pageOptions={pageOptions}
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
    selectedPage,
    setSelectedPage,
    pageOptions,
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
  } = props;
  if (active === "Overview")
    return (
      <div className="admin-stats">
        {[
          ["Program weeks", program.length],
          ["Testimonials", testimonials.length],
          ["FAQs", faqs.length],
          ["Resources", resources.length],
          ["Messages", contacts.length],
          ["Q&A registrations", registrations.length],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{value}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>
    );
  if (active === "Pages")
    return (
      <PageManager
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        pageOptions={pageOptions}
        homeText={homeText}
        setHomeText={setHomeText}
        aboutText={aboutText}
        setAboutText={setAboutText}
        saveJson={saveJson}
        program={program}
        testimonials={testimonials}
        faqs={faqs}
        resources={resources}
        contacts={contacts}
        registrations={registrations}
        newWeek={newWeek}
        setNewWeek={setNewWeek}
        newTestimonial={newTestimonial}
        setNewTestimonial={setNewTestimonial}
        newFaq={newFaq}
        setNewFaq={setNewFaq}
        newResource={newResource}
        setNewResource={setNewResource}
        action={action}
      />
    );
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
        onSave={() =>
          saveJson(homeText, (value) => action(() => updateHome(value)))
        }
      />
    );
  if (active === "About content")
    return (
      <Editor
        title="About content"
        value={aboutText}
        onChange={setAboutText}
        onSave={() =>
          saveJson(aboutText, (value) =>
            action(() =>
              import("../services/api").then(({ updateAbout }) =>
                updateAbout(value),
              ),
            ),
          )
        }
        saving={false}
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
          fields={[
            { key: "display_name", label: "Name" },
            { key: "country", label: "Country" },
            { key: "story", label: "Story" },
            { key: "result", label: "Result" },
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
        ;
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
        ;
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
        ;
      </>
    );
  if (active === "Messages")
    return <Inbox items={contacts} title="Contact messages" />;
  if (active === "Q&A registrations")
    return <Inbox items={registrations} title="Wednesday Q&A registrations" />;
  return null;
}

function PageManager(props) {
  const {
    selectedPage,
    setSelectedPage,
    pageOptions,
    homeText,
    setHomeText,
    aboutText,
    setAboutText,
    saveJson,
    program,
    testimonials,
    faqs,
    resources,
    contacts,
    registrations,
    newWeek,
    setNewWeek,
    newTestimonial,
    setNewTestimonial,
    newFaq,
    setNewFaq,
    newResource,
    setNewResource,
    action,
  } = props;
  return (
    <div className="page-workspace">
      <div className="page-manager-heading">
        <div>
          <Eyebrow>Site pages</Eyebrow>
          <h2>Pages</h2>
          <p>Choose a page to edit its published content.</p>
        </div>
        <span className="page-count">{pageOptions.length} pages</span>
      </div>
      <div className="page-manager">
        <div className="page-list">
          <div className="page-list-heading">
            <span>All pages</span>
            <b>{pageOptions.length}</b>
          </div>
          {pageOptions.map((page) => (
            <button
              className={selectedPage === page ? "selected" : ""}
              onClick={() => setSelectedPage(page)}
              key={page}
            >
              <span>
                <strong>{page}</strong>
                <small>Published</small>
              </span>
              <ArrowRight size={15} />
            </button>
          ))}
        </div>
        <div className="page-editor-shell">
          <div className="page-editor-heading">
            <div>
              <span className="page-editor-type">Page</span>
              <h3>{selectedPage}</h3>
            </div>
            <span className="page-status">
              <i />
              Published
            </span>
          </div>
          <div className="page-editor-layout">
            <div className="page-editor">
              {selectedPage === "Home" && (
                <HomeContentEditor
                  value={homeText}
                  onChange={setHomeText}
                  onSave={() =>
                    saveJson(homeText, (value) =>
                      action(() => updateHome(value)),
                    )
                  }
                />
              )}
              {selectedPage === "About" && (
                <Editor
                  title="About page content"
                  value={aboutText}
                  onChange={setAboutText}
                  onSave={() =>
                    saveJson(aboutText, (value) =>
                      action(() => updateAbout(value)),
                    )
                  }
                  saving={false}
                />
              )}
              {selectedPage === "Program" && (
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
                      action(() => createProgramWeek(newWeek)).then(() =>
                        setNewWeek(blankWeek),
                      )
                    }
                  />
                  <Collection
                    title="Program content"
                    items={program}
                    fields={[
                      { key: "week_number", label: "Week" },
                      { key: "title", label: "Title" },
                      { key: "description", label: "Description" },
                    ]}
                    onSave={(id, value) =>
                      action(() => updateProgramWeek(id, value))
                    }
                    onDelete={(id) => action(() => deleteProgramWeek(id))}
                  />
                </>
              )}
              {selectedPage === "Testimonials" && (
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
                    ]}
                    onSubmit={() =>
                      action(() => createTestimonial(newTestimonial)).then(() =>
                        setNewTestimonial(blankTestimonial),
                      )
                    }
                  />
                  <Collection
                    title="Testimonials content"
                    items={testimonials}
                    fields={[
                      { key: "display_name", label: "Name" },
                      { key: "country", label: "Country" },
                      { key: "story", label: "Story" },
                      { key: "result", label: "Result" },
                    ]}
                    onSave={(id, value) =>
                      action(() => updateTestimonial(id, value))
                    }
                    onDelete={(id) => action(() => deleteTestimonial(id))}
                  />
                </>
              )}
              {selectedPage === "FAQs" && (
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
                      action(() => createFaq(newFaq)).then(() =>
                        setNewFaq(blankFaq),
                      )
                    }
                  />
                  <Collection
                    title="FAQs content"
                    items={faqs}
                    fields={[
                      { key: "question", label: "Question" },
                      { key: "answer", label: "Answer" },
                    ]}
                    onSave={(id, value) => action(() => updateFaq(id, value))}
                    onDelete={(id) => action(() => deleteFaq(id))}
                  />
                </>
              )}
              {selectedPage === "Resources" && (
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
                      action(() => createResource(newResource)).then(() =>
                        setNewResource(blankResource),
                      )
                    }
                  />
                  <Collection
                    title="Resources content"
                    items={resources}
                    fields={[
                      { key: "title", label: "Title" },
                      { key: "slug", label: "Slug" },
                      { key: "excerpt", label: "Excerpt" },
                      { key: "content", label: "Content" },
                    ]}
                    onSave={(id, value) =>
                      action(() => updateResource(id, value))
                    }
                    onDelete={(id) => action(() => deleteResource(id))}
                  />
                </>
              )}
              {selectedPage === "Contact" && (
                <Inbox title="Contact page submissions" items={contacts} />
              )}
              {selectedPage === "Wednesday Q&A" && (
                <Inbox
                  title="Wednesday Q&A registrations"
                  items={registrations}
                />
              )}
            </div>
          </div>
          <aside className="page-publish-panel">
            <div className="page-publish-card">
              <div className="page-publish-card-heading">
                <span>Publish</span>
                <span className="page-publish-dot" />
              </div>
              <p>This page is live on the public website.</p>
              <button
                type="button"
                className="page-preview-button"
                onClick={() =>
                  window.open(
                    selectedPage === "Home"
                      ? "/"
                      : `/${selectedPage.toLowerCase()}`,
                    "_blank",
                  )
                }
              >
                View page
              </button>
            </div>
            <div className="page-publish-card page-help-card">
              <span>Editing guide</span>
              <p>
                Update the content fields, then save. Changes are stored in
                MySQL and appear on the public page.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
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
        {fields.map(([key, label]) => (
          <label key={key} className={errors[key] ? "has-error" : ""}>
            {label}
            <textarea
              rows={
                key === "story" || key === "answer" || key === "content" ? 3 : 1
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
        ))}
      </div>
      {submitError && <p className="admin-form-error">{submitError}</p>}
      <button type="button" className="button" onClick={submit}>
        <Plus size={16} />
        Create
      </button>
    </div>
  );
}
function Collection({ title, items, fields, onSave, onDelete }) {
  return (
    <div className="admin-collection">
      <div className="admin-section-heading">
        <Eyebrow>{title}</Eyebrow>
        <span>{items.length} records</span>
      </div>
      {items.map((item) => (
        <RowEditor
          key={item.id}
          item={item}
          fields={fields}
          onSave={(value) => onSave(item.id, value)}
          onDelete={onDelete}
        />
      ))}
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
function RowEditor({ item, fields, onSave, onDelete }) {
  const [draft, setDraft] = useState(item);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const save = async () => {
    const nextErrors = validateFields(
      draft,
      fields.map((field) => [field.key, field.label]),
    );
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length) return;
    const result = await onSave(draft);
    if (result?.error) setMessage(result.error);
  };
  return (
    <div className="admin-row">
      <div className="admin-row-fields">
        {fields.map((field) => (
          <label
            key={field.key}
            className={errors[field.key] ? "has-error" : ""}
          >
            {field.label}
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
              <small className="admin-field-error">{errors[field.key]}</small>
            )}
          </label>
        ))}
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
    </div>
  );
}
