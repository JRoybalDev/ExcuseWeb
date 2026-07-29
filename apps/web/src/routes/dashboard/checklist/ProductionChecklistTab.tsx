import {
  calcChecklistProgress,
  productionChecklistGroupKey,
  productionChecklistPhaseLabels,
  productionChecklistPhaseSubtitles,
  productionChecklistPhaseValues,
  type ChecklistItem,
  type ProductionChecklistPhase
} from "@fullstack-template/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../../shared/apiClient";
import { useDraftStore } from "../../../state/draftStore";
import { AddChecklistItemForm } from "../shared/AddChecklistItemForm";
import { ChecklistItemRow } from "../shared/ChecklistItemRow";
import { RichTextArea } from "../shared/RichTextArea";

const NOTE_MAX_LENGTH_DEFAULT = 2000;
const NOTE_MAX_LENGTH_OVERRIDES: Record<string, number> = {
  "Write the 90-second hook script": 15000
};

function noteMaxLength(label: string) {
  return NOTE_MAX_LENGTH_OVERRIDES[label] ?? NOTE_MAX_LENGTH_DEFAULT;
}

export function ProductionChecklistTab() {
  const { entryId } = useParams<{ entryId: string }>();
  const queryClient = useQueryClient();
  const adminKey = useDraftStore((state) => state.adminKey);
  const [actionError, setActionError] = useState("");

  const calendar = useQuery({
    queryKey: ["calendar"],
    queryFn: () => apiClient.calendar.list(adminKey)
  });

  const checklist = useQuery({
    queryKey: ["calendar-checklist", entryId],
    queryFn: () => apiClient.calendar.getChecklist(adminKey, entryId!),
    enabled: Boolean(entryId)
  });

  const items = useQuery({
    queryKey: ["checklist-items"],
    queryFn: () => apiClient.checklistItems.list(adminKey)
  });

  const itemsByGroup = useMemo(() => {
    const map = new Map<string, ChecklistItem[]>();
    for (const item of items.data ?? []) {
      const list = map.get(item.groupKey) ?? [];
      list.push(item);
      map.set(item.groupKey, list);
    }
    return map;
  }, [items.data]);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean> | null>(null);
  const [itemNotes, setItemNotes] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    if (checkedItems === null && checklist.data) {
      setCheckedItems(checklist.data.checkedItems);
      setItemNotes(checklist.data.itemNotes);
    }
  }, [checkedItems, checklist.data]);

  const updateMutation = useMutation({
    mutationFn: (update: { checkedItems: Record<string, boolean>; itemNotes: Record<string, string> }) =>
      apiClient.calendar.updateChecklist(adminKey, entryId!, update),
    onError: (error: Error) => setActionError(error.message),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["calendar-checklist", entryId] })
  });

  const createItem = useMutation({
    mutationFn: (input: { groupKey: string; label: string; note: string }) => apiClient.checklistItems.create(adminKey, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["checklist-items"] }),
    onError: (error: Error) => setActionError(error.message)
  });

  const updateItem = useMutation({
    mutationFn: (input: { id: string; label: string; note: string }) => apiClient.checklistItems.update(adminKey, input.id, input),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["checklist-items"] }),
    onError: (error: Error) => setActionError(error.message)
  });

  const deleteItem = useMutation({
    mutationFn: (id: string) => apiClient.checklistItems.delete(adminKey, id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["checklist-items"] }),
    onError: (error: Error) => setActionError(error.message)
  });

  function toggleItem(id: string) {
    const nextChecked = { ...(checkedItems ?? {}), [id]: !checkedItems?.[id] };
    setCheckedItems(nextChecked);
    setActionError("");
    updateMutation.mutate({ checkedItems: nextChecked, itemNotes: itemNotes ?? {} });
  }

  function updateNoteLocal(id: string, value: string) {
    setItemNotes((current) => ({ ...(current ?? {}), [id]: value }));
  }

  // Takes the note value directly from the blur event rather than relying on `itemNotes`
  // having already re-rendered from the preceding onChange — those are two separate DOM
  // events, and a fast blur can otherwise fire before React flushes the change.
  function saveNote(id: string, value: string) {
    const nextNotes = { ...(itemNotes ?? {}), [id]: value };
    setItemNotes(nextNotes);
    setActionError("");
    updateMutation.mutate({ checkedItems: checkedItems ?? {}, itemNotes: nextNotes });
  }

  function clearNote(id: string) {
    saveNote(id, "");
  }

  const entry = calendar.data?.find((row) => row.id === entryId);
  const allItems = productionChecklistPhaseValues.flatMap((phase) => itemsByGroup.get(productionChecklistGroupKey(phase)) ?? []);
  const overall = calcChecklistProgress(checkedItems ?? {}, allItems);

  return (
    <>
      <Link className="admin-header__link calendar-back-link" to="/dashboard/calendar">
        <FiArrowLeft aria-hidden /> Back to Calendar
      </Link>

      <div className="admin-intro">
        <span className="admin-eyebrow">{entry ? `${entry.uploadDate} · ${entry.title || "Untitled"}` : "Production checklist"}</span>
        <h1>Video workflow</h1>
        <p>Work top to bottom for this video. Progress saves automatically.</p>
      </div>

      <div className="bar">
        <span className="schedule-save-bar__status">
          {overall.done} of {overall.total} complete ({overall.percent}%)
        </span>
      </div>

      {actionError ? <p className="admin-error">{actionError}</p> : null}

      <div className="rhythm-days checklist-phases">
        {productionChecklistPhaseValues.map((phase) => (
          <PhaseCard
            key={phase}
            phase={phase}
            items={itemsByGroup.get(productionChecklistGroupKey(phase)) ?? []}
            checkedItems={checkedItems ?? {}}
            itemNotes={itemNotes ?? {}}
            onToggle={toggleItem}
            onNoteChange={updateNoteLocal}
            onNoteBlur={saveNote}
            onNoteClear={clearNote}
            onAdd={(label, note) => createItem.mutate({ groupKey: productionChecklistGroupKey(phase), label, note })}
            onEdit={(id, label, note) => updateItem.mutate({ id, label, note })}
            onDelete={(id) => deleteItem.mutate(id)}
          />
        ))}
      </div>
    </>
  );
}

function PhaseCard({
  phase,
  items,
  checkedItems,
  itemNotes,
  onToggle,
  onNoteChange,
  onNoteBlur,
  onNoteClear,
  onAdd,
  onEdit,
  onDelete
}: {
  phase: ProductionChecklistPhase;
  items: ChecklistItem[];
  checkedItems: Record<string, boolean>;
  itemNotes: Record<string, string>;
  onToggle: (id: string) => void;
  onNoteChange: (id: string, value: string) => void;
  onNoteBlur: (id: string, value: string) => void;
  onNoteClear: (id: string) => void;
  onAdd: (label: string, note: string) => void;
  onEdit: (id: string, label: string, note: string) => void;
  onDelete: (id: string) => void;
}) {
  const progress = calcChecklistProgress(checkedItems, items);

  return (
    <div className="rhythm-day checklist-phase">
      <div className="rhythm-day__header">
        <div>
          <span className="rhythm-day__title">{productionChecklistPhaseLabels[phase]}</span>
          <span className="rhythm-day__subtitle">{productionChecklistPhaseSubtitles[phase]}</span>
        </div>
        <span className="rhythm-day__count">
          {progress.done}/{progress.total}
        </span>
      </div>
      <div className="rhythm-minibar">
        <i style={{ width: `${progress.percent}%` }} />
      </div>
      <div className="rhythm-day__items">
        {items.map((item) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            checked={Boolean(checkedItems[item.id])}
            onToggleChecked={() => onToggle(item.id)}
            onSaveEdit={(label, note) => onEdit(item.id, label, note)}
            onDelete={() => onDelete(item.id)}
            onClear={() => onNoteClear(item.id)}
            clearDisabled={!itemNotes[item.id]}
          >
            <RichTextArea
              value={itemNotes[item.id] ?? ""}
              placeholder="Add a note..."
              maxLength={noteMaxLength(item.label)}
              onChange={(html) => onNoteChange(item.id, html)}
              onBlur={(html) => onNoteBlur(item.id, html)}
            />
          </ChecklistItemRow>
        ))}
        <AddChecklistItemForm onAdd={onAdd} />
      </div>
    </div>
  );
}
