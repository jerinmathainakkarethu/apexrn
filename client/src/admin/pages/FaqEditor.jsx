import { createFaq, deleteFaq, getFaqs, updateFaq } from "../../api/faqs";
import { blankFaq } from "../lib/blankRecords";
import { useCollectionPage } from "../hooks/useCollectionPage";
import CreateForm from "../components/CreateForm";
import Collection from "../components/Collection";

const FIELDS = [
  ["question", "Question"],
  ["answer", "Answer"],
];

export default function FaqEditor({ onNotice }) {
  const page = useCollectionPage({
    load: getFaqs,
    create: createFaq,
    update: updateFaq,
    remove: deleteFaq,
    blank: blankFaq,
    onNotice,
  });

  if (page.loading)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <>
      <CreateForm
        title="Add FAQ"
        value={page.draft}
        setValue={page.setDraft}
        fields={FIELDS}
        onSubmit={page.submit}
      />
      <Collection
        title="FAQs"
        items={page.items}
        summaryKey="question"
        fields={[
          { key: "question", label: "Question" },
          { key: "answer", label: "Answer" },
        ]}
        onSave={page.saveItem}
        onDelete={page.deleteItem}
      />
    </>
  );
}
