import { useEffect, useState } from "react";
import {
  getAdminContacts,
  markAdminContactRead,
} from "../../api/admin";
import { apiError, sessionExpired } from "../lib/helpers";
import Inbox from "../components/Inbox";

export default function MessagesEditor() {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getAdminContacts()
      .then((response) => {
        if (active) setItems(response.data);
      })
      .catch((cause) => {
        if (!active) return;
        if (cause.response?.status === 401) return sessionExpired();
        setError(apiError(cause, "Contact submissions could not be loaded."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function openSubmission(item) {
    setError("");
    try {
      if (item.status !== "read") {
        await markAdminContactRead(item.id);
        const updated = { ...item, status: "read" };
        setItems((current) =>
          current.map((record) => (record.id === item.id ? updated : record)),
        );
        setSelectedItem(updated);
      } else {
        setSelectedItem(item);
      }
    } catch (cause) {
      if (cause.response?.status === 401) return sessionExpired();
      setError(apiError(cause, "This submission could not be marked as read."));
    }
  }

  if (loading)
    return <div className="admin-loading">Loading contact submissions...</div>;

  if (error && items.length === 0)
    return <p className="admin-form-error">{error}</p>;

  return (
    <>
      {error && <p className="admin-form-error">{error}</p>}
      <Inbox
        items={items}
        title="Contact form submissions"
        variant="contact"
        selectedItem={selectedItem}
        onSelectItem={openSubmission}
        onBack={() => setSelectedItem(null)}
      />
    </>
  );
}
