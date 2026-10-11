import {
  createFaq,
  deleteFaq,
  getFaqs,
  updateFaq,
} from "../../api/faqs";
import { blankFaq } from "../lib/blankRecords";
import { useCollectionPage } from "../hooks/useCollectionPage";
import Collection from "../components/Collection";
import { apiError } from "../lib/helpers";

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

  if (page.loading && !page.loaded)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error && !page.loaded)
    return <p className="admin-form-error">{page.error}</p>;

  const moveFaqs = async (orderedFaqs) => {
    try {
      for (const [index, faq] of orderedFaqs.entries()) {
        await updateFaq(faq.id, {
          question: faq.question,
          answer: faq.answer,
          sort_order: index + 1,
        });
      }
      await page.refresh();
      return true;
    } catch (error) {
      await page.refresh();
      return { error: apiError(error, "FAQ order could not be saved.") };
    }
  };

  return (
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
      draft={page.draft}
      blank={blankFaq}
      setDraft={page.setDraft}
      addFields={FIELDS}
      addLabel="Add FAQ"
      onAdd={(draft) =>
        page.submit({
          ...draft,
          sort_order:
            Math.max(
              0,
              ...page.items.map((faq) => Number(faq.sort_order) || 0),
            ) + 1,
        })
      }
      loading={page.loading}
      draggable
      onMove={moveFaqs}
      emptyMessage="No FAQs yet. Add your first one."
    />
  );
}
