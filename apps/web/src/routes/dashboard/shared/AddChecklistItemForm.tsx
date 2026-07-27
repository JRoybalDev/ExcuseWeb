import { type FormEvent, useState } from "react";
import { FiPlus } from "react-icons/fi";

export function AddChecklistItemForm({ onAdd, isPending }: { onAdd: (label: string, note: string) => void; isPending?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!label.trim()) {
      return;
    }
    onAdd(label.trim(), note.trim());
    setLabel("");
    setNote("");
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <button type="button" className="checklist-add-trigger" onClick={() => setExpanded(true)}>
        <FiPlus aria-hidden /> Add item
      </button>
    );
  }

  return (
    <form className="checklist-item checklist-item--editing" onSubmit={submit}>
      <input className="checklist-item-edit__label" value={label} placeholder="New item" autoFocus onChange={(event) => setLabel(event.target.value)} />
      <input
        className="checklist-item-edit__note"
        value={note}
        placeholder="Description (optional)"
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="checklist-item-edit__actions">
        <button
          type="button"
          className="admin-button admin-button--secondary"
          onClick={() => {
            setExpanded(false);
            setLabel("");
            setNote("");
          }}
        >
          Cancel
        </button>
        <button type="submit" className="admin-button admin-button--primary" disabled={isPending}>
          {isPending ? "Adding..." : "Add"}
        </button>
      </div>
    </form>
  );
}
