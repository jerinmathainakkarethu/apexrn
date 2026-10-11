import {
  createResource,
  deleteResource,
  getResources,
  updateResource,
} from "../../api/resources";
import { blankResource } from "../lib/blankRecords";
import { useCollectionPage } from "../hooks/useCollectionPage";
import Collection from "../components/Collection";

const FIELDS = [
  ["title", "Title"],
  ["slug", "Slug"],
  ["excerpt", "Excerpt"],
  ["content", "Content"],
];

export default function ResourcesEditor({ onNotice }) {
  const page = useCollectionPage({
    load: getResources,
    create: createResource,
    update: updateResource,
    remove: deleteResource,
    blank: blankResource,
    onNotice,
  });

  if (page.loading && !page.loaded)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error && !page.loaded)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <Collection
      title="Resources"
      items={page.items}
      summaryKey="title"
      fields={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        { key: "excerpt", label: "Excerpt" },
        { key: "content", label: "Content" },
      ]}
      onSave={page.saveItem}
      onDelete={page.deleteItem}
      draft={page.draft}
      blank={blankResource}
      setDraft={page.setDraft}
      addFields={FIELDS}
      addLabel="Add resource"
      onAdd={page.submit}
      loading={page.loading}
      emptyMessage="No resources yet. Add your first one."
    />
  );
}
