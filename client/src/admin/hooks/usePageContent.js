import { useCallback, useEffect, useState } from "react";
import { apiError, parseContent, sessionExpired } from "../lib/helpers";

/**
 * Data hook for the JSON-backed pages (home, about).
 * Owns its own fetch + save so a page only ever calls its own endpoints:
 * GET /api/<page> on first open, then PUT /api/<page> + GET /api/<page> on save.
 */
export function usePageContent({ load, save, onNotice }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await load();
      setText(JSON.stringify(response.data, null, 2));
      setLoaded(true);
    } catch (cause) {
      if (cause.response?.status === 401) return sessionExpired();
      setError(apiError(cause, "This page could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, [load]);

  useEffect(() => {
    if (!loaded) refresh();
  }, [loaded, refresh]);

  const commit = useCallback(async () => {
    const value = parseContent(text);
    if (!value || Array.isArray(value))
      return {
        error: "This page could not be read. Reload the admin panel and try again.",
      };
    setLoading(true);
    try {
      await save(value);
      const response = await load();
      setText(JSON.stringify(response.data, null, 2));
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
  }, [text, save, load, onNotice]);

  return {
    content: parseContent(text) || {},
    value: text,
    setValue: setText,
    loading,
    loaded,
    error,
    refresh,
    commit,
  };
}
