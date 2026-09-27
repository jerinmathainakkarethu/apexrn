import {
  createProgramWeek,
  deleteProgramWeek,
  getProgram,
  updateProgramWeek,
} from "../../api/program";
import { blankWeek } from "../lib/blankRecords";
import { useCollectionPage } from "../hooks/useCollectionPage";
import CreateForm from "../components/CreateForm";
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

  if (page.loading)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <>
      <CreateForm
        title="Add program week"
        value={page.draft}
        setValue={page.setDraft}
        fields={FIELDS}
        onSubmit={page.submit}
      />
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
      />
    </>
  );
}
