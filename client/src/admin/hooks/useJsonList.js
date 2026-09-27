import { useCallback, useEffect, useState } from "react";
import { apiError, sessionExpired } from "../lib/helpers";

/**
 * Data hook for whole-list JSON content (the header menu, the inboxes).
 * Saves send the complete list back to the page's own endpoint.
 */
export function useJsonList({ load, save, onNotice }) {
  const [items, setItems] = useState([]);
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

  const commit = useCallback(
    async (nextItems) => {
      setLoading(true);
      try {
        await save(nextItems);
        const response = await load();
        setItems(response.data);
        setLoaded(true);
        setError("");
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
    [save, load, onNotice],
  );

  return { items, loading, loaded, error, refresh, commit };
}
