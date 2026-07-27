import {
  calcChecklistProgress,
  sundayStreamGroupKey,
  weeklyRhythmDayLabels,
  weeklyRhythmDaySubtitles,
  weeklyRhythmDayValues,
  weeklyRhythmGroupKey,
  type ChecklistItem,
  type WeeklyRhythmDay
} from "@fullstack-template/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { apiClient } from "../../../shared/apiClient";
import { useDraftStore } from "../../../state/draftStore";
import { AddChecklistItemForm } from "../shared/AddChecklistItemForm";
import { ChecklistItemRow } from "../shared/ChecklistItemRow";

function mostRecentSaturdayIso(): string {
  const now = new Date();
  const diff = (now.getDay() + 1) % 7;
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function WeeklyRhythmTab() {
  const queryClient = useQueryClient();
  const adminKey = useDraftStore((state) => state.adminKey);
  const [actionError, setActionError] = useState("");

  const rhythm = useQuery({
    queryKey: ["weekly-rhythm"],
    queryFn: () => apiClient.weeklyRhythm.get(adminKey)
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
  const [streamChecked, setStreamChecked] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    if (checkedItems === null && rhythm.data) {
      setCheckedItems(rhythm.data.checkedItems);
      setStreamChecked(rhythm.data.sundayStreamChecked);
    }
  }, [checkedItems, rhythm.data]);

  const updateMutation = useMutation({
    mutationFn: (update: { checkedItems: Record<string, boolean>; sundayStreamChecked: Record<string, boolean> }) =>
      apiClient.weeklyRhythm.update(adminKey, update),
    onError: (error: Error) => setActionError(error.message)
  });

  const resetMutation = useMutation({
    mutationFn: () => apiClient.weeklyRhythm.reset(adminKey, mostRecentSaturdayIso()),
    onSuccess: (row) => {
      setActionError("");
      setCheckedItems(row.checkedItems);
      setStreamChecked(row.sundayStreamChecked);
      void queryClient.invalidateQueries({ queryKey: ["weekly-rhythm"] });
    },
    onError: (error: Error) => setActionError(error.message)
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
    const next = { ...(checkedItems ?? {}), [id]: !checkedItems?.[id] };
    setCheckedItems(next);
    setActionError("");
    updateMutation.mutate({ checkedItems: next, sundayStreamChecked: streamChecked ?? {} });
  }

  function toggleStreamItem(id: string) {
    const next = { ...(streamChecked ?? {}), [id]: !streamChecked?.[id] };
    setStreamChecked(next);
    setActionError("");
    updateMutation.mutate({ checkedItems: checkedItems ?? {}, sundayStreamChecked: next });
  }

  function newWeek() {
    if (!window.confirm("Reset the weekly rhythm and stream checklist for a new week? This clears every checked box.")) {
      return;
    }
    resetMutation.mutate();
  }

  const allItems = weeklyRhythmDayValues.flatMap((day) => itemsByGroup.get(weeklyRhythmGroupKey(day)) ?? []);
  const overall = calcChecklistProgress(checkedItems ?? {}, allItems);
  const streamItems = itemsByGroup.get(sundayStreamGroupKey) ?? [];

  return (
    <>
      <div className="admin-intro">
        <span className="admin-eyebrow">Your repeating week, day by day</span>
        <h1>Weekly rhythm</h1>
        <p>Run it every Monday. Resets are explicit — hit "New week" when you start the next cycle.</p>
      </div>

      <div className="bar">
        <button className="admin-button admin-button--secondary" type="button" disabled={resetMutation.isPending} onClick={newWeek}>
          <FiRefreshCw aria-hidden /> {resetMutation.isPending ? "Resetting..." : "New week"}
        </button>
        <span className="schedule-save-bar__status">
          {overall.done} of {overall.total} complete ({overall.percent}%)
        </span>
      </div>

      {actionError ? <p className="admin-error">{actionError}</p> : null}

      <div className="rhythm-days">
        {weeklyRhythmDayValues.map((day) => (
          <RhythmDayCard
            key={day}
            day={day}
            items={itemsByGroup.get(weeklyRhythmGroupKey(day)) ?? []}
            checkedItems={checkedItems ?? {}}
            onToggle={toggleItem}
            onAdd={(label, note) => createItem.mutate({ groupKey: weeklyRhythmGroupKey(day), label, note })}
            onEdit={(id, label, note) => updateItem.mutate({ id, label, note })}
            onDelete={(id) => deleteItem.mutate(id)}
          />
        ))}
      </div>

      <h3 className="template-section__title">Sunday stream checklist</h3>
      <div className="rhythm-day">
        <div className="rhythm-minibar">
          <i style={{ width: `${calcChecklistProgress(streamChecked ?? {}, streamItems).percent}%` }} />
        </div>
        <div className="rhythm-day__items">
          {streamItems.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              checked={Boolean(streamChecked?.[item.id])}
              onToggleChecked={() => toggleStreamItem(item.id)}
              onSaveEdit={(label, note) => updateItem.mutate({ id: item.id, label, note })}
              onDelete={() => deleteItem.mutate(item.id)}
            />
          ))}
          <AddChecklistItemForm onAdd={(label, note) => createItem.mutate({ groupKey: sundayStreamGroupKey, label, note })} isPending={createItem.isPending} />
        </div>
      </div>
    </>
  );
}

function RhythmDayCard({
  day,
  items,
  checkedItems,
  onToggle,
  onAdd,
  onEdit,
  onDelete
}: {
  day: WeeklyRhythmDay;
  items: ChecklistItem[];
  checkedItems: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAdd: (label: string, note: string) => void;
  onEdit: (id: string, label: string, note: string) => void;
  onDelete: (id: string) => void;
}) {
  const progress = calcChecklistProgress(checkedItems, items);

  return (
    <div className="rhythm-day">
      <div className="rhythm-day__header">
        <div>
          <span className="rhythm-day__title">{weeklyRhythmDayLabels[day]}</span>
          <span className="rhythm-day__subtitle">{weeklyRhythmDaySubtitles[day]}</span>
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
          />
        ))}
        <AddChecklistItemForm onAdd={onAdd} />
      </div>
    </div>
  );
}
