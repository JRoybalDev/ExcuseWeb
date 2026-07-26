import {
  calcChecklistProgress,
  sundayStreamChecklistItems,
  weeklyRhythmDayLabels,
  weeklyRhythmDaySubtitles,
  weeklyRhythmDayValues,
  weeklyRhythmItems,
  type ChecklistItemDef,
  type WeeklyRhythmDay
} from "@fullstack-template/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { apiClient } from "../../../shared/apiClient";
import { useDraftStore } from "../../../state/draftStore";

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

  function toggleItem(key: string) {
    const next = { ...(checkedItems ?? {}), [key]: !checkedItems?.[key] };
    setCheckedItems(next);
    setActionError("");
    updateMutation.mutate({ checkedItems: next, sundayStreamChecked: streamChecked ?? {} });
  }

  function toggleStreamItem(key: string) {
    const next = { ...(streamChecked ?? {}), [key]: !streamChecked?.[key] };
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

  const allItems = weeklyRhythmDayValues.flatMap((day) => weeklyRhythmItems[day]);
  const overall = calcChecklistProgress(checkedItems ?? {}, allItems);

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
            items={weeklyRhythmItems[day]}
            checkedItems={checkedItems ?? {}}
            onToggle={toggleItem}
          />
        ))}
      </div>

      <h3 className="template-section__title">Sunday stream checklist</h3>
      <RhythmChecklistCard items={sundayStreamChecklistItems} checkedItems={streamChecked ?? {}} onToggle={toggleStreamItem} />
    </>
  );
}

function RhythmDayCard({
  day,
  items,
  checkedItems,
  onToggle
}: {
  day: WeeklyRhythmDay;
  items: ChecklistItemDef[];
  checkedItems: Record<string, boolean>;
  onToggle: (key: string) => void;
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
          <ChecklistRow key={item.key} item={item} checked={Boolean(checkedItems[item.key])} onToggle={() => onToggle(item.key)} />
        ))}
      </div>
    </div>
  );
}

function RhythmChecklistCard({
  items,
  checkedItems,
  onToggle
}: {
  items: ChecklistItemDef[];
  checkedItems: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const progress = calcChecklistProgress(checkedItems, items);

  return (
    <div className="rhythm-day">
      <div className="rhythm-minibar">
        <i style={{ width: `${progress.percent}%` }} />
      </div>
      <div className="rhythm-day__items">
        {items.map((item) => (
          <ChecklistRow key={item.key} item={item} checked={Boolean(checkedItems[item.key])} onToggle={() => onToggle(item.key)} />
        ))}
      </div>
    </div>
  );
}

function ChecklistRow({ item, checked, onToggle }: { item: ChecklistItemDef; checked: boolean; onToggle: () => void }) {
  const inputId = `chk-${item.key}`;

  return (
    <div className={checked ? "rhythm-check rhythm-check--done" : "rhythm-check"}>
      <input id={inputId} type="checkbox" checked={checked} onChange={onToggle} />
      <label htmlFor={inputId}>
        {item.label}
        {item.note ? <em>{item.note}</em> : null}
      </label>
    </div>
  );
}
