import { useState } from "react";
import { getMenu, updateMenu } from "../../api/menu";
import { blankMenu } from "../lib/blankRecords";
import { useJsonList } from "../hooks/useJsonList";
import { validateFields } from "../lib/helpers";
import CreateForm from "../components/CreateForm";
import RowEditor from "../components/RowEditor";
import Eyebrow from "../../components/ui/Eyebrow";

export default function MenuEditor({ onNotice }) {
  const page = useJsonList({
    load: getMenu,
    save: updateMenu,
    onNotice,
  });
  const [newMenu, setNewMenu] = useState(blankMenu);
  const menu = page.items;

  const addMenuItem = () => {
    const errors = validateFields(newMenu, [
      ["label", "Menu label"],
      ["url", "URL or path"],
    ]);
    if (Object.keys(errors).length)
      return Promise.resolve({ error: Object.values(errors).join(" ") });
    return page.commit([
      ...menu,
      { label: newMenu.label.trim(), url: newMenu.url.trim() },
    ]).then((result) => {
      if (result === true) setNewMenu(blankMenu);
      return result;
    });
  };
  const saveMenuItem = (index, value) =>
    page.commit(
      menu.map((item, itemIndex) =>
        itemIndex === index ? { label: value.label, url: value.url } : item,
      ),
    );
  const deleteMenuItem = (index) =>
    page.commit(menu.filter((_, itemIndex) => itemIndex !== index));

  if (page.loading)
    return <div className="admin-loading">Loading this page from MySQL...</div>;

  if (page.error)
    return <p className="admin-form-error">{page.error}</p>;

  return (
    <>
      <CreateForm
        title="Add menu item"
        value={newMenu}
        setValue={setNewMenu}
        fields={[
          ["label", "Menu label"],
          ["url", "URL or path"],
        ]}
        onSubmit={addMenuItem}
      />
      <div className="admin-collection">
        <div className="admin-section-heading">
          <Eyebrow>Header menu</Eyebrow>
          <span>{menu.length} items</span>
        </div>
        {menu.map((item, index) => (
          <RowEditor
            key={`${item.label}-${index}`}
            item={item}
            summaryKey="label"
            fields={[
              { key: "label", label: "Label" },
              { key: "url", label: "URL or path" },
            ]}
            onSave={(value) => saveMenuItem(index, value)}
            onDelete={() => deleteMenuItem(index)}
          />
        ))}
      </div>
    </>
  );
}
