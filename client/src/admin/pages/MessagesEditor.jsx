import { getAdminContacts } from "../../api/admin";
import { useJsonList } from "../hooks/useJsonList";
import Inbox from "../components/Inbox";

export default function MessagesEditor() {
  const page = useJsonList({ load: getAdminContacts });

  if (page.loading)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error)
    return <p className="admin-form-error">{page.error}</p>;

  return <Inbox items={page.items} title="Contact messages" />;
}
