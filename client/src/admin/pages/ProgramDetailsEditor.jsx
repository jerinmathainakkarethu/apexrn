import {
  BookOpen,
  CalendarDays,
  FileText,
  Layers,
  ListChecks,
  MessageCircle,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { getProgramDetails, updateProgramDetails } from "../../api/programDetails";
import { usePageContent } from "../hooks/usePageContent";
import { linesToArray, useContentDocument } from "../lib/helpers";
import HomeSection from "../components/HomeSection";
import HomeField from "../components/HomeField";
import PageEditorShell from "../components/PageEditorShell";

const PROGRAM_DETAILS_NAV = [
  { id: "curriculum-header", label: "Page header" },
  { id: "curriculum-structure", label: "Week structure" },
  { id: "curriculum-weeks", label: "Week by week" },
  { id: "curriculum-systems", label: "Systems" },
  { id: "curriculum-resources", label: "Sample resources" },
  { id: "curriculum-practice", label: "Practice & feedback" },
  { id: "curriculum-cta", label: "Closing CTA" },
];

const RESOURCE_KINDS = ["slide", "video", "cheatsheet"];

export default function ProgramDetailsEditor({ onNotice }) {
  const page = usePageContent({
    load: getProgramDetails,
    save: updateProgramDetails,
    onNotice,
  });
  const { content, update, updateItem, updateList } = useContentDocument(
    page.value,
    page.setValue,
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
  const newWeek = (index) => ({
    number: String(index + 1).padStart(2, "0"),
    title: "",
    summary: "",
    live: "",
    selfStudy: "",
    homework: "",
    topics: [],
  });

  return (
    <PageEditorShell
      eyebrow="Curriculum page builder"
      heading="Edit the program details page"
      description="Sections below are in the same order they appear on the live curriculum page. Open one, make your edits, then save once at the end."
      saveLabel="Save curriculum page"
      successMessage="Curriculum page changes saved successfully."
      emptyTitle="Curriculum content"
      emptyMessage="The curriculum content could not be loaded, so the inputs are unavailable. Check that the API server is running, then retry."
      hasContent={Object.keys(content).length > 0}
      loading={page.loading}
      onSave={page.commit}
      nav={PROGRAM_DETAILS_NAV}
      onRetry={page.refresh}
    >
      <HomeSection
        anchorId="curriculum-header"
        number="01"
        icon={BookOpen}
        title="Page header"
        where="Eyebrow, page title, intro, the note under the title and the summary strip."
        preview={content.hero?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.hero?.eyebrow}
            onChange={(value) => update(["hero", "eyebrow"], value)}
          />
          <HomeField
            label="Page title"
            value={content.hero?.title}
            onChange={(value) => update(["hero", "title"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Intro"
          value={content.hero?.intro}
          onChange={(value) => update(["hero", "intro"], value)}
          multiline
        />
        <HomeField
          label="Note under the title"
          value={content.hero?.note}
          onChange={(value) => update(["hero", "note"], value)}
          multiline
        />
        <HomeField
          label="Summary strip (one item per line)"
          value={(content.snapshot || []).join("\n")}
          onChange={(value) => updateList(["snapshot"], value)}
          multiline
        />
        <HomeField
          label="Page title (browser tab)"
          value={content.seo?.title}
          onChange={(value) => update(["seo", "title"], value)}
        />
        <HomeField
          label="Meta description"
          value={content.seo?.description}
          onChange={(value) => update(["seo", "description"], value)}
          multiline
        />
      </HomeSection>

      <HomeSection
        anchorId="curriculum-structure"
        number="02"
        icon={ListChecks}
        title="Week structure"
        where="The three cards explaining live sessions, self-study and homework."
        preview={content.structure?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.structure?.eyebrow}
            onChange={(value) => update(["structure", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.structure?.title}
            onChange={(value) => update(["structure", "title"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Copy"
          value={content.structure?.copy}
          onChange={(value) => update(["structure", "copy"], value)}
          multiline
        />
        <div className="home-repeatable-grid">
          {(content.structure?.items || []).map((item, index) => (
            <div
              className="home-repeatable"
              key={`curriculum-structure-${index}`}
            >
              <b>Card {index + 1}</b>
              <HomeField
                label="Title"
                value={item.title}
                onChange={(value) =>
                  updateItem(["structure", "items"], index, "title", value)
                }
              />
              <HomeField
                label="Copy"
                value={item.copy}
                onChange={(value) =>
                  updateItem(["structure", "items"], index, "copy", value)
                }
                multiline
              />
              <HomeField
                label="Points (one per line)"
                value={(item.points || []).join("\n")}
                onChange={(value) =>
                  updateItem(
                    ["structure", "items"],
                    index,
                    "points",
                    linesToArray(value),
                  )
                }
                multiline
              />
              <button
                type="button"
                className="icon-danger"
                aria-label={`Remove card ${index + 1}`}
                onClick={() => removeItem(["structure", "items"], index)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add-row"
            onClick={() =>
              addItem(["structure", "items"], { title: "", copy: "", points: [] })
            }
          >
            <Plus size={15} />
            Add card
          </button>
        </div>
      </HomeSection>

      <HomeSection
        anchorId="curriculum-weeks"
        number="03"
        icon={CalendarDays}
        title="Week by week"
        where="The 11 expandable weeks: summary, live, self-study, homework and topics."
        preview={content.weeksIntro?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.weeksIntro?.eyebrow}
            onChange={(value) => update(["weeksIntro", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.weeksIntro?.title}
            onChange={(value) => update(["weeksIntro", "title"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Copy"
          value={content.weeksIntro?.copy}
          onChange={(value) => update(["weeksIntro", "copy"], value)}
          multiline
        />
        <div className="home-repeatable-grid">
          {(content.weeks || []).map((week, index) => (
            <div className="home-repeatable" key={`curriculum-week-${index}`}>
              <b>
                Week {week.number} {week.title ? `- ${week.title}` : ""}
              </b>
              <div className="home-field-grid">
                <HomeField
                  label="Week number"
                  value={week.number}
                  onChange={(value) =>
                    updateItem(["weeks"], index, "number", value)
                  }
                />
                <HomeField
                  label="Title"
                  value={week.title}
                  onChange={(value) =>
                    updateItem(["weeks"], index, "title", value)
                  }
                />
              </div>
              <HomeField
                label="Summary"
                value={week.summary}
                onChange={(value) =>
                  updateItem(["weeks"], index, "summary", value)
                }
                multiline
              />
              <div className="home-field-grid">
                <HomeField
                  label="Live sessions"
                  value={week.live}
                  onChange={(value) =>
                    updateItem(["weeks"], index, "live", value)
                  }
                />
                <HomeField
                  label="Self-study"
                  value={week.selfStudy}
                  onChange={(value) =>
                    updateItem(["weeks"], index, "selfStudy", value)
                  }
                />
              </div>
              <HomeField
                label="Homework"
                value={week.homework}
                onChange={(value) =>
                  updateItem(["weeks"], index, "homework", value)
                }
                multiline
              />
              <HomeField
                label="Topics (one per line)"
                value={(week.topics || []).join("\n")}
                  onChange={(value) =>
                    updateItem(["weeks"], index, "topics", linesToArray(value))
                  }
                multiline
              />
              <button
                type="button"
                className="icon-danger"
                aria-label={`Remove week ${week.number}`}
                onClick={() => removeItem(["weeks"], index)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add-row"
            onClick={() =>
              addItem(["weeks"], newWeek((content.weeks || []).length))
            }
          >
            <Plus size={15} />
            Add week
          </button>
        </div>
      </HomeSection>

      <HomeSection
        anchorId="curriculum-systems"
        number="04"
        icon={Layers}
        title="Systems breakdown"
        where="The seven system cards with weeks, live hours and how each block is assessed."
        preview={content.systems?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.systems?.eyebrow}
            onChange={(value) => update(["systems", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.systems?.title}
            onChange={(value) => update(["systems", "title"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Copy"
          value={content.systems?.copy}
          onChange={(value) => update(["systems", "copy"], value)}
          multiline
        />
        <div className="home-repeatable-grid">
          {(content.systems?.items || []).map((item, index) => (
            <div
              className="home-repeatable"
              key={`curriculum-system-${index}`}
            >
              <b>System {index + 1}</b>
              <HomeField
                label="Title"
                value={item.title}
                onChange={(value) =>
                  updateItem(["systems", "items"], index, "title", value)
                }
              />
              <div className="home-field-grid">
                <HomeField
                  label="Weeks"
                  value={item.weeks}
                  onChange={(value) =>
                    updateItem(["systems", "items"], index, "weeks", value)
                  }
                />
                <HomeField
                  label="Live hours"
                  value={item.hours}
                  onChange={(value) =>
                    updateItem(["systems", "items"], index, "hours", value)
                  }
                />
              </div>
              <HomeField
                label="Description"
                value={item.description}
                onChange={(value) =>
                  updateItem(["systems", "items"], index, "description", value)
                }
                multiline
              />
              <HomeField
                label="Points (one per line)"
                value={(item.points || []).join("\n")}
                onChange={(value) =>
                  updateItem(
                    ["systems", "items"],
                    index,
                    "points",
                    linesToArray(value),
                  )
                }
                multiline
              />
              <button
                type="button"
                className="icon-danger"
                aria-label={`Remove system ${index + 1}`}
                onClick={() => removeItem(["systems", "items"], index)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add-row"
            onClick={() =>
              addItem(["systems", "items"], {
                title: "",
                weeks: "",
                hours: "",
                description: "",
                points: [],
              })
            }
          >
            <Plus size={15} />
            Add system
          </button>
        </div>
      </HomeSection>

      <HomeSection
        anchorId="curriculum-resources"
        number="05"
        icon={FileText}
        title="Sample resources"
        where="The sample slides, recorded lesson clip and cheat sheet shown to prospective students."
        preview={content.resourcesIntro?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.resourcesIntro?.eyebrow}
            onChange={(value) => update(["resourcesIntro", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.resourcesIntro?.title}
            onChange={(value) => update(["resourcesIntro", "title"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Copy"
          value={content.resourcesIntro?.copy}
          onChange={(value) => update(["resourcesIntro", "copy"], value)}
          multiline
        />
        <p className="home-section-note">
          A resource with no file URL shows a placeholder on the live page
          instead of a link, so the grid never renders a dead "Open sample"
          button. Add the URL once the sample is ready to publish.
        </p>
        <div className="home-repeatable-grid">
          {(content.resources || []).map((resource, index) => (
            <div
              className="home-repeatable"
              key={`curriculum-resource-${index}`}
            >
              <b>Sample {index + 1}</b>
              <div className="home-field-grid">
                <HomeField
                  label="Type"
                  value={resource.kind}
                  onChange={(value) =>
                    updateItem(["resources"], index, "kind", value)
                  }
                />
                <HomeField
                  label="File URL"
                  value={resource.url}
                  onChange={(value) =>
                    updateItem(["resources"], index, "url", value)
                  }
                />
              </div>
              <p className="home-section-note">
                Type is one of: {RESOURCE_KINDS.join(", ")}. It decides the
                icon and card styling. "video" is for the recorded lesson clip.
              </p>
              <HomeField
                label="Title"
                value={resource.title}
                onChange={(value) =>
                  updateItem(["resources"], index, "title", value)
                }
              />
              <HomeField
                label="Description"
                value={resource.description}
                onChange={(value) =>
                  updateItem(["resources"], index, "description", value)
                }
                multiline
              />
              <HomeField
                label="Meta line"
                value={resource.meta}
                onChange={(value) =>
                  updateItem(["resources"], index, "meta", value)
                }
              />
              <HomeField
                label="Image URL (optional)"
                value={resource.image}
                onChange={(value) =>
                  updateItem(["resources"], index, "image", value)
                }
              />
              <button
                type="button"
                className="icon-danger"
                aria-label={`Remove sample ${index + 1}`}
                onClick={() => removeItem(["resources"], index)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add-row"
            onClick={() =>
              addItem(["resources"], {
                kind: "slide",
                title: "",
                description: "",
                meta: "",
                url: "",
                image: "",
              })
            }
          >
            <Plus size={15} />
            Add sample
          </button>
        </div>
      </HomeSection>

      <HomeSection
        anchorId="curriculum-practice"
        number="06"
        icon={Target}
        title="Practice & feedback"
        where="The four numbers and the five steps explaining how questions, mocks and weak areas work."
        preview={content.practice?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.practice?.eyebrow}
            onChange={(value) => update(["practice", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.practice?.title}
            onChange={(value) => update(["practice", "title"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Copy"
          value={content.practice?.copy}
          onChange={(value) => update(["practice", "copy"], value)}
          multiline
        />
        <div className="home-repeatable-grid">
          {(content.practice?.stats || []).map((stat, index) => (
            <div className="home-repeatable" key={`curriculum-stat-${index}`}>
              <b>Number {index + 1}</b>
              <div className="home-field-grid">
                <HomeField
                  label="Value"
                  value={stat.value}
                  onChange={(value) =>
                    updateItem(["practice", "stats"], index, "value", value)
                  }
                />
                <HomeField
                  label="Label"
                  value={stat.label}
                  onChange={(value) =>
                    updateItem(["practice", "stats"], index, "label", value)
                  }
                />
              </div>
              <button
                type="button"
                className="icon-danger"
                aria-label={`Remove number ${index + 1}`}
                onClick={() => removeItem(["practice", "stats"], index)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add-row"
            onClick={() =>
              addItem(["practice", "stats"], { value: "", label: "" })
            }
          >
            <Plus size={15} />
            Add number
          </button>
        </div>
        <div className="home-repeatable-grid">
          {(content.practice?.steps || []).map((step, index) => (
            <div className="home-repeatable" key={`curriculum-step-${index}`}>
              <b>Step {index + 1}</b>
              <HomeField
                label="Title"
                value={step.title}
                onChange={(value) =>
                  updateItem(["practice", "steps"], index, "title", value)
                }
              />
              <HomeField
                label="Copy"
                value={step.copy}
                onChange={(value) =>
                  updateItem(["practice", "steps"], index, "copy", value)
                }
                multiline
              />
              <button
                type="button"
                className="icon-danger"
                aria-label={`Remove step ${index + 1}`}
                onClick={() => removeItem(["practice", "steps"], index)}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-add-row"
            onClick={() =>
              addItem(["practice", "steps"], { title: "", copy: "" })
            }
          >
            <Plus size={15} />
            Add step
          </button>
        </div>
      </HomeSection>

      <HomeSection
        anchorId="curriculum-cta"
        number="07"
        icon={MessageCircle}
        title="Closing CTA"
        where="The dark band at the bottom of the page, above the footer."
        preview={content.finalCta?.title}
      >
        <div className="home-field-grid">
          <HomeField
            label="Eyebrow"
            value={content.finalCta?.eyebrow}
            onChange={(value) => update(["finalCta", "eyebrow"], value)}
          />
          <HomeField
            label="Heading"
            value={content.finalCta?.title}
            onChange={(value) => update(["finalCta", "title"], value)}
            multiline
          />
        </div>
        <HomeField
          label="Copy"
          value={content.finalCta?.copy}
          onChange={(value) => update(["finalCta", "copy"], value)}
          multiline
        />
        <div className="home-field-grid">
          <HomeField
            label="Primary button"
            value={content.finalCta?.primary}
            onChange={(value) => update(["finalCta", "primary"], value)}
          />
          <HomeField
            label="Secondary button"
            value={content.finalCta?.secondary}
            onChange={(value) => update(["finalCta", "secondary"], value)}
          />
        </div>
      </HomeSection>
    </PageEditorShell>
  );
}
