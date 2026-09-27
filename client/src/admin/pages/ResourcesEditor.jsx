import {
  createResource,
  deleteResource,
  getResources,
  updateResource,
} from "../../api/resources";
import { blankResource } from "../lib/blankRecords";
import { useCollectionPage } from "../hooks/useCollectionPage";
import CreateForm from "../components/CreateForm";
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

  if (page.loading)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <>
      <CreateForm
        title="Add resource"
        value={page.draft}
        setValue={page.setDraft}
        fields={FIELDS}
        onSubmit={page.submit}
      />
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
      />
    </>
  );
}
