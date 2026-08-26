import {
  scheduleDayLabels,
  scheduleDayValues,
  scheduleEntryTypeLabels,
  scheduleEntryTypeValues,
  type ScheduleDay,
  type ScheduleEntry,
  type ScheduleEntryType
} from "@fullstack-template/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";
import { apiClient } from "../../shared/apiClient";
import { useDraftStore } from "../../state/draftStore";
import { SelectDropdown } from "../../shared/SelectDropdown";

type DraftEntry = {
  dayOfWeek: ScheduleDay;
  time: string;
  type: ScheduleEntryType;
  title: string;
  thumbnailUrl: string;
  uploadId: string | null;
};

const emptyDraft: DraftEntry = { dayOfWeek: "mon", time: "", type: "video", title: "", thumbnailUrl: "", uploadId: null };

function entryToDraft(entry: ScheduleEntry): DraftEntry {
  return { dayOfWeek: entry.dayOfWeek, time: entry.time, type: entry.type, title: entry.title, thumbnailUrl: entry.thumbnailUrl, uploadId: entry.uploadId };
}

function sortByDay(rows: ScheduleEntry[]) {
  return [...rows].sort((a, b) => {
    const dayDiff = scheduleDayValues.indexOf(a.dayOfWeek) - scheduleDayValues.indexOf(b.dayOfWeek);
    return dayDiff !== 0 ? dayDiff : a.time.localeCompare(b.time);
  });
}

function groupByDay(rows: ScheduleEntry[]): Array<{ dayOfWeek: ScheduleDay; entries: ScheduleEntry[] }> {
  const groups: Array<{ dayOfWeek: ScheduleDay; entries: ScheduleEntry[] }> = [];

  for (const entry of rows) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.dayOfWeek === entry.dayOfWeek) {
      lastGroup.entries.push(entry);
    } else {
      groups.push({ dayOfWeek: entry.dayOfWeek, entries: [entry] });
    }
  }

  return groups;
}

export function ScheduleTab() {
  const queryClient = useQueryClient();
  const adminKey = useDraftStore((state) => state.adminKey);

  const schedule = useQuery({
    queryKey: ["schedule"],
    queryFn: () => apiClient.schedule.list()
  });

  const [rows, setRows] = useState<ScheduleEntry[] | null>(null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [addingEntry, setAddingEntry] = useState(false);
  const [draftEntry, setDraftEntry] = useState<DraftEntry>(emptyDraft);

  useEffect(() => {
    if (rows === null && schedule.data) {
      setRows(sortByDay(schedule.data));
    }
  }, [rows, schedule.data]);

  useEffect(() => {
    function warnOnUnload(event: BeforeUnloadEvent) {
      if (dirtyIds.size > 0) {
        event.preventDefault();
      }
    }

    window.addEventListener("beforeunload", warnOnUnload);
    return () => window.removeEventListener("beforeunload", warnOnUnload);
  }, [dirtyIds]);

  function invalidateSchedule() {
    void queryClient.invalidateQueries({ queryKey: ["schedule"] });
  }

  function markDirty(id: string) {
    setSaveMessage("");
    setDirtyIds((current) => new Set(current).add(id));
  }

  function updateRowField(id: string, changes: Partial<ScheduleEntry>) {
    setRows((current) => current?.map((row) => (row.id === id ? { ...row, ...changes } : row)) ?? current);
    markDirty(id);
  }

  function toggleRowEditing(id: string) {
    setEditingIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const createEntry = useMutation({
    mutationFn: (input: DraftEntry) => apiClient.schedule.create(adminKey, input),
    onSuccess: (created) => {
      setActionError("");
      setAddingEntry(false);
      setDraftEntry(emptyDraft);
      setRows((current) => sortByDay([...(current ?? []), created]));
      invalidateSchedule();
    },
    onError: (error: Error) => setActionError(error.message)
  });

  const deleteEntry = useMutation({
    mutationFn: (id: string) => apiClient.schedule.delete(adminKey, id),
    onSuccess: (_deleted, id) => {
      setActionError("");
      setRows((current) => current?.filter((row) => row.id !== id) ?? current);
      setDirtyIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      setEditingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
      invalidateSchedule();
    },
    onError: (error: Error) => setActionError(error.message)
  });

  const uploadThumbnail = useMutation({
    mutationFn: (file: File) => apiClient.uploads.create(adminKey, file),
    onError: (error: Error) => setActionError(error.message)
  });

  async function handleRowThumbnail(id: string, file: File) {
    const upload = await uploadThumbnail.mutateAsync(file);
    updateRowField(id, { thumbnailUrl: upload.thumbnailUrl || upload.url, uploadId: upload.id });
  }

  async function saveDraftThumbnail(file: File) {
    const upload = await uploadThumbnail.mutateAsync(file);
    setDraftEntry((current) => ({ ...current, thumbnailUrl: upload.thumbnailUrl || upload.url, uploadId: upload.id }));
  }

  function submitDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draftEntry.title.trim()) {
      return;
    }
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
        return row ? apiClient.schedule.update(adminKey, id, entryToDraft(row)) : Promise.resolve(null);
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
      setEditingIds((current) => {
        const next = new Set(current);
        for (const id of idsToSave) {
          next.delete(id);
        }
        return next;
      });
      invalidateSchedule();
    }
  }

  const entries = rows ?? [];
  const hasUnsavedChanges = dirtyIds.size > 0;

  return (
    <>
      <div className="admin-intro">
        <span className="admin-eyebrow">Placeholder site — one section live</span>
        <h1>Weekly schedule</h1>
        <p>The site countdown updates automatically. Everything else on the dashboard is hidden until the full site launches.</p>
      </div>

      <div className="schedule-editor-card">
        {groupByDay(entries).map((group) => (
          <div key={group.dayOfWeek} className="schedule-day-group">
            <h3 className="schedule-day-group__heading">{scheduleDayLabels[group.dayOfWeek]}</h3>
            {group.entries.map((entry) => (
              <ScheduleRow
                key={entry.id}
                entry={entry}
                isEditing={editingIds.has(entry.id)}
                isDirty={dirtyIds.has(entry.id)}
                onToggleEdit={() => toggleRowEditing(entry.id)}
                onChangeDay={(dayOfWeek) => updateRowField(entry.id, { dayOfWeek })}
                onChangeTime={(time) => updateRowField(entry.id, { time })}
                onChangeType={(type) => updateRowField(entry.id, { type })}
                onChangeTitle={(title) => updateRowField(entry.id, { title })}
                onUploadThumbnail={(file) => void handleRowThumbnail(entry.id, file)}
                onDelete={() => deleteEntry.mutate(entry.id)}
              />
            ))}
          </div>
        ))}

        {addingEntry ? (
          <form className="schedule-add-form" onSubmit={submitDraft}>
            <div className="schedule-add-form__row">
              <label className="schedule-add-form__field schedule-add-form__field--day">
                <span>Day</span>
                <SelectDropdown
                  value={draftEntry.dayOfWeek}
                  options={scheduleDayValues.map((day) => ({ value: day, label: scheduleDayLabels[day] }))}
                  onChange={(dayOfWeek) => setDraftEntry((c) => ({ ...c, dayOfWeek }))}
                />
              </label>
              <label className="schedule-add-form__field schedule-add-form__field--time">
                <span>Time</span>
                <input
                  type="time"
                  value={draftEntry.time}
                  onChange={(event) => setDraftEntry((c) => ({ ...c, time: event.target.value }))}
                />
              </label>
              <label className="schedule-add-form__field schedule-add-form__field--type">
                <span>Type</span>
                <SelectDropdown
                  value={draftEntry.type}
                  options={scheduleEntryTypeValues.map((type) => ({ value: type, label: scheduleEntryTypeLabels[type] }))}
                  onChange={(type) => setDraftEntry((c) => ({ ...c, type }))}
                />
              </label>
            </div>
            <label className="schedule-add-form__field schedule-add-form__field--title">
              <span>Title</span>
              <input
                placeholder="Episode title"
                value={draftEntry.title}
                onChange={(event) => setDraftEntry((c) => ({ ...c, title: event.target.value }))}
              />
            </label>
            <div className="schedule-add-form__footer">
              <div className="schedule-add-form__field schedule-add-form__field--thumb">
                <span>Thumbnail</span>
                <ThumbnailSlot url={draftEntry.thumbnailUrl} onUpload={(file) => void saveDraftThumbnail(file)} />
              </div>
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
                  {createEntry.isPending ? "Adding..." : "Add entry"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <button className="admin-button admin-button--secondary" type="button" onClick={() => setAddingEntry(true)}>
            <FiPlus aria-hidden /> Add entry
          </button>
        )}

        {actionError ? <p className="admin-error">{actionError}</p> : null}

        <div className="schedule-save-bar">
          <span className="schedule-save-bar__status">
            {isSaving ? "Saving..." : hasUnsavedChanges ? "You have unsaved changes." : saveMessage || "All changes saved."}
          </span>
          <button className="admin-button admin-button--primary" type="button" disabled={!hasUnsavedChanges || isSaving} onClick={() => void saveAllChanges()}>
            <FiSave aria-hidden /> {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </>
  );
}

function formatTimeDisplay(time: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) {
    return "No time set";
  }

  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function ScheduleRow({
  entry,
  isEditing,
  isDirty,
  onToggleEdit,
  onChangeDay,
  onChangeTime,
  onChangeType,
  onChangeTitle,
  onUploadThumbnail,
  onDelete
}: {
  entry: ScheduleEntry;
  isEditing: boolean;
  isDirty: boolean;
  onToggleEdit: () => void;
  onChangeDay: (day: ScheduleDay) => void;
  onChangeTime: (time: string) => void;
  onChangeType: (type: ScheduleEntryType) => void;
  onChangeTitle: (title: string) => void;
  onUploadThumbnail: (file: File) => void;
  onDelete: () => void;
}) {
  if (!isEditing) {
    return (
      <div className="schedule-row schedule-row--preview">
        <span className="schedule-row__day-badge">{scheduleDayLabels[entry.dayOfWeek]}</span>
        <span className="schedule-row__preview-cell">{formatTimeDisplay(entry.time)}</span>
        <span className="schedule-row__preview-cell">{scheduleEntryTypeLabels[entry.type]}</span>
        <span className="schedule-row__preview-title">
          <span className="schedule-row__preview-title-text">{entry.title || "Untitled"}</span>
          {isDirty ? <span className="schedule-row__unsaved">Unsaved</span> : null}
        </span>
        <div className="schedule-row__preview-thumb">{entry.thumbnailUrl ? <img src={entry.thumbnailUrl} alt="" /> : <span>Img</span>}</div>
        <div className="schedule-row__preview-actions">
          <button className="schedule-row__edit" type="button" aria-label="Edit entry" onClick={onToggleEdit}>
            <FiEdit2 aria-hidden />
          </button>
          <button className="schedule-row__delete" type="button" aria-label="Delete entry" onClick={onDelete}>
            <FiTrash2 aria-hidden />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-row">
      <SelectDropdown
        className="schedule-row__day"
        value={entry.dayOfWeek}
        options={scheduleDayValues.map((day) => ({ value: day, label: scheduleDayLabels[day] }))}
        onChange={onChangeDay}
      />
      <input type="time" value={entry.time} onChange={(event) => onChangeTime(event.target.value)} />
      <SelectDropdown
        value={entry.type}
        options={scheduleEntryTypeValues.map((type) => ({ value: type, label: scheduleEntryTypeLabels[type] }))}
        onChange={onChangeType}
      />
      <input value={entry.title} onChange={(event) => onChangeTitle(event.target.value)} placeholder="Title" />
      <ThumbnailSlot url={entry.thumbnailUrl} onUpload={onUploadThumbnail} compact />
      <button className="schedule-row__done" type="button" aria-label="Done editing" onClick={onToggleEdit}>
        Done
      </button>
    </div>
  );
}

function ThumbnailSlot({ url, onUpload, compact }: { url: string; onUpload: (file: File) => void; compact?: boolean }) {
  const inputId = `thumb-${Math.random().toString(36).slice(2)}`;

  return (
    <label htmlFor={inputId} className={compact ? "thumbnail-slot thumbnail-slot--compact" : "thumbnail-slot"}>
      {url ? <img src={url} alt="" /> : <span>Img</span>}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onUpload(file);
          }
          event.target.value = "";
        }}
      />
    </label>
  );
}
