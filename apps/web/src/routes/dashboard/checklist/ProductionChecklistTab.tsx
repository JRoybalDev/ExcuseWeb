import {
  calcChecklistProgress,
  productionChecklistItems,
  productionChecklistPhaseLabels,
  productionChecklistPhaseSubtitles,
  productionChecklistPhaseValues,
  type ChecklistItemDef,
  type ProductionChecklistPhase
} from "@fullstack-template/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { apiClient } from "../../../shared/apiClient";
import { useDraftStore } from "../../../state/draftStore";

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

  function toggleItem(key: string) {
    const nextChecked = { ...(checkedItems ?? {}), [key]: !checkedItems?.[key] };
    setCheckedItems(nextChecked);
    setActionError("");
    updateMutation.mutate({ checkedItems: nextChecked, itemNotes: itemNotes ?? {} });
  }

  function updateNoteLocal(key: string, value: string) {
    setItemNotes((current) => ({ ...(current ?? {}), [key]: value }));
  }

  // Takes the note value directly from the blur event rather than relying on `itemNotes`
  // having already re-rendered from the preceding onChange — those are two separate DOM
  // events, and a fast blur can otherwise fire before React flushes the change.
  function saveNote(key: string, value: string) {
    const nextNotes = { ...(itemNotes ?? {}), [key]: value };
    setItemNotes(nextNotes);
    setActionError("");
    updateMutation.mutate({ checkedItems: checkedItems ?? {}, itemNotes: nextNotes });
  }

  const entry = calendar.data?.find((row) => row.id === entryId);
  const allItems = productionChecklistPhaseValues.flatMap((phase) => productionChecklistItems[phase]);
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
            items={productionChecklistItems[phase]}
            checkedItems={checkedItems ?? {}}
            itemNotes={itemNotes ?? {}}
            onToggle={toggleItem}
            onNoteChange={updateNoteLocal}
            onNoteBlur={saveNote}
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
  onNoteBlur
}: {
  phase: ProductionChecklistPhase;
  items: ChecklistItemDef[];
  checkedItems: Record<string, boolean>;
  itemNotes: Record<string, string>;
  onToggle: (key: string) => void;
  onNoteChange: (key: string, value: string) => void;
  onNoteBlur: (key: string, value: string) => void;
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
        {items.map((item) => {
          const inputId = `pchk-${item.key}`;
          const checked = Boolean(checkedItems[item.key]);
          return (
            <div key={item.key} className={checked ? "rhythm-check rhythm-check--done checklist-item" : "rhythm-check checklist-item"}>
              <input id={inputId} type="checkbox" checked={checked} onChange={() => onToggle(item.key)} />
              <div className="checklist-item__body">
                <label htmlFor={inputId}>
                  {item.label}
                  {item.note ? <em>{item.note}</em> : null}
                </label>
                <input
                  className="checklist-item__note"
                  type="text"
                  placeholder="Add a note..."
                  value={itemNotes[item.key] ?? ""}
                  onChange={(event) => onNoteChange(item.key, event.target.value)}
                  onBlur={(event) => onNoteBlur(item.key, event.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
