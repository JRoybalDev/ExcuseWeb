import type { ChecklistItem } from "@fullstack-template/schema";
import { type ReactNode, useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";

export function ChecklistItemRow({
  item,
  checked,
  onToggleChecked,
  onSaveEdit,
  onDelete,
  onClear,
  clearDisabled,
  children
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggleChecked: () => void;
  onSaveEdit: (label: string, note: string) => void;
  onDelete: () => void;
  onClear?: () => void;
  clearDisabled?: boolean;
  children?: ReactNode;
}) {
  const [editing, setEditing] = useState(false);
  const [labelDraft, setLabelDraft] = useState(item.label);
  const [noteDraft, setNoteDraft] = useState(item.note);
  const inputId = `chk-${item.id}`;

  useEffect(() => {
    if (!editing) {
      setLabelDraft(item.label);
      setNoteDraft(item.note);
    }
  }, [item.label, item.note, editing]);

  function save() {
    if (!labelDraft.trim()) {
      return;
    }
    onSaveEdit(labelDraft.trim(), noteDraft.trim());
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="checklist-item checklist-item--editing">
        <input
          className="checklist-item-edit__label"
          value={labelDraft}
          placeholder="Item text"
          autoFocus
          onChange={(event) => setLabelDraft(event.target.value)}
        />
        <input
          className="checklist-item-edit__note"
          value={noteDraft}
          placeholder="Description (optional)"
          onChange={(event) => setNoteDraft(event.target.value)}
        />
        <div className="checklist-item-edit__actions">
          <button type="button" className="admin-button admin-button--secondary" onClick={() => setEditing(false)}>
            Cancel
          </button>
          <button type="button" className="admin-button admin-button--primary" onClick={save}>
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={checked ? "rhythm-check rhythm-check--done checklist-item" : "rhythm-check checklist-item"}>
      <input id={inputId} type="checkbox" checked={checked} onChange={onToggleChecked} />
      <div className="checklist-item__body">
        <label htmlFor={inputId}>
          {item.label}
          {item.note ? <em>{item.note}</em> : null}
        </label>
        {children}
      </div>
      <div className="checklist-item__row-actions">
        {onClear ? (
          <button
            type="button"
            className="checklist-item__icon-btn"
            aria-label="Clear note"
            disabled={clearDisabled}
            onClick={onClear}
          >
            <FiX aria-hidden />
          </button>
        ) : (
          <>
            <button type="button" className="checklist-item__icon-btn" aria-label="Edit item" onClick={() => setEditing(true)}>
              <FiEdit2 aria-hidden />
            </button>
            <button type="button" className="checklist-item__icon-btn checklist-item__icon-btn--danger" aria-label="Delete item" onClick={onDelete}>
              <FiTrash2 aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
