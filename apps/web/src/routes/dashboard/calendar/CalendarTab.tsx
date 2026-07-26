import {
  calendarPriorityLabels,
  calendarPriorityValues,
  calendarSlotLabels,
  calendarSlotValues,
  calendarStatusLabels,
  calendarStatusValues,
  computeCalendarStats,
  type CalendarEntry,
  type CalendarEntryDraftInput,
  type CalendarPriority,
  type CalendarSlot,
  type CalendarStatus
} from "@fullstack-template/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { FiCheckSquare, FiDownload, FiPlus, FiSave, FiTrash2, FiZap } from "react-icons/fi";
import { Link } from "react-router-dom";
import { apiClient } from "../../../shared/apiClient";
import { useDraftStore } from "../../../state/draftStore";
import { SelectDropdown } from "../shared/SelectDropdown";
import { calendarEntriesToCsv, downloadCalendarCsv } from "./calendarCsv";

type DraftEntry = CalendarEntryDraftInput;

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const emptyDraft: DraftEntry = {
  uploadDate: todayIso(),
  slot: "saturday_main",
  title: "",
  priority: "normal",
  status: "idea",
  packagingDone: false,
  expectedClipCount: 0,
  notes: "",
  titleCandidates: []
};

function entryToDraft(entry: CalendarEntry): DraftEntry {
  return {
    uploadDate: entry.uploadDate,
    slot: entry.slot,
    title: entry.title,
    priority: entry.priority,
    status: entry.status,
    packagingDone: entry.packagingDone,
    expectedClipCount: entry.expectedClipCount,
    notes: entry.notes,
    titleCandidates: entry.titleCandidates
  };
}

function sortByDate(rows: CalendarEntry[]) {
  return [...rows].sort((a, b) => a.uploadDate.localeCompare(b.uploadDate));
}

function daysUntil(iso: string): number {
  const a = new Date(`${iso}T12:00:00`);
  const b = new Date(`${todayIso()}T12:00:00`);
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function CalendarTab() {
  const queryClient = useQueryClient();
  const adminKey = useDraftStore((state) => state.adminKey);

  const calendar = useQuery({
    queryKey: ["calendar"],
    queryFn: () => apiClient.calendar.list(adminKey)
  });

  const [rows, setRows] = useState<CalendarEntry[] | null>(null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [addingEntry, setAddingEntry] = useState(false);
  const [draftEntry, setDraftEntry] = useState<DraftEntry>(emptyDraft);
  const [autoFillCount, setAutoFillCount] = useState(8);

  useEffect(() => {
    if (rows === null && calendar.data) {
      setRows(sortByDate(calendar.data));
    }
  }, [rows, calendar.data]);

  useEffect(() => {
    function warnOnUnload(event: BeforeUnloadEvent) {
      if (dirtyIds.size > 0) {
        event.preventDefault();
      }
    }
    window.addEventListener("beforeunload", warnOnUnload);
    return () => window.removeEventListener("beforeunload", warnOnUnload);
  }, [dirtyIds]);

  function invalidateCalendar() {
    void queryClient.invalidateQueries({ queryKey: ["calendar"] });
  }

  function markDirty(id: string) {
    setSaveMessage("");
    setDirtyIds((current) => new Set(current).add(id));
  }

  function updateRowField(id: string, changes: Partial<CalendarEntry>) {
    setRows((current) => current?.map((row) => (row.id === id ? { ...row, ...changes } : row)) ?? current);
    markDirty(id);
  }

  const createEntry = useMutation({
    mutationFn: (input: DraftEntry) => apiClient.calendar.create(adminKey, input),
    onSuccess: (created) => {
      setActionError("");
      setAddingEntry(false);
      setDraftEntry(emptyDraft);
      setRows((current) => sortByDate([...(current ?? []), created]));
      invalidateCalendar();
    },
    onError: (error: Error) => setActionError(error.message)
  });

  const deleteEntry = useMutation({
    mutationFn: (id: string) => apiClient.calendar.delete(adminKey, id),
    onSuccess: (_deleted, id) => {
      setActionError("");
      setRows((current) => current?.filter((row) => row.id !== id) ?? current);
      setDirtyIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      invalidateCalendar();
    },
    onError: (error: Error) => setActionError(error.message)
  });

  const autoFill = useMutation({
    mutationFn: (count: number) => apiClient.calendar.autoFill(adminKey, { count }),
    onSuccess: (result) => {
      setActionError("");
      setRows((current) => sortByDate([...(current ?? []), ...result.created]));
      invalidateCalendar();
    },
    onError: (error: Error) => setActionError(error.message)
  });

  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createEntry.mutate(draftEntry);
  }

  async function saveAllChanges() {
    if (!rows || dirtyIds.size === 0 || isSaving) {
      return;
    }

    setIsSaving(true);
    setActionError("");
    setSaveMessage("");

    const idsToSave = [...dirtyIds];
    const results = await Promise.allSettled(
      idsToSave.map((id) => {
        const row = rows.find((candidate) => candidate.id === id);
        return row ? apiClient.calendar.update(adminKey, id, entryToDraft(row)) : Promise.resolve(null);
      })
    );

    const failedIds: string[] = [];
    let firstError = "";

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        failedIds.push(idsToSave[index]!);
        firstError = firstError || (result.reason instanceof Error ? result.reason.message : "Failed to save entry.");
      }
    });

    setDirtyIds(new Set(failedIds));
    setIsSaving(false);

    if (failedIds.length > 0) {
      setActionError(firstError);
    } else {
      setSaveMessage("Saved.");
      invalidateCalendar();
    }
  }

  const entries = rows ?? [];
  const hasUnsavedChanges = dirtyIds.size > 0;
  const stats = computeCalendarStats(entries, todayIso());

  return (
    <>
      <div className="admin-intro">
        <span className="admin-eyebrow">Your live upload plan</span>
        <h1>Content calendar</h1>
        <p>Track each video's production status. Backlog and deadline warnings are automatic.</p>
      </div>

      <div className="statcards">
        <div className={`statcard ${stats.finishedBacklog >= 2 ? "statcard--good" : stats.finishedBacklog === 1 ? "statcard--warn" : "statcard--bad"}`}>
          <b>{stats.finishedBacklog}</b>
          <span>Finished backlog{stats.finishedBacklog >= 2 ? " — Wednesday unlocked" : " — target 2"}</span>
        </div>
        <div className="statcard">
          <b>{stats.videosPlanned}</b>
          <span>Videos planned</span>
        </div>
        <div className={`statcard ${stats.daysUntilNext !== null && stats.daysUntilNext <= 3 ? "statcard--warn" : ""}`}>
          <b>{stats.daysUntilNext === null ? "—" : stats.daysUntilNext === 0 ? "Today" : `${stats.daysUntilNext}d`}</b>
          <span>{stats.daysUntilNext !== null ? `Until next: ${stats.nextTitle || "untitled"}` : "Nothing scheduled"}</span>
        </div>
        <div className={`statcard ${stats.overdueCount > 0 ? "statcard--bad" : ""}`}>
          <b>{stats.overdueCount}</b>
          <span>Past date, not published</span>
        </div>
        <div className={`statcard ${stats.packagingNotDoneCount > 0 ? "statcard--warn" : ""}`}>
          <b>{stats.packagingNotDoneCount}</b>
          <span>Packaging not done (≤7 days out)</span>
        </div>
      </div>

      <div className="calendar-toolbar">
        {addingEntry ? (
          <form className="schedule-add-form calendar-add-form" onSubmit={submitDraft}>
            <div className="schedule-add-form__row calendar-add-form__row">
              <label className="schedule-add-form__field">
                <span>Upload date</span>
                <input type="date" value={draftEntry.uploadDate} onChange={(event) => setDraftEntry((c) => ({ ...c, uploadDate: event.target.value }))} />
              </label>
              <label className="schedule-add-form__field">
                <span>Slot</span>
                <SelectDropdown
                  value={draftEntry.slot as CalendarSlot}
                  options={calendarSlotValues.map((slot) => ({ value: slot, label: calendarSlotLabels[slot] }))}
                  onChange={(slot) => setDraftEntry((c) => ({ ...c, slot }))}
                />
              </label>
              <label className="schedule-add-form__field">
                <span>Priority</span>
                <SelectDropdown
                  value={draftEntry.priority as CalendarPriority}
                  options={calendarPriorityValues.map((priority) => ({ value: priority, label: calendarPriorityLabels[priority] }))}
                  onChange={(priority) => setDraftEntry((c) => ({ ...c, priority }))}
                />
              </label>
            </div>
            <label className="schedule-add-form__field schedule-add-form__field--title">
              <span>Title / idea</span>
              <input
                placeholder="e.g. The Game Says This Park Is Impossible"
                value={draftEntry.title}
                onChange={(event) => setDraftEntry((c) => ({ ...c, title: event.target.value }))}
              />
            </label>
            <div className="schedule-add-form__footer">
              <div />
              <div className="schedule-add-form__actions">
                <button
                  className="admin-button admin-button--secondary"
                  type="button"
                  onClick={() => {
                    setAddingEntry(false);
                    setDraftEntry(emptyDraft);
                  }}
                >
                  Cancel
                </button>
                <button className="admin-button admin-button--primary" type="submit" disabled={createEntry.isPending}>
                  {createEntry.isPending ? "Adding..." : "Add video"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button className="admin-button admin-button--secondary" type="button" onClick={() => setAddingEntry(true)}>
            <FiPlus aria-hidden /> Add a video
          </button>
        )}

        <div className="calendar-toolbar__right">
          <input
            className="calendar-autofill-count"
            type="number"
            min={1}
            max={20}
            value={autoFillCount}
            onChange={(event) => setAutoFillCount(Number(event.target.value) || 1)}
          />
          <button className="admin-button admin-button--secondary" type="button" disabled={autoFill.isPending} onClick={() => autoFill.mutate(autoFillCount)}>
            <FiZap aria-hidden /> {autoFill.isPending ? "Filling..." : `Auto-fill next ${autoFillCount} Saturdays`}
          </button>
          <button
            className="admin-button admin-button--secondary"
            type="button"
            disabled={entries.length === 0}
            onClick={() => downloadCalendarCsv(entries)}
          >
            <FiDownload aria-hidden /> Export CSV
          </button>
        </div>
      </div>

      {actionError ? <p className="admin-error">{actionError}</p> : null}

      <div className="calendar-table-wrap">
        {entries.length === 0 ? (
          <p className="admin-eyebrow">No videos yet — add one above, or auto-fill the next few Saturdays.</p>
        ) : (
          <table className="calendar-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Slot</th>
                <th>Title / idea</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Pkg</th>
                <th>Clips</th>
                <th>Notes</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <CalendarRow key={entry.id} entry={entry} isDirty={dirtyIds.has(entry.id)} onChange={(changes) => updateRowField(entry.id, changes)} onDelete={() => deleteEntry.mutate(entry.id)} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="schedule-save-bar">
        <span className="schedule-save-bar__status">
          {isSaving ? "Saving..." : hasUnsavedChanges ? "You have unsaved changes." : saveMessage || "All changes saved."}
        </span>
        <button className="admin-button admin-button--primary" type="button" disabled={!hasUnsavedChanges || isSaving} onClick={() => void saveAllChanges()}>
          <FiSave aria-hidden /> {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>

      <div className="note">
        Backlog is the number that protects you. Two finished videos (Edited or Scheduled) means a DLC drop or a bad week never breaks the
        Saturday streak — and it's the condition for turning on Wednesday uploads.
      </div>
    </>
  );
}

function CalendarRow({
  entry,
  isDirty,
  onChange,
  onDelete
}: {
  entry: CalendarEntry;
  isDirty: boolean;
  onChange: (changes: Partial<CalendarEntry>) => void;
  onDelete: () => void;
}) {
  const dl = daysUntil(entry.uploadDate);
  let rowClass = "";
  if (entry.status === "published") {
    rowClass = "calendar-row--done";
  } else if (dl < 0) {
    rowClass = "calendar-row--late";
  } else if (dl <= 3 && entry.status !== "scheduled") {
    rowClass = "calendar-row--late";
  } else if (dl <= 7) {
    rowClass = "calendar-row--soon";
  }

  return (
    <tr className={rowClass}>
      <td>
        <input type="date" value={entry.uploadDate} onChange={(event) => onChange({ uploadDate: event.target.value })} />
      </td>
      <td>
        <SelectDropdown
          value={entry.slot}
          options={calendarSlotValues.map((slot) => ({ value: slot, label: calendarSlotLabels[slot] }))}
          onChange={(slot) => onChange({ slot })}
        />
      </td>
      <td>
        <input value={entry.title} placeholder="untitled" onChange={(event) => onChange({ title: event.target.value })} />
        {isDirty ? <span className="schedule-row__unsaved">Unsaved</span> : null}
      </td>
      <td>
        <SelectDropdown
          value={entry.priority}
          options={calendarPriorityValues.map((priority) => ({ value: priority, label: calendarPriorityLabels[priority] }))}
          onChange={(priority) => onChange({ priority })}
        />
      </td>
      <td>
        <SelectDropdown
          value={entry.status}
          options={calendarStatusValues.map((status) => ({ value: status, label: calendarStatusLabels[status] }))}
          onChange={(status) => onChange({ status: status as CalendarStatus })}
        />
      </td>
      <td className="calendar-table__pkg">
        <input type="checkbox" checked={entry.packagingDone} onChange={(event) => onChange({ packagingDone: event.target.checked })} />
      </td>
      <td>
        <input
          type="number"
          min={0}
          className="calendar-table__clips"
          value={entry.expectedClipCount}
          onChange={(event) => onChange({ expectedClipCount: Number(event.target.value) || 0 })}
        />
      </td>
      <td>
        <input value={entry.notes} onChange={(event) => onChange({ notes: event.target.value })} />
      </td>
      <td className="calendar-table__actions">
        <Link className="schedule-row__edit" to={`/dashboard/calendar/${entry.id}/checklist`} aria-label="Open production checklist">
          <FiCheckSquare aria-hidden />
        </Link>
        <button className="schedule-row__delete" type="button" aria-label="Delete video" onClick={onDelete}>
          <FiTrash2 aria-hidden />
        </button>
      </td>
    </tr>
  );
}
