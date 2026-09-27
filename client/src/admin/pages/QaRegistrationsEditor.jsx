import { getAdminQa } from "../../api/admin";
import { useJsonList } from "../hooks/useJsonList";
import Inbox from "../components/Inbox";

export default function QaRegistrationsEditor() {
  const page = useJsonList({ load: getAdminQa });

  if (page.loading)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error)
    return <p className="admin-form-error">{page.error}</p>;

  return <Inbox items={page.items} title="Wednesday Q&A registrations" />;
}
