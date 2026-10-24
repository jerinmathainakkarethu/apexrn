import { useCallback, useEffect, useState } from "react";
import { apiError, sessionExpired } from "../lib/helpers";
import { getTestimonials } from "../../api/testimonials";
import { getFaqs } from "../../api/faqs";
import { getResources } from "../../api/resources";
import { getAdminContacts, getAdminQa } from "../../api/admin";

/**
 * The overview is the only page that reports on every collection, so it is
 * the only place that reads more than one endpoint. It fires those reads
 * once, on its own open, and never on a save.
 */
export function useOverviewCounts() {
  const [counts, setCounts] = useState({
    testimonials: 0,
    faqs: 0,
    resources: 0,
    contacts: 0,
    registrations: 0,
  });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [testimonials, faqs, resources, contacts, qa] =
        await Promise.all([
          getTestimonials(),
          getFaqs(),
          getResources(),
          getAdminContacts(),
          getAdminQa(),
        ]);
      setCounts({
        testimonials: testimonials.data.length,
        faqs: faqs.data.length,
        resources: resources.data.length,
        contacts: contacts.data.length,
        registrations: qa.data.length,
      });
      setLoaded(true);
    } catch (cause) {
      if (cause.response?.status === 401) return sessionExpired();
      setError(apiError(cause, "The overview counts could not be loaded."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loaded) refresh();
  }, [loaded, refresh]);

  return { counts, loading, loaded, error, refresh };
}
