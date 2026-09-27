import { useCallback, useEffect, useState } from "react";
import { apiError, sessionExpired } from "../lib/helpers";

/**
 * Data hook for record-based pages (program weeks, testimonials, FAQs,
 * resources). Every create/update/delete calls only that collection's
 * endpoints, then re-reads only that collection.
 */
export function useCollectionPage({ load, create, update, remove, blank, onNotice }) {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(blank);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await load();
      setItems(response.data);
      setLoaded(true);
    } catch (cause) {
      if (cause.response?.status === 401) return sessionExpired();
      setError(apiError(cause, "These records could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    if (!loaded) refresh();
  }, [loaded, refresh]);

  const run = useCallback(
    async (work, resetDraft = false) => {
      setLoading(true);
      try {
        await work();
        const response = await load();
        setItems(response.data);
        setLoaded(true);
        setError("");
        if (resetDraft) setDraft(blank);
        onNotice?.("Saved to MySQL.");
        return true;
      } catch (cause) {
        if (cause.response?.status === 401) return sessionExpired();
        const message = apiError(cause);
        setError(message);
        onNotice?.(message);
        return { error: message };
      } finally {
        setLoading(false);
      }
    },
    [load, blank, onNotice],
  );

  return {
    items,
    draft,
    setDraft,
    loading,
    loaded,
    error,
    refresh,
    submit: () => run(() => create(draft), true),
    saveItem: (id, value) => run(() => update(id, value)),
    deleteItem: (id) => run(() => remove(id)),
  };
}
