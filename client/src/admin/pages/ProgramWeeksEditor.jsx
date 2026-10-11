import {
  createProgramWeek,
  deleteProgramWeek,
  getProgram,
  updateProgramWeek,
} from "../../api/program";
import { blankWeek } from "../lib/blankRecords";
import { useCollectionPage } from "../hooks/useCollectionPage";
import Collection from "../components/Collection";

const FIELDS = [
  ["week_number", "Week"],
  ["title", "Title"],
  ["description", "Description"],
];

export default function ProgramWeeksEditor({ onNotice }) {
  const page = useCollectionPage({
    load: getProgram,
    create: createProgramWeek,
    update: updateProgramWeek,
    remove: deleteProgramWeek,
    blank: blankWeek,
    onNotice,
  });

  if (page.loading && !page.loaded)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error && !page.loaded)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <Collection
      title="Program weeks"
      items={page.items}
      summaryKey="title"
      fields={[
        { key: "week_number", label: "Week" },
        { key: "title", label: "Title" },
        { key: "description", label: "Description" },
      ]}
      onSave={page.saveItem}
      onDelete={page.deleteItem}
      draft={page.draft}
      blank={blankWeek}
      setDraft={page.setDraft}
      addFields={FIELDS}
      addLabel="Add program week"
      onAdd={page.submit}
      loading={page.loading}
      emptyMessage="No program weeks yet. Add the first one."
    />
  );
}
